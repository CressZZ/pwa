console.log('ss');

messaging = firebase.messaging();
window.subscriptionInfo = '';


if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw_subpage.js').then(function (registration) {
      // Registration was successful
      console.log(registration.test);
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      messaging.useServiceWorker(registration);
      registration.test='test';
      registration.pushManager.getSubscription().then(info=>window.subscriptionInfo = info);
    }, function (err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
      
    });
  });
}

function requestPush(){
  if(Notification.permission === 'denied') return false;

  Notification.requestPermission().then((permission)=>{
    if(permission === 'granted'){
      window.messaging.getToken().then(currentToken=>{
        console.log(currentToken)
      })
    }
  })
};

function getSubscription(){

}