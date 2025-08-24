
// Basic service worker to prevent registration errors
self.addEventListener('install', function(event) {
  console.log('Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service worker activating...');
});

self.addEventListener('fetch', function(event) {
  // Let the browser handle all fetch events normally
  return;
});
