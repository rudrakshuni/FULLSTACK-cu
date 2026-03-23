/**
 * Service Worker Registration Module
 * Handles registration, updates, and messaging with service workers
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function registerServiceWorker(swPath = '/sw-basic.js') {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(swPath)
        .then((registration) => {
          console.log('[App] Service Worker registered:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          // Listen for new service worker waiting
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is waiting
                console.log('[App] New service worker available');
                
                // Notify about update
                if (window.updateServiceWorker) {
                  window.updateServiceWorker(newWorker);
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('[App] Service Worker registration failed:', error);
        });
    });
  } else if (!isLocalhost && process.env.NODE_ENV === 'production') {
    console.warn('[App] Service Workers require HTTPS (except localhost)');
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }
}

export function updateServiceWorker(newWorker) {
  newWorker.postMessage({ type: 'SKIP_WAITING' });
  window.location.reload();
}

// Check for service worker support
export function isServiceWorkerSupported() {
  return 'serviceWorker' in navigator;
}

// Get current service worker registration
export async function getServiceWorkerRegistration() {
  if ('serviceWorker' in navigator) {
    return await navigator.serviceWorker.getRegistration();
  }
  return null;
}
