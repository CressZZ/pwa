const webpush = require('web-push');


// webpush.setGCMAPIKey('103953800507');
webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  'BOCHoU_Ym8vKG5mjwIVzNTThP_rpcjrI7C2liL3sYhGpAt-leD9V3-ggUaItj5guFW5m5JEwremfCnt_pt2JIrE',
  'vS5NkdSrlnucWS_hT2I8qqW2MYNvqdlLyCLjeUBvapk'

  // 새로 만든 VAPID
  // 'BLppNl3zk2o1rPG2NdjU13Om_M5N26eqaxuknZMSlNtmcHhJnRhzldf3_7SEOjOW5tvhWA3BI1ojmMHi_V1ehdQ',
  // '7cF263SJFLNw3_RvjVrOQI7l_Z5Vk8YoHYN96AG2TBk'
);

//  사용 했을 경우 (fcm 관리자 페이지에서 제공하는 VAPID)
// const pushSubscription = {
//   endpoint: 'https://fcm.googleapis.com/fcm/send/cSj8gZscuzs:APA91bFDRExq1-Ngllo9BrHC2AqYHSoOHQbqyx2Cy9qNWOay1QCb-q1MN3wB1JXyt8VOT1GmlAQxRxFK_KUj3r99Y-KEqbUSzLJottFL-E6FvBGum-gC4o4EglJk-TOzbqV5reNlvlwX',
//   keys: {
//     auth: 'VTCA8UgZji4yGIHZYfBNUA',
//     p256dh: 'BKye_2S-fyyryt_6cuXjereUHHOFIUJGXu5jqE3fvjyKQiQZgpn_N7kDdcK_ijnCer6olRanTi5oUR6jywPl7nI'
//    }
// };

// 사용 안했을 경우 - 사용 했을 경우 (fcm 관리자 페이지에서 제공하는 VAPID)와 동일
const pushSubscription = {
  endpoint: "https://updates.push.services.mozilla.com/wpush/v2/gAAAAABdbb-Vdk6P01qGS3z7ZKClJU5LtLsXorLra8R_cyyGEOvrWuhABFdriqcSIcjlgaS5QcLrRLfRClUM6bLjekiUKjn7vOa__-mSG2BE50ymQRbXtJq4Dv0XLEHKkbf7H1MwXOR036mbeB7zHodl0k5_sYlO-oMrlCGUvy7uvZ7UsLTt_AY",
  keys: {
    auth: "Q1WQuoNWjRSNlTUvPLihLg",
    p256dh: "BDHaCRg6WyKBbNv1CdVfk_-z9MCvmkRau9s2nI5zV9Pa6uWFlc_n9-r--wkdUx5Ra8OBv-GV0t1q818pmf6KgOw"
   }
};




try{
  webpush.sendNotification(pushSubscription, 'Your Push Payload Text');
}catch(err){
  console.error(err)
}




/*
{endpoint: "https://fcm.googleapis.com/fcm/send/cSj8gZscuzs:AP…EqbUSzLJottFL-E6FvBGum-gC4o4EglJk-TOzbqV5reNlvlwX", expirationTime: null, keys: {…}}
endpoint: "https://fcm.googleapis.com/fcm/send/cSj8gZscuzs:APA91bFDRExq1-Ngllo9BrHC2AqYHSoOHQbqyx2Cy9qNWOay1QCb-q1MN3wB1JXyt8VOT1GmlAQxRxFK_KUj3r99Y-KEqbUSzLJottFL-E6FvBGum-gC4o4EglJk-TOzbqV5reNlvlwX"
expirationTime: null
keys:
auth: "VTCA8UgZji4yGIHZYfBNUA"
p256dh: "BKye_2S-fyyryt_6cuXjereUHHOFIUJGXu5jqE3fvjyKQiQZgpn_N7kDdcK_ijnCer6olRanTi5oUR6jywPl7nI"
__proto__: Object
__proto__: Object


endpoint: "https://fcm.googleapis.com/fcm/send/cSj8gZscuzs:APA91bFDRExq1-Ngllo9BrHC2AqYHSoOHQbqyx2Cy9qNWOay1QCb-q1MN3wB1JXyt8VOT1GmlAQxRxFK_KUj3r99Y-KEqbUSzLJottFL-E6FvBGum-gC4o4EglJk-TOzbqV5reNlvlwX"
expirationTime: null
keys:
auth: "VTCA8UgZji4yGIHZYfBNUA"
p256dh: "BKye_2S-fyyryt_6cuXjereUHHOFIUJGXu5jqE3fvjyKQiQZgpn_N7kDdcK_ijnCer6olRanTi5oUR6jywPl7nI"














*/
