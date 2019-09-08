// const webpush = require('web-push');
 
// // VAPID keys should only be generated only once.
// // const vapidKeys = webpush.generateVAPIDKeys();
 
// webpush.setGCMAPIKey('<Your GCM API Key Here>');
// webpush.setVapidDetails(
//   'mailto:example@yourdomain.org',
//   'BOCHoU_Ym8vKG5mjwIVzNTThP_rpcjrI7C2liL3sYhGpAt-leD9V3-ggUaItj5guFW5m5JEwremfCnt_pt2JIrE',
//   'vS5NkdSrlnucWS_hT2I8qqW2MYNvqdlLyCLjeUBvapk'
// );
 
// // This is the same output of calling JSON.stringify on a PushSubscription
// const pushSubscription = {
//   endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/gAAAAABda4OfjEJwoewCpfifOXhSbNf8RKDmMnE7nmtZ8UZ1YxNet5NAiYOrJzOpuQBOCsXO2NGHPQ7bFlUFLdsC1t5Ldv2cL1DM0xa0WXftjd3jq9DDpc_efAEvFRs9sAB0UEV27b6JSyifTJX3cjQMi62Ql3pSELbBBcTV8yMKuPesErWtCZU',
//   keys: {
//     auth: 'jGYIVW-oCtDmjwEAJOfmfw',
//     p256dh: 'BI2sruHk2THtLj0yapj4qjjN4dRUW1NFsRxGz50b-2GhXLXlVBx974GB3J_-3LQ-9PHw7ow3XFtam8IJkWPL54E'
//   }
// };
 
// webpush.sendNotification(pushSubscription, 'Your Push Payload Text');

const webpush = require('web-push');
 
// VAPID keys should only be generated only once.
// const vapidKeys = webpush.generateVAPIDKeys();
 
// webpush.setGCMAPIKey('<Your GCM API Key Here>');
webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  'BOCHoU_Ym8vKG5mjwIVzNTThP_rpcjrI7C2liL3sYhGpAt-leD9V3-ggUaItj5guFW5m5JEwremfCnt_pt2JIrE',
  'vS5NkdSrlnucWS_hT2I8qqW2MYNvqdlLyCLjeUBvapk'
);
 
// This is the same output of calling JSON.stringify on a PushSubscription
const pushSubscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/fJMn7F-TNJw:APA91bHpCaadn24d-bRwEOnWtaIGVPY7UIzkUeCUtpcWud6NuXa_0KF7hTVfcQiiy8SHUiyXqrcKwYlkFtiMvhXAty0Ndb4coLK_R34uY8oILPBL7BBmXc0G-df2UNJuZZfI56IuKunv",
  keys: {
    auth: "b7uN_Yqysu1hlubh2DUMuw",
    p256dh: "BDeR2uHu4NHnR26YHaLrRiB1nu79aNJ9P4vI9nfYYsyoqTXx7N_iaLO3dMrPJVCoJWzL_-JI6RftukvRIdTc66o"
  }
};
 
webpush.sendNotification(pushSubscription, 'Your Push Payload Text');