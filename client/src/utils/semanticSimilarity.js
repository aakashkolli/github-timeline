// Advanced semantic similarity utilities
import { apiCache } from './apiCache.js';

// TF-IDF implementation for better text similarity
class TfIdfCalculator {
  constructor(documents) {
    this.documents = documents;
    this.vocabulary = new Set();
    this.tfIdfCache = new Map();
    
    // Build vocabulary from all documents
    documents.forEach(doc => {
      const words = this.tokenize(doc);
      words.forEach(word => this.vocabulary.add(word));
    });
    
    this.vocabularyArray = Array.from(this.vocabulary);
  }

  tokenize(text) {
    if (!text) return [];
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word));
  }

  isStopWord(word) {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'as', 'are', 'was',
      'will', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'can',
      'could', 'should', 'would', 'may', 'might', 'must', 'shall', 'with',
      'for', 'of', 'in', 'by', 'from', 'up', 'about', 'into', 'through',
      'during', 'before', 'after', 'above', 'below', 'between', 'among',
      'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our',
      'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
      'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it',
      'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves'
    ]);
    return stopWords.has(word);
  }

  calculateTf(document) {
    const words = this.tokenize(document);
    const wordCount = words.length;
    const tf = {};
    
    words.forEach(word => {
      tf[word] = (tf[word] || 0) + 1;
    });
    
    // Normalize by document length
    Object.keys(tf).forEach(word => {
      tf[word] = tf[word] / wordCount;
    });
    
    return tf;
  }

  calculateIdf() {
    const idf = {};
    const totalDocs = this.documents.length;
    
    this.vocabularyArray.forEach(word => {
      let docsWithWord = 0;
      this.documents.forEach(doc => {
        if (this.tokenize(doc).includes(word)) {
          docsWithWord++;
        }
      });
      
      idf[word] = Math.log(totalDocs / (docsWithWord || 1));
    });
    
    return idf;
  }

  calculateTfIdf(document, idf) {
    const cacheKey = `tfidf_${document.slice(0, 50)}`;
    if (this.tfIdfCache.has(cacheKey)) {
      return this.tfIdfCache.get(cacheKey);
    }

    const tf = this.calculateTf(document);
    const tfIdf = {};
    
    Object.keys(tf).forEach(word => {
      tfIdf[word] = tf[word] * (idf[word] || 0);
    });
    
    this.tfIdfCache.set(cacheKey, tfIdf);
    return tfIdf;
  }

  cosineSimilarity(vec1, vec2) {
    const words = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    words.forEach(word => {
      const val1 = vec1[word] || 0;
      const val2 = vec2[word] || 0;
      
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    });
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}

// Enhanced semantic similarity calculation
export function calculateAdvancedSimilarity(repo1, repo2, allRepos) {
  const cacheKey = `similarity_${repo1.id}_${repo2.id}`;
  const cached = apiCache.get(cacheKey);
  if (cached !== null) return cached;

  // Prepare text data
  const text1 = `${repo1.name} ${repo1.description || ''} ${(repo1.topics || []).join(' ')}`;
  const text2 = `${repo2.name} ${repo2.description || ''} ${(repo2.topics || []).join(' ')}`;
  
  // Create TF-IDF calculator with all repository texts for better IDF calculation
  const allTexts = allRepos.map(repo => 
    `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`
  );
  
  const tfidfCalc = new TfIdfCalculator(allTexts);
  const idf = tfidfCalc.calculateIdf();
  
  const vec1 = tfidfCalc.calculateTfIdf(text1, idf);
  const vec2 = tfidfCalc.calculateTfIdf(text2, idf);
  
  const textSimilarity = tfidfCalc.cosineSimilarity(vec1, vec2);
  
  // Language similarity
  const languageSimilarity = repo1.language === repo2.language ? 0.3 : 0;
  
  // Topic overlap similarity (Jaccard similarity)
  const topics1 = new Set(repo1.topics || []);
  const topics2 = new Set(repo2.topics || []);
  const intersection = new Set([...topics1].filter(x => topics2.has(x)));
  const union = new Set([...topics1, ...topics2]);
  const topicSimilarity = union.size > 0 ? intersection.size / union.size * 0.4 : 0;
  
  // Activity similarity (normalized by log scale)
  const activity1 = Math.log10((repo1.stargazers_count || 0) + 1);
  const activity2 = Math.log10((repo2.stargazers_count || 0) + 1);
  const maxActivity = Math.max(activity1, activity2);
  const activitySimilarity = maxActivity > 0 ? 
    (1 - Math.abs(activity1 - activity2) / maxActivity) * 0.2 : 0;
  
  // Combine all similarities
  const totalSimilarity = textSimilarity * 0.5 + languageSimilarity + topicSimilarity + activitySimilarity;
  
  // Cache the result
  apiCache.set(cacheKey, totalSimilarity, 5 * 60 * 1000); // 5 minutes cache
  
  return totalSimilarity;
}

// Calculate repository embeddings for better similarity (simplified version)
export function calculateRepositoryEmbedding(repo) {
  const cacheKey = `embedding_${repo.id}`;
  const cached = apiCache.get(cacheKey);
  if (cached !== null) return cached;

  // Create a simple embedding vector based on repository features
  const text = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`;
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  // Simple hash-based embedding (in production, use actual embeddings API)
  const embedding = new Array(100).fill(0);
  
  words.forEach((word, index) => {
    // Simple hash function to distribute words across embedding dimensions
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      const char = word.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const embeddingIndex = Math.abs(hash) % embedding.length;
    embedding[embeddingIndex] += 1 / words.length; // Normalize
  });
  
  // Add language and topic features
  if (repo.language) {
    const langHash = repo.language.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const langIndex = Math.abs(langHash) % embedding.length;
    embedding[langIndex] += 0.3;
  }
  
  (repo.topics || []).forEach(topic => {
    const topicHash = topic.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const topicIndex = Math.abs(topicHash) % embedding.length;
    embedding[topicIndex] += 0.2;
  });
  
  // Normalize the embedding vector
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= norm;
    }
  }
  
  // Cache the embedding
  apiCache.set(cacheKey, embedding, 30 * 60 * 1000); // 30 minutes cache
  
  return embedding;
}

// Calculate cosine similarity between two embedding vectors
export function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) return 0;
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  if (norm1 === 0 || norm2 === 0) return 0;
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}
