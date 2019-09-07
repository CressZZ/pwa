window.messaging = window.app2.messaging();
// window.subscriptionInfo = 's'


if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
      // Registration was successful
      console.log(registration.test);
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      // window.app2.messaging().useServiceWorker(registration);
      // messaging.usePublicVapidKey('BOCHoU_Ym8vKG5mjwIVzNTThP_rpcjrI7C2liL3sYhGpAt-leD9V3-ggUaItj5guFW5m5JEwremfCnt_pt2JIrE')
      registration.pushManager.getSubscription().then(info=>window.subscriptionInfo = info);
      registration.test='test';

    }, function (err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}


function requestPush() {
  if(Notification.permission === 'denied') return false;

  Notification.requestPermission().then(permission => {
    if(permission === 'granted'){
      window.messaging.getToken().then(currentToken=>{
        console.log(currentToken)
      })
    }
  })
}
