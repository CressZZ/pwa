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
  endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/gAAAAABda5B_YuTJ7zxF1lLEzJv9nTmG48FO1Dcg6_dBEE8zVhA2TjXMj_SggCVaVNFiOhkXWWM48bVEM2NesxjURo9PoCVEGbzWvH8YVqh4wlC7qMHeTgnqWVA1tRLe8fVO8uwVBm49KCTUn30LC-KihFQB0LBBUMT-C1Xc4rQejdWjoAzG5ls',
  keys: {
    auth: 'IFfREmLp-xSl-soJV_dP1A',
    p256dh: 'BPNzIg8JACwDGP89us0KYRXe3So1yAF0j-Zh212zQfwym-TntJWEHEuYv3B_DLZKHAUpQ2JMAV-wb3P8Wlzv2gM'
  }
};
 
webpush.sendNotification(pushSubscription, 'Your Push Payload Text');