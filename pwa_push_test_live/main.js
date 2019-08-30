class PushManager {
  constructor() {
    this.init();
    this.firebase;
    this.messaging;
  }

  init(){
    let isFirebase = this.setFirebase();
    if(!isFirebase) return false;

    this.createMessaging();
    this.bindingEvent();
    // this.registerSw();
    console.log(this.test);
  }

  bindingEvent(){
    this.messaging.onTokenRefresh(this.onTokenRefresh);

    this.messaging.onMessage(this.onMessage);
  }

  onMessage = (payload) => {
    console.log('Message received. ', payload);
  }

  // firebase 
  setFirebase(){
    if(!window.firebase){
      console.error('firebase application이 로딩 되지 않았습니다.')
      return false;
    }

    this.firebase = window.firebase;
    return true;
  }

  // 파이어 페이스 메시지 인스턴스 생성
  createMessaging(){
    this.messaging = firebase.messaging();
  }

  registerSw(){
    navigator.serviceWorker.register('sw.js')
      .then((registration) => {
        this.messaging.useServiceWorker(registration);
      });
  }

  // 알림 수락 요청 레이아웃 출력
  requestSubscribe(){
    // 노티 거부 / 노티 수락 이면 알림 수락 요청 레이아웃을 출력하지도 않는다.
    // if(Notification.permission === 'denied' || Notification.permission === 'granted') return false;
    if(Notification.permission === 'denied' ) return false;
    

    let isSubscribe = confirm(this.subscribeRequestText);

    if(!isSubscribe){
      return false;
    }else{
      this.requestSubscribeFinal();
    }
  }

  // 알림 수락 요청 (시스템)
  requestSubscribeFinal(){
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        this.subscribPermit()
      } else {
        console.log('Unable to get permission to notify.');
        this.subscribDiny()
      }
    });
  }

  // 알림 수락 콜백 
  subscribPermit(){
    this.messaging.getToken().then((currentToken) => {
      if (currentToken) {
        this.sendTokenToServer(currentToken);
        alert('알림을 설정하셨습니다.')
      } else {
        // Show permission request.
        console.log('No Instance ID token available. Request permission to generate one.');
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });
    
  }

  onTokenRefresh = () => {
    messaging.getToken().then((refreshedToken) => {
      console.log('Token refreshed.');
      // Indicate that the new Instance ID token has not yet been sent to the
      // app server.
      setTokenSentToServer(false);
      // Send Instance ID token to app server.
      sendTokenToServer(refreshedToken);
      // ...
    }).catch((err) => {
      console.log('Unable to retrieve refreshed token ', err);
      showToken('Unable to retrieve refreshed token ', err);
    });
  }
  

  // 알림 거부 콜맥
  subscribDiny(){
    alert('알림을 거부 하셨습니다.')
  }
  
  // 서버 전송
  sendTokenToServer(currentToken){
    console.log('sendTokenToServer', currentToken)
  }

  // 포그라운드 알림 수신

};

let pushManager = new PushManager();