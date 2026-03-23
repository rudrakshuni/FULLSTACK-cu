import React, { useEffect, useState } from 'react';
import swController from '../serviceWorkerController';
import styles from './ServiceWorkerSwitcher.module.css';

export default function ServiceWorkerSwitcher() {
  const [currentSW, setCurrentSW] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [swActive, setSwActive] = useState(false);

  useEffect(() => {
    checkServiceWorkerStatus();
  }, []);

  const checkServiceWorkerStatus = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        setSwActive(true);
      }
    }
  };

  const switchServiceWorker = async (swType) => {
    setIsLoading(true);
    try {
      const swPath = swType === 'advanced' ? '/sw-advanced.js' : '/sw-basic.js';

      if (currentSW !== swType) {
        await swController.switchServiceWorker(swPath);
        setCurrentSW(swType);
        console.log(`[SW Switch] Switched to ${swType} service worker`);
        
        // Refresh to load new SW
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('[SW Switch] Failed to switch:', error);
      alert(`Failed to switch to ${swType} service worker`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!swActive) {
    return (
      <div className={styles.container}>
        <div className={styles.warning}>
          ⚠️ Service Worker not active. Build the app for production: npm run build
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3>Service Worker Mode</h3>
      <div className={styles.buttons}>
        <button
          className={`${styles.button} ${currentSW === 'basic' ? styles.active : ''}`}
          onClick={() => switchServiceWorker('basic')}
          disabled={isLoading || currentSW === 'basic'}
        >
          {isLoading && currentSW !== 'basic' ? '⏳ Switching...' : '🔵 Basic SW'}
        </button>
        <button
          className={`${styles.button} ${currentSW === 'advanced' ? styles.active : ''}`}
          onClick={() => switchServiceWorker('advanced')}
          disabled={isLoading || currentSW === 'advanced'}
        >
          {isLoading && currentSW !== 'advanced' ? '⏳ Switching...' : '🚀 Advanced SW'}
        </button>
      </div>
      <p className={styles.description}>
        {currentSW === 'basic'
          ? '📦 Basic mode: Caches static assets. Reload to switch to Advanced mode with API caching.'
          : '🚀 Advanced mode: Network-first for APIs, cache-first for images, stale-while-revalidate for styles.'}
      </p>
    </div>
  );
}
