import React, { useEffect, useState } from 'react';
import swController from '../serviceWorkerController';
import styles from './CacheManager.module.css';

export default function CacheManager() {
  const [cacheStats, setCacheStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchCacheStats();
  }, [refreshKey]);

  const fetchCacheStats = async () => {
    setIsLoading(true);
    try {
      const stats = await swController.getCacheStats();
      setCacheStats(stats || {});
    } catch (error) {
      console.error('[CacheManager] Failed to fetch stats:', error);
      setCacheStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear all caches? This will remove offline data.')) {
      try {
        await swController.clearCache();
        console.log('[CacheManager] Cache cleared');
        setRefreshKey(refreshKey + 1);
        alert('Cache cleared successfully!');
      } catch (error) {
        console.error('[CacheManager] Failed to clear cache:', error);
        alert('Failed to clear cache');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Cache Manager</h3>
        <button className={styles.refreshBtn} onClick={() => setRefreshKey(refreshKey + 1)}>
          🔄 Refresh
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading cache information...</div>
      ) : cacheStats && Object.keys(cacheStats).length > 0 ? (
        <>
          <div className={styles.stats}>
            {Object.entries(cacheStats).map(([cacheName, count]) => (
              <div key={cacheName} className={styles.statItem}>
                <span className={styles.cacheName}>{cacheName}</span>
                <span className={styles.count}>{count} items</span>
              </div>
            ))}
          </div>
          <button className={styles.clearBtn} onClick={handleClearCache}>
            🗑️ Clear All Caches
          </button>
        </>
      ) : (
        <div className={styles.empty}>No caches available. Try loading some content first.</div>
      )}
    </div>
  );
}
