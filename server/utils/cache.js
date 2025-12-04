/**
 * Simple in-memory cache implementation. Redis or similar external cache
 * could also be used.
 */

class Cache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 300 seco= 5 minutes)
   */
  set(key, value, ttl = 300) {
    // Clear existing timer if key already exists
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set the value
    this.cache.set(key, {
      value: value,
      timestamp: Date.now(),
      ttl: ttl
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);

    console.log(`Cache: Set key "${key}" with TTL ${ttl}s`);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if item has expired (double check, though timer should handle this)
    const now = Date.now();
    const expiryTime = item.timestamp + (item.ttl * 1000);

    if (now > expiryTime) {
      this.delete(key);
      return null;
    }

    console.log(`Cache: Hit for key "${key}"`);
    return item.value;
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    // Remove from cache
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      console.log(`Cache: Deleted key "${key}"`);
    }

    return deleted;
  }

  /**
   * Check if a key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    this.cache.clear();
    this.timers.clear();

    console.log('Cache: Cleared all entries');
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    
    let totalSize = 0;
    let expiredCount = 0;

    for (const [key, item] of entries) {
      totalSize += JSON.stringify(item.value).length;
      
      const expiryTime = item.timestamp + (item.ttl * 1000);
      if (now > expiryTime) {
        expiredCount++;
      }
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      approximateSize: totalSize,
      averageItemSize: this.cache.size > 0 ? Math.round(totalSize / this.cache.size) : 0
    };
  }

  /**
   * Clean up expired entries manually
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, item] of this.cache.entries()) {
      const expiryTime = item.timestamp + (item.ttl * 1000);
      if (now > expiryTime) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
    
    console.log(`Cache: Cleaned up ${expiredKeys.length} expired entries`);
    return expiredKeys.length;
  }
}

// Create singleton instance
const cache = new Cache();

// Run cleanup every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

// Log cache stats every 10 minutes in development
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    const stats = cache.getStats();
    console.log('Cache Stats:', stats);
  }, 10 * 60 * 1000);
}

module.exports = cache;
