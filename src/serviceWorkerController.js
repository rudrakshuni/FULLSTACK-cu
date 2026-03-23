/**
 * Service Worker Controller
 * Manages communication with service workers and offline functionality
 */

export class ServiceWorkerController {
  constructor() {
    this.registration = null;
    this.callbacks = {
      onUpdate: [],
      onOffline: [],
      onOnline: [],
    };
    this.isOnline = navigator.onLine;
  }

  /**
   * Register a service worker
   */
  async register(swPath) {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SWController] Service Workers not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register(swPath, {
        scope: '/',
      });

      console.log('[SWController] Service Worker registered:', this.registration);

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this._notifyUpdate(newWorker);
          }
        });
      });

      // Check for updates periodically
      setInterval(() => {
        this.registration.update();
      }, 60000);

      return this.registration;
    } catch (error) {
      console.error('[SWController] Registration failed:', error);
      return null;
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister() {
    if (this.registration) {
      const success = await this.registration.unregister();
      if (success) {
        this.registration = null;
        console.log('[SWController] Service Worker unregistered');
      }
      return success;
    }
    return false;
  }

  /**
   * Force update the service worker
   */
  async updateServiceWorker() {
    if (this.registration) {
      const newReg = await this.registration.update();
      return newReg;
    }
    return null;
  }

  /**
   * Send message to current service worker
   */
  async sendMessage(message) {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      return new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          resolve(event.data);
        };
        channel.port1.onerror = reject;

        navigator.serviceWorker.controller.postMessage(
          message,
          [channel.port2]
        );
      });
    }
    return null;
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return this.sendMessage({ type: 'GET_CACHE_STATS' });
  }

  /**
   * Clear all caches
   */
  async clearCache() {
    return this.sendMessage({ type: 'CLEAR_CACHE' });
  }

  /**
   * Preload URLs for offline use
   */
  async preloadUrls(urls) {
    return this.sendMessage({ type: 'PRELOAD_URLS', urls });
  }

  /**
   * On update callback
   */
  onUpdate(callback) {
    this.callbacks.onUpdate.push(callback);
  }

  /**
   * Notify update
   */
  _notifyUpdate(newWorker) {
    this.callbacks.onUpdate.forEach((cb) => cb(newWorker));
  }

  /**
   * Track online/offline status
   */
  trackNetworkStatus() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.callbacks.onOnline.forEach((cb) => cb());
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.callbacks.onOffline.forEach((cb) => cb());
    });
  }

  /**
   * Register online callback
   */
  onOnline(callback) {
    this.callbacks.onOnline.push(callback);
  }

  /**
   * Register offline callback
   */
  onOffline(callback) {
    this.callbacks.onOffline.push(callback);
  }

  /**
   * Get current online status
   */
  getOnlineStatus() {
    return this.isOnline;
  }

  /**
   * Switch service worker at runtime
   */
  async switchServiceWorker(newSwPath) {
    await this.unregister();
    return this.register(newSwPath);
  }
}

export default new ServiceWorkerController();
