import './App.css';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import ServiceWorkerSwitcher from './components/ServiceWorkerSwitcher';
import CacheManager from './components/CacheManager';
import DemoAPI from './components/DemoAPI';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>⚡ Progressive Web App Demo</h1>
        <p>A fully functional PWA with service workers and offline support</p>
      </header>

      <main className="App-main">
        <div className="App-container">
          {/* Installation Prompt */}
          <PWAInstallPrompt />

          {/* Network Status */}
          <div className="status-bar">
            <OfflineIndicator />
          </div>

          {/* Service Worker Management */}
          <ServiceWorkerSwitcher />

          {/* Demo API Calls */}
          <DemoAPI />

          {/* Cache Management */}
          <CacheManager />

          {/* Instructions */}
          <section className="instructions">
            <h3>🚀 Next Steps</h3>
            <ol>
              <li>
                <strong>Install the app:</strong> Look for the install banner at the top (or use browser menu)
              </li>
              <li>
                <strong>Load some data:</strong> Click the API buttons to cache data
              </li>
              <li>
                <strong>Go offline:</strong> Open DevTools → Network → Offline
              </li>
              <li>
                <strong>Verify caching:</strong> Reload the page - data is still available!
              </li>
            </ol>
          </section>

          {/* Features */}
          <section className="features">
            <h3>✨ PWA Features</h3>
            <div className="features-grid">
              <div className="feature-card">
                <h4>📦 Offline Support</h4>
                <p>Service workers cache assets and API responses for offline use</p>
              </div>
              <div className="feature-card">
                <h4>🚀 Installable</h4>
                <p>Add to home screen with manifest.json and install prompt</p>
              </div>
              <div className="feature-card">
                <h4>⚡ Fast Loading</h4>
                <p>Cache-first strategies for static assets ensure instant loads</p>
              </div>
              <div className="feature-card">
                <h4>🔄 Background Sync</h4>
                <p>Advanced SW handles stale-while-revalidate pattern</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="App-footer">
        <p>PWA Demo with Service Workers • Built with React</p>
      </footer>
    </div>
  );
}

export default App;
