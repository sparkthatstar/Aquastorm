self.addEventListener('push', (event) => {
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'AquaStorm', body: event.data.text() };
  }

  const title = data.title || 'AquaStorm';
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
