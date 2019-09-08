window.messaging = window.app2.messaging();
window.registration ;


if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
      // Registration was successful
      console.log(registration.test);
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      // window.app2.messaging().useServiceWorker(registration);
      // messaging.usePublicVapidKey('BHudr6Q2-mMVjpfXiu3fvQ6OSjl_iOmSQd4kTqN7hc8R8RjpQUsjPHhGvFvZd6n7oFriB3vPFNl_XrQIHOeiHjo')
      messaging.usePublicVapidKey('BOCHoU_Ym8vKG5mjwIVzNTThP_rpcjrI7C2liL3sYhGpAt-leD9V3-ggUaItj5guFW5m5JEwremfCnt_pt2JIrE')

      // var options = {
      //   userVisibleOnly: true,
      //   // applicationServerKey: 'BHudr6Q2-mMVjpfXiu3fvQ6OSjl_iOmSQd4kTqN7hc8R8RjpQUsjPHhGvFvZd6n7oFriB3vPFNl_XrQIHOeiHjo'
      //   applicationServerKey: 'BOCHoU_Ym8vKG5mjwIVzNTThP_rpcjrI7C2liL3sYhGpAt-leD9V3-ggUaItj5guFW5m5JEwremfCnt_pt2JIrE'

      // };
      // registration.pushManager.subscribe(options).then(
      //   function(pushSubscription) {
      //     console.log(pushSubscription.endpoint);
      //     // The push subscription details needed by the application
      //     // server are now available, and can be sent to it using,
      //     // for example, an XMLHttpRequest.
      //   }, function(error) {
      //     // During development it often helps to log errors to the
      //     // console. In a production environment it might make sense to
      //     // also report information about errors back to the
      //     // application server.
      //     console.error(error.name);
      //   }
      // ).catch(e=>console.log(e))

      // registration.pushManager.getSubscription().then(info=>window.subscriptionInfo = info);
      window.registration = registration;




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


messaging.onTokenRefresh(() => {
  messaging.getToken().then((refreshedToken) => {
    console.log('Token refreshed.', refreshedToken);
    // Indicate that the new Instance ID token has not yet been sent to the
    // app server.
    // setTokenSentToServer(false);
    // // Send Instance ID token to app server.
    // sendTokenToServer(refreshedToken);
    // ...
  }).catch((err) => {
    console.log('Unable to retrieve refreshed token ', err);
    showToken('Unable to retrieve refreshed token ', err);
  });
});

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// urlB64ToUint8Array('BHudr6Q2-mMVjpfXiu3fvQ6OSjl_iOmSQd4kTqN7hc8R8RjpQUsjPHhGvFvZd6n7oFriB3vPFNl_XrQIHOeiHjo')