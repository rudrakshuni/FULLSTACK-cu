import React, { useEffect, useState } from 'react';
import styles from './PWAInstallPrompt.module.css';

export default function PWAInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(true);
    };

    // Check if already installed
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed');
      setInstalled(true);
      setCanInstall(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted installation');
    } else {
      console.log('[PWA] Installation dismissed');
    }

    setDeferredPrompt(null);
    setCanInstall(false);
  };

  return (
    <div className={styles.container}>
      {canInstall && !installed && (
        <div className={styles.prompt}>
          <p>✨ Install this app for offline access and home screen shortcut!</p>
          <button onClick={handleInstallClick} className={styles.button}>
            Install App
          </button>
        </div>
      )}

      {installed && (
        <div className={styles.installed}>
          <p>✅ App installed successfully!</p>
        </div>
      )}
    </div>
  );
}
