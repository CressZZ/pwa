
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/6.3.4/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/6.3.4/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  'messagingSenderId': '182855395143'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  // const notificationTitle = 'Background Message Title';
  const notificationTitle = payload.data.title;

  const notificationOptions = {
    body: 'sw1s Background Message body.',
    icon: '/firebase-logo.png',
    data:{
      url: payload.data.url

    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// self.addEventListener('push', function (event) {
//   console.log('[Service Worker] Push Received.');
//   console.log(`[Service Worker] Push had this data:`,  event.data.json());

//   // console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
//   const data = event.data.json().data;
//   const title =  `${data.title}`;
//   const options = {
//       body: `${data.body}`,
//       icon: `./promo/test/pwa/images/icon.png`,
//       badge: `./promo/test/pwa/images/badge.png`,
//       image: `./promo/test/pwa/images/bg.jpg`,
//       data,

//   };

//   event.waitUntil(self.registration.showNotification(title, options));
// });

// self.addEventListener('notificationclick', function (event) {
//   console.log('[Service Worker] Notification click Received.');
//   console.log('[Service Worker] evet.data: ', event.notification.data);


//   event.notification.close();

//   event.waitUntil(clients.matchAll({
//       type: "window"
//     }).then(function(clientList) {
//       if (clientList.length > 0) {
//           clientList[0].navigate(event.notification.data.url)
//           clientList[0].focus();
//           return;
//       }

//       if (clients.openWindow) return clients.openWindow(event.notification.data.url);
//     }));


// });



// test002ds3s