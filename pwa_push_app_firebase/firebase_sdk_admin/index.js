const admin = require('firebase-admin');
var serviceAccount = require("./firebase_admin_key.json");
const webpush = require('web-push');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pushtest-c0b5a.firebaseio.com"
});


// This registration token comes from the client FCM SDKs.
var registrationTokens = [
    'dJZcSijhX5A:APA91bErH3siuPNbfXeAPs2MC9LdDsGGaHF28LchuY8vv37UYyehsoEGRb0X_r2cbTjJx41bn-9RPXrJ4lccrdINkOjkxo6iqDJ_Hr20ltYlvktbLdZo-uqqE-ztmhM1BRCtgdcCPh3-'
]
// var message = {
//   data: {
//     score: '850',
//     time: '2:45'
//   },
//   token: registrationToken,
// //   "notification": {
// //     "title": "Title",
// //     "body": " body"
// //   },
// //   "webpush": {
// //     "fcm_options": {
// //       "link": "https://www.naver.com"
// //     }
// //   }
// };

var payload = {
    data: {
      score: '850',
      time: '2:45'
    }
  };

// Send a message to the device corresponding to the provided
// registration token.
admin.messaging().sendToDevice(registrationTokens, payload)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });