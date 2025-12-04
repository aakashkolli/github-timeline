const express = require('express');
const axios = require('axios');
const cache = require('../utils/cache');

const router = express.Router();

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Create axios instance for GitHub API
const githubAPI = axios.create({
  baseURL: GITHUB_API_BASE,
  timeout: 10000,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Timeline-App',
    ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
  }
});

// Add response interceptor for better error handling
githubAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // GitHub API returned an error response
      const { status, data } = error.response;
      const customError = new Error(data.message || `GitHub API Error ${status}`);
      customError.status = status;
      customError.githubError = true;
      throw customError;
    } else if (error.request) {
      // Request was made but no response received
      const customError = new Error('GitHub API is not responding');
      customError.status = 503;
      customError.githubError = true;
      throw customError;
    } else {
      // Something else happened
      throw error;
    }
  }
);

/**
 * GET /users/:username/repos
 * Fetch all public repositories for a given username
 */
router.get('/users/:username/repos', async (req, res, next) => {
  try {
    const { username } = req.params;
    const { sort = 'created', per_page = 100 } = req.query;

    // Validate username
    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Username is required and must be a string'
      });
    }

    // Validate username format (GitHub username rules)
    const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]){0,38}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid username format'
      });
    }

    // Check cache first
    const cacheKey = `user:${username}:repos:${sort}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log(`Cache hit for ${username}`);
      return res.json({
        success: true,
        data: cachedData.repositories,
        total: cachedData.total,
        cached: true,
        timestamp: cachedData.timestamp
      });
    }

    console.log(`Fetching repositories for ${username} from GitHub API`);

    // First, verify the user exists
    try {
      await githubAPI.get(`/users/${username}`);
    } catch (error) {
      if (error.status === 404) {
        return res.status(404).json({
          success: false,
          message: `User '${username}' not found on GitHub`
        });
      }
      throw error;
    }

    // Fetch repositories with pagination
    let allRepositories = [];
    let page = 1;
    const maxPages = 10; // Limit to prevent abuse (1000 repos max)

    while (page <= maxPages) {
      const response = await githubAPI.get(`/users/${username}/repos`, {
        params: {
          type: 'public',
          sort: sort,
          direction: 'desc',
          per_page: per_page,
          page: page
        }
      });

      const repositories = response.data;
      
      if (repositories.length === 0) {
        break; // No more repositories
      }

      // Filter and enhance repository data
      const processedRepos = repositories.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        homepage: repo.homepage,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        stargazers_count: repo.stargazers_count,
        watchers_count: repo.watchers_count,
        forks_count: repo.forks_count,
        language: repo.language,
        topics: repo.topics || [],
        fork: repo.fork,
        archived: repo.archived,
        disabled: repo.disabled,
        private: repo.private,
        size: repo.size,
        default_branch: repo.default_branch,
        open_issues_count: repo.open_issues_count,
        license: repo.license ? {
          key: repo.license.key,
          name: repo.license.name,
          spdx_id: repo.license.spdx_id
        } : null
      }));

      allRepositories = allRepositories.concat(processedRepos);

      // If we got fewer repos than requested, then we've reached the end
      if (repositories.length < per_page) {
        break;
      }

      page++;
    }

    // Sort repositories by creation date (newest first) as final step
    allRepositories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Cache the results (cache for 10 minutes)
    const cacheData = {
      repositories: allRepositories,
      total: allRepositories.length,
      timestamp: new Date().toISOString()
    };
    cache.set(cacheKey, cacheData, 600); // 10 minutes cache

    console.log(`Successfully fetched ${allRepositories.length} repositories for ${username}`);

    res.json({
      success: true,
      data: allRepositories,
      total: allRepositories.length,
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    
    if (error.githubError) {
      // GitHub API specific error handling
      let userMessage = error.message;
      let suggestions = [];
      
      if (error.status === 403 && error.message.includes('rate limit')) {
        userMessage = 'GitHub API rate limit exceeded. Please try again later.';
        
        if (!GITHUB_TOKEN) {
          suggestions.push('Server administrators: Configure GITHUB_TOKEN for higher rate limits (5,000/hour vs 60/hour)');
        }
        
        suggestions.push('Wait 15-60 minutes before trying again');
        suggestions.push('Try a different user or come back later');
      } else if (error.status === 404) {
        userMessage = `User '${req.params.username}' not found on GitHub`;
        suggestions.push('Double-check the username spelling');
        suggestions.push('Make sure the user has public repositories');
      }
      
      return res.status(error.status).json({
        success: false,
        message: userMessage,
        suggestions: suggestions,
        source: 'github_api',
        rateLimit: {
          authenticated: !!GITHUB_TOKEN,
          limit: GITHUB_TOKEN ? '5,000/hour' : '60/hour'
        }
      });
    }
    
    // Pass other errors to global error handler
    next(error);
  }
});

/**
 * GET /users/:username
 * Fetch user profile information
 */
router.get('/users/:username', async (req, res, next) => {
  try {
    const { username } = req.params;

    // Validate username
    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Username is required and must be a string'
      });
    }

    const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]){0,38}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid username format'
      });
    }

    // Check cache first
    const cacheKey = `user:${username}:profile`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    console.log(`Fetching profile for ${username} from GitHub API`);

    const response = await githubAPI.get(`/users/${username}`);
    const user = response.data;

    // Extract relevant user information
    const userProfile = {
      login: user.login,
      id: user.id,
      name: user.name,
      bio: user.bio,
      company: user.company,
      location: user.location,
      email: user.email,
      blog: user.blog,
      twitter_username: user.twitter_username,
      avatar_url: user.avatar_url,
      html_url: user.html_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
      public_repos: user.public_repos,
      public_gists: user.public_gists,
      followers: user.followers,
      following: user.following
    };

    // Cache for 1 hour
    cache.set(cacheKey, userProfile, 3600);

    res.json({
      success: true,
      data: userProfile,
      cached: false
    });

  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    
    if (error.githubError) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        source: 'github_api'
      });
    }
    
    next(error);
  }
});

/**
 * GET /rate-limit
 * Check current GitHub API rate limit status
 */
router.get('/rate-limit', async (req, res, next) => {
  try {
    const response = await githubAPI.get('/rate_limit');
    const rateLimit = response.data.rate;

    res.json({
      success: true,
      data: {
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: rateLimit.reset,
        reset_date: new Date(rateLimit.reset * 1000).toISOString(),
        used: rateLimit.limit - rateLimit.remaining,
        percentage_used: ((rateLimit.limit - rateLimit.remaining) / rateLimit.limit * 100).toFixed(2)
      }
    });

  } catch (error) {
    console.error('Error checking rate limit:', error.message);
    
    if (error.githubError) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        source: 'github_api'
      });
    }
    
    next(error);
  }
});

module.exports = router;
