import React, { useEffect, useState } from 'react';
import styles from './OfflineIndicator.module.css';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div className={`${styles.indicator} ${styles.online}`}>
        <span className={styles.dot}></span>
        Online
      </div>
    );
  }

  return (
    <div className={`${styles.indicator} ${styles.offline}`}>
      <span className={styles.dot}></span>
      Offline - Using cached data
    </div>
  );
}
