self.addEventListener('install', async () => {
  console.log('skip waiting');
  await self.skipWaiting();
});

self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.', event);

  const title = 'test title';
  const options = {
    body: 'test push',
    // icon: './images/icon.png',
    // badge: './promo/test/pwa/images/badge.png',
    // image: './promo/test/pwa/images/bg.jpg',
    data: {
      url: './'
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));

});

self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.', event.notification);

  event.notification.close();

  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function (clientList) {
    if (clientList.length > 0) {
      clientList[0].navigate(event.notification.data.url);
      clientList[0].focus();
      return;
    }

    if (clients.openWindow) return clients.openWindow(event.notification.data.url);

  }));
});


