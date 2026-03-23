# PWA Quick Start Guide

## Installation & Setup

```bash
# Navigate to project
cd pwa-app

# Install dependencies (already done, but for reference)
npm install
workbox-core workbox-precaching workbox-routing workbox-strategies \
workbox-expiration workbox-cacheable-response

# Build for production
npm run build

# Test locally (choose one)
npm install -g serve
serve -s build

# OR using Python
python -m http.server 8000

# OR using Node.js http-server
npm install -g http-server
http-server build -g
```

## File Guide

### Service Workers
- **`public/sw-basic.js`** - Static asset caching
  - Precaches on install
  - Serves from cache when offline
  - Simple network-first for navigation

- **`public/sw-advanced.js`** - Runtime caching with strategies
  - Network-first for APIs
  - Cache-first for images
  - Stale-while-revalidate for styles
  - 24-hour cache expiration
  - Message-based communication

### React Components
- **`PWAInstallPrompt.js`** - Install banner
- **`OfflineIndicator.js`** - Network status
- **`ServiceWorkerSwitcher.js`** - Switch SWs
- **`CacheManager.js`** - Cache statistics
- **`DemoAPI.js`** - Test API caching

### Configuration
- **`public/manifest.json`** - PWA metadata
  - App name, icons, colors
  - Display mode, scope
  - Theme and background colors

## Testing Checklist

### ✅ Basic PWA Features
- [ ] `npm run build` completes successfully
- [ ] Service worker registers in DevTools
- [ ] Manifest.json loads with all icons
- [ ] App can be installed (banner appears)

### ✅ Offline Functionality
- [ ] Open DevTools → Application → Service Workers
- [ ] Confirm active service worker
- [ ] Go offline: DevTools → Network → Offline checkbox
- [ ] Reload page - still loads from cache
- [ ] API calls return cached data

### ✅ Caching Behavior
- [ ] Click Demo API buttons to cache data
- [ ] Check DevTools → Cache Storage
- [ ] Multiple caches visible (api, images, styles, etc.)
- [ ] Cache stats update in CacheManager
- [ ] Clear cache button works

### ✅ Service Worker Updates
- [ ] Modify `sw-advanced.js`
- [ ] `npm run build`
- [ ] Reload app
- [ ] New SW becomes active
- [ ] Old cache cleaned up

## Common Commands

```bash
# Development
npm start          # Start dev server (no SW in dev mode)

# Production
npm run build      # Build for production (enables SW)

# Testing
serve -s build     # Serve production build locally

# Debugging
# 1. Open DevTools (F12)
# 2. Go to Application tab
# 3. Explore:
#    - Manifest
#    - Service Workers
#    - Cache Storage
#    - Local Storage
```

## Useful DevTools Shortcuts

### Chrome/Edge
- `Ctrl+Shift+I` → Open DevTools
- `F12` → Open DevTools
- `Ctrl+Shift+Delete` → Clear cache/cookies
- DevTools → Network → Throttling for slow connection testing
- DevTools → Application → Offline checkbox for offline testing

### Firefox
- `F12` → Open DevTools
- `Ctrl+Shift+K` → Open Console
- DevTools → Storage tab for cache inspection

## Quick Debugging

### Service Worker Not Registering?
```javascript
// Add to console
navigator.serviceWorker.getRegistrations().then(r => console.log(r));
```

### Check Cache Contents
```javascript
// In DevTools Console
caches.keys().then(names => {
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(requests => {
        console.log(name, requests.length, 'items');
      });
    });
  });
});
```

### Unregister All Service Workers
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});
```

### Clear All Caches
```javascript
caches.keys().then(cacheNames => {
  Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
});
```

## Performance Tips

1. **Precache only essential files** - Keep precache small
2. **Use cache expiration** - Prevent stale data indefinitely
3. **Monitor cache size** - Set reasonable max entries
4. **Test on real devices** - Especially mobile
5. **Check HTTPS setup** - Required for production PWA

## Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Workers | ✅ 40+ | ✅ 44+ | ✅ 11.1+ | ✅ 17+ |
| PWA Install | ✅ All | ✅ Mobile | ✅ 15.1+ | ✅ All |
| Cache API | ✅ 43+ | ✅ 39+ | ✅ 11.1+ | ✅ 17+ |
| Manifest | ✅ 39+ | ✅ 53+ | ✅ 15.1+ | ✅ 79+ |

## Deployment

### Firebase Hosting
```bash
firebase init
firebase deploy
# Automatically enables HTTPS and serves over secure connection
```

### Vercel
```bash
vercel --prod
# Automatic HTTPS and optimized serving
```

### Netlify
```bash
netlify deploy --prod --dir=build
# Automatic HTTPS and continuous deployment
```

### Custom Server
Ensure:
- HTTPS certificate installed
- Correct MIME type for `.js` files (application/javascript)
- Service-Worker-Allowed header set (if needed)
- Cache-Control headers configured

## Project Structure

```
pwa-app/
├── public/
│   ├── manifest.json          ← PWA metadata
│   ├── sw-basic.js            ← Basic service worker
│   ├── sw-advanced.js         ← Advanced service worker
│   ├── index.html             ← Main HTML
│   ├── favicon.ico            ← Icon
│   ├── logo192.png            ← App icon
│   └── logo512.png            ← App icon (large)
│
├── src/
│   ├── components/            ← React components
│   │   ├── PWAInstallPrompt/
│   │   ├── OfflineIndicator/
│   │   ├── ServiceWorkerSwitcher/
│   │   ├── CacheManager/
│   │   └── DemoAPI/
│   │
│   ├── serviceWorkerController.js    ← SW communication
│   ├── serviceWorkerRegistration.js  ← SW registration
│   │
│   ├── App.js                 ← Main component
│   ├── App.css                ← Styles
│   └── index.js               ← Entry point
│
├── PWA_GUIDE.md               ← Full documentation
├── QUICK_START.md             ← This file
├── package.json               ← Dependencies
└── build/                     ← Production build (after npm run build)
```

## Key Files to Understand

1. **manifest.json** - Tells browser about your app
2. **sw-advanced.js** - Main caching logic
3. **serviceWorkerController.js** - Client-side communication
4. **App.js** - Main UI with PWA components

## Next Steps

1. Review PWA_GUIDE.md for comprehensive documentation
2. Run `npm run build` to create production version
3. Test with `serve -s build`
4. Try the offline mode in DevTools
5. Deploy to production (Firebase/Vercel/Netlify)
6. Monitor cache sizes and adjust as needed

## Need Help?

- Check browser DevTools → Application tab
- Look at console.logs starting with `[SW-Advanced]` or `[SWController]`
- Review PWA_GUIDE.md section-by-section
- Test individual components in isolation
- Clear cache and rebuild if issues persist

---

**Happy PWA building! 🚀**
