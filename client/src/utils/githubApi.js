import { apiCache } from './apiCache.js';

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const CACHE_DURATION = {
  TRENDING: 15 * 60 * 1000,    // 15 minutes for trending repos
  SEARCH: 10 * 60 * 1000,     // 10 minutes for search results
  REPO_DETAILS: 30 * 60 * 1000 // 30 minutes for repository details
};

// Rate limiting configuration
const RATE_LIMIT = {
  requests: 0,
  resetTime: 0,
  limit: 60 // Default GitHub rate limit for unauthenticated requests
};

// Check if we're hitting rate limits
function checkRateLimit() {
  const now = Date.now();
  if (now > RATE_LIMIT.resetTime) {
    RATE_LIMIT.requests = 0;
    RATE_LIMIT.resetTime = now + 60 * 60 * 1000; // Reset every hour
  }
  
  return RATE_LIMIT.requests < RATE_LIMIT.limit;
}

// Update rate limit info from response headers
function updateRateLimit(response) {
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const resetTime = response.headers.get('X-RateLimit-Reset');
  
  if (remaining) RATE_LIMIT.requests = RATE_LIMIT.limit - parseInt(remaining);
  if (resetTime) RATE_LIMIT.resetTime = parseInt(resetTime) * 1000;
}

// Generic GitHub API request with caching and rate limiting
async function githubApiRequest(endpoint, cacheKey, cacheDuration = CACHE_DURATION.SEARCH) {
  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;
  
  // Check rate limit
  if (!checkRateLimit()) {
    throw new Error('GitHub API rate limit exceeded. Please try again later.');
  }
  
  const url = `${GITHUB_API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Timeline-App/1.0'
      }
    });
    
    // Update rate limit tracking
    updateRateLimit(response);
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded');
      } else if (response.status === 404) {
        throw new Error('Repository not found');
      } else {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    
    // Cache the result
    apiCache.set(cacheKey, data, cacheDuration);
    
    return data;
  } catch (error) {
    console.error('GitHub API request failed:', error);
    throw error;
  }
}

// Fetch trending repositories
export async function fetchTrendingRepositories(language = '', timeframe = 'daily', limit = 10) {
  const cacheKey = `trending_${language}_${timeframe}_${limit}`;
  
  try {
    // Calculate date range based on timeframe
    const now = new Date();
    let dateQuery = '';
    
    switch (timeframe) {
      case 'daily':
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        dateQuery = `created:>${yesterday.toISOString().split('T')[0]}`;
        break;
      case 'weekly':
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateQuery = `pushed:>${lastWeek.toISOString().split('T')[0]}`;
        break;
      case 'monthly':
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateQuery = `pushed:>${lastMonth.toISOString().split('T')[0]}`;
        break;
      default:
        dateQuery = `pushed:>${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`;
    }
    
    // Build search query
    const queryParts = [];
    if (language) queryParts.push(`language:${language}`);
    queryParts.push(dateQuery);
    queryParts.push('stars:>10'); // Minimum quality threshold
    
    const query = queryParts.join(' ');
    const endpoint = `/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit}`;
    
    const response = await githubApiRequest(endpoint, cacheKey, CACHE_DURATION.TRENDING);
    return response.items || [];
  } catch (error) {
    console.warn(`Failed to fetch trending repositories for ${language}:`, error);
    return [];
  }
}

// Search repositories with advanced filters
export async function searchRepositories(options = {}) {
  const {
    query = '',
    language = '',
    sort = 'stars',
    order = 'desc',
    per_page = 10,
    page = 1,
    minStars = 0,
    maxSize = null,
    topics = []
  } = options;
  
  const cacheKey = `search_${JSON.stringify(options)}`;
  
  try {
    const queryParts = [];
    
    if (query) queryParts.push(query);
    if (language) queryParts.push(`language:${language}`);
    if (minStars > 0) queryParts.push(`stars:>${minStars}`);
    if (maxSize) queryParts.push(`size:<${maxSize}`);
    
    topics.forEach(topic => {
      queryParts.push(`topic:${topic}`);
    });
    
    const searchQuery = queryParts.join(' ');
    const endpoint = `/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=${sort}&order=${order}&per_page=${per_page}&page=${page}`;
    
    const response = await githubApiRequest(endpoint, cacheKey, CACHE_DURATION.SEARCH);
    return {
      items: response.items || [],
      totalCount: response.total_count || 0,
      incomplete: response.incomplete_results || false
    };
  } catch (error) {
    console.warn('Repository search failed:', error);
    return { items: [], totalCount: 0, incomplete: false };
  }
}

// Get repository details with additional metadata
export async function getRepositoryDetails(owner, repo) {
  const cacheKey = `repo_details_${owner}_${repo}`;
  
  try {
    const endpoint = `/repos/${owner}/${repo}`;
    return await githubApiRequest(endpoint, cacheKey, CACHE_DURATION.REPO_DETAILS);
  } catch (error) {
    console.warn(`Failed to fetch details for ${owner}/${repo}:`, error);
    return null;
  }
}

// Get similar repositories based on topics and language
export async function findSimilarRepositories(repository, options = {}) {
  const { limit = 5, excludeOwn = true } = options;
  
  try {
    const searchPromises = [];
    
    // Search by primary language
    if (repository.language) {
      searchPromises.push(
        searchRepositories({
          language: repository.language,
          minStars: 50,
          per_page: limit * 2,
          sort: 'stars'
        })
      );
    }
    
    // Search by topics
    if (repository.topics && repository.topics.length > 0) {
      // Use the most specific topics
      const topTopics = repository.topics.slice(0, 3);
      searchPromises.push(
        searchRepositories({
          topics: topTopics,
          minStars: 20,
          per_page: limit * 2,
          sort: 'stars'
        })
      );
    }
    
    // Search by similar names/descriptions
    if (repository.description) {
      const keywords = repository.description
        .toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 3)
        .slice(0, 3)
        .join(' ');
      
      if (keywords) {
        searchPromises.push(
          searchRepositories({
            query: keywords,
            minStars: 10,
            per_page: limit * 2,
            sort: 'relevance'
          })
        );
      }
    }
    
    const results = await Promise.all(searchPromises);
    const allRepos = results.flatMap(result => result.items);
    
    // Remove duplicates and user's own repos if requested
    const uniqueRepos = allRepos.filter((repo, index, arr) => {
      const isUnique = arr.findIndex(r => r.id === repo.id) === index;
      const isNotOwn = !excludeOwn || repo.id !== repository.id;
      return isUnique && isNotOwn;
    });
    
    // Sort by relevance (stars + recency)
    const scoredRepos = uniqueRepos.map(repo => ({
      ...repo,
      relevanceScore: Math.log10((repo.stargazers_count || 0) + 1) + 
                     (new Date(repo.updated_at) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) ? 2 : 0)
    }));
    
    return scoredRepos
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
      
  } catch (error) {
    console.warn('Failed to find similar repositories:', error);
    return [];
  }
}

// Get comprehensive trending data across multiple dimensions
export async function getComprehensiveTrending(userLanguages = [], userTopics = []) {
  try {
    const trendingPromises = [];
    
    // Get trending for user's top languages
    userLanguages.slice(0, 3).forEach(language => {
      trendingPromises.push(fetchTrendingRepositories(language, 'weekly', 5));
    });
    
    // Get general trending
    trendingPromises.push(fetchTrendingRepositories('', 'daily', 10));
    
    // Get trending for specific categories
    const categories = ['web', 'mobile', 'ai', 'data-science', 'devops'];
    categories.forEach(category => {
      trendingPromises.push(
        searchRepositories({
          topics: [category],
          minStars: 100,
          per_page: 3,
          sort: 'updated'
        }).then(result => result.items)
      );
    });
    
    const results = await Promise.all(trendingPromises);
    const allTrending = results.flat();
    
    // Remove duplicates and score
    const uniqueTrending = allTrending.filter((repo, index, arr) => 
      arr.findIndex(r => r.id === repo.id) === index
    );
    
    return uniqueTrending
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 20);
      
  } catch (error) {
    console.warn('Failed to get comprehensive trending data:', error);
    return [];
  }
}

// Export rate limit info for UI display
export function getRateLimitStatus() {
  return {
    remaining: Math.max(0, RATE_LIMIT.limit - RATE_LIMIT.requests),
    limit: RATE_LIMIT.limit,
    resetTime: new Date(RATE_LIMIT.resetTime)
  };
}
