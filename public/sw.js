// Handle background push events
self.addEventListener('push', (event) => {
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'AquaStorm', body: event.data.text() };
  }

  const title = data.title || 'AquaStorm';
  const options = {
    body: data.body || 'You have a new update.',
    icon: '/icon.png', // Optional: add an icon.png in your /public folder
    badge: '/badge.png', // Optional: add a badge.png in your /public folder
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click (opens the app)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
