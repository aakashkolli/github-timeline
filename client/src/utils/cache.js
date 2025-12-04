/**
 * Simple client-side cache implementation using localStorage
 * For static sites, this replaces server-side caching.
 */

class ClientCache {
  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
   */
  static set(key, value, ttl = 300) {
    const expiryTime = Date.now() + ttl * 1000;
    const cacheEntry = {
      value,
      expiryTime
    };

    localStorage.setItem(key, JSON.stringify(cacheEntry));
    console.log(`ClientCache: Set key "${key}" with TTL ${ttl}s`);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  static get(key) {
    const cacheEntry = localStorage.getItem(key);

    if (!cacheEntry) {
      return null;
    }

    const { value, expiryTime } = JSON.parse(cacheEntry);

    if (Date.now() > expiryTime) {
      this.delete(key);
      return null;
    }

    console.log(`ClientCache: Hit for key "${key}"`);
    return value;
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   */
  static delete(key) {
    localStorage.removeItem(key);
    console.log(`ClientCache: Deleted key "${key}"`);
  }

  /**
   * Clear all cache entries
   */
  static clear() {
    localStorage.clear();
    console.log('ClientCache: Cleared all entries');
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  static getStats() {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    let totalSize = 0;
    let expiredCount = 0;

    keys.forEach(key => {
      const cacheEntry = JSON.parse(localStorage.getItem(key));
      totalSize += JSON.stringify(cacheEntry.value).length;

      if (now > cacheEntry.expiryTime) {
        expiredCount++;
      }
    });

    return {
      totalEntries: keys.length,
      expiredEntries: expiredCount,
      approximateSize: totalSize,
      averageItemSize: keys.length > 0 ? Math.round(totalSize / keys.length) : 0
    };
  }

  /**
   * Clean up expired entries manually
   */
  static cleanup() {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let expiredCount = 0;

    keys.forEach(key => {
      const cacheEntry = JSON.parse(localStorage.getItem(key));

      if (now > cacheEntry.expiryTime) {
        this.delete(key);
        expiredCount++;
      }
    });

    console.log(`ClientCache: Cleaned up ${expiredCount} expired entries`);
    return expiredCount;
  }
}

export default ClientCache;