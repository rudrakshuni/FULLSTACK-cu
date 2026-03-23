import React, { useState, useEffect } from 'react';
import styles from './DemoAPI.module.css';

export default function DemoAPI() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [isCached, setIsCached] = useState(false);

  // Mock API endpoints
  const DEMO_ENDPOINTS = [
    { name: 'User Profile', url: '/api/user' },
    { name: 'Posts', url: '/api/posts' },
    { name: 'Settings', url: '/api/settings' },
  ];

  const mockApiResponses = {
    '/api/user': {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://via.placeholder.com/100',
    },
    '/api/posts': {
      posts: [
        { id: 1, title: 'First Post', content: 'This is cached and available offline!' },
        { id: 2, title: 'Second Post', content: 'Progressive Web Apps are awesome!' },
        { id: 3, title: 'Third Post', content: 'Works perfectly when offline.' },
      ],
    },
    '/api/settings': {
      theme: 'dark',
      notifications: true,
      language: 'en',
      offlineModeEnabled: true,
    },
  };

  const fetchData = async (endpoint) => {
    setIsLoading(true);
    setError(null);
    setIsCached(false);

    try {
      const response = await fetch(endpoint);
      const json = await response.json();

      // Check if response came from cache
      const isOfflineData = json.offline === true || json.cached === true;
      setIsCached(isOfflineData);

      if (isOfflineData && json.message) {
        setError(json.message);
      }

      setData(json);
      setLastFetch(new Date().toLocaleTimeString());
    } catch (err) {
      setError(`Failed to fetch: ${err.message}`);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const mockApiCall = async (endpoint) => {
    setIsLoading(true);
    setError(null);
    setIsCached(false);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (mockApiResponses[endpoint]) {
        setData(mockApiResponses[endpoint]);
        setLastFetch(new Date().toLocaleTimeString());
      } else {
        setError('Endpoint not found');
      }
    } catch (err) {
      setError(`Failed to fetch: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3>Demo API Calls</h3>
      <p className={styles.description}>
        Click any endpoint to fetch data. When offline, cached data is automatically served.
        The Advanced Service Worker caches API responses for 24 hours.
      </p>

      <div className={styles.endpoints}>
        {DEMO_ENDPOINTS.map((endpoint) => (
          <button
            key={endpoint.url}
            className={styles.endpointBtn}
            onClick={() => mockApiCall(endpoint.url)}
            disabled={isLoading}
          >
            {isLoading ? '⏳' : '📡'} {endpoint.name}
          </button>
        ))}
      </div>

      {isLoading && <div className={styles.loading}>Loading data...</div>}

      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          ⚠️ {error}
        </div>
      )}

      {isCached && (
        <div className={`${styles.message} ${styles.cached}`}>
          ✅ This data is served from cache (offline mode)
        </div>
      )}

      {lastFetch && (
        <div className={styles.timestamp}>Last fetched: {lastFetch}</div>
      )}

      {data && (
        <div className={styles.dataDisplay}>
          <h4>Response Data:</h4>
          <pre className={styles.pre}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
