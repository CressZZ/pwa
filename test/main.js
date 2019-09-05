class PushMessage {
  constructor() {
    this.firebase;
    this.messaging;

    this.init();
  }

  init() {
    let isFirebase = this._setFirebase();
    if (!isFirebase) return false;

    this._setFirebaseMessaging();
    this._registeServiceWorker();
    this._bindingEvent();
    console.log(this.test);
  }

  _bindingEvent() {
    // 토큰 재생성
    // this.messaging.onTokenRefresh(this._onTokenRefresh);
  }

  // firebaseß
  _setFirebase() {
    if (!window.firebase) {
      console.error('firebase application이 로딩 되지 않았습니다.');
      return false;
    }

    this.firebase = window.firebase;
    return true;
  }

  // 파이어 페이스 메시지 인스턴스 생성
  _setFirebaseMessaging() {
    this.messaging = this.firebase.messaging();
  }

  // service worker 등록
  async _registeServiceWorker() {
    try {
      let registration = await navigator.serviceWorker.register('/service-worker.js');
      this.messaging.useServiceWorker(registration);
      // this.messaging.usePublicVapidKey('BLppNl3zk2o1rPG2NdjU13Om_M5N26eqaxuknZMSlNtmcHhJnRhzldf3_7SEOjOW5tvhWA3BI1ojmMHi_V1ehdQ');

      // FCM 설정 페이지
      // this.messaging.usePublicVapidKey('BOCHoU_Ym8vKG5mjwIVzNTThP_rpcjrI7C2liL3sYhGpAt-leD9V3-ggUaItj5guFW5m5JEwremfCnt_pt2JIrE');
      console.log('[service-worker.js] Serviceworker registrated.', registration);

      window.registration = registration;
    } catch (err) {
      console.error(err);
    }
  }

  // 알림 수락 요청 (시스템)
  async _requestSystemPermission() {
    try {
      let permission = await Notification.requestPermission();
      permission === 'granted' && this._subscribPermit() || this._subscribDiny();
    } catch (err) {
      console.error(err);
    }
  }

  // 알림 수락 콜백
  async _subscribPermit() {
    console.log('[service-worker.js] Notification Permiited');

    try {
      let currentToken = await this.messaging.getToken();

      if (currentToken) {
        this._sendTokenToServer(currentToken);
        alert('알림을 설정하셨습니다.');
      } else {
        console.log('[service-worker.js] It is Notification Permition');
      }
    } catch (err) {
      console.log('[service-worker.js] An error occurred while retrieving token. ', err);
    }
  }

  // _onTokenRefresh = async () => {
  //   try {
  //     let refreshedToken = await this.messaging.getToken();
  //     console.log('Token refreshed.');
  //     this._sendTokenToServer(refreshedToken);
  //   } catch (err) {
  //     console.log('Unable to retrieve refreshed token ', err);
  //   }
  // }

  // 알림 거부 콜맥
  _subscribDiny() {
    alert('알림을 거부 하셨습니다.');
  }

  // 서버 전송
  _sendTokenToServer(currentToken) {
    console.log('sendTokenToServer', currentToken);
  }

  // 알림 수락 요청 레이아웃 출력
  requestSubscribe({ text = '알림을 받으시겠습니까?' } = {}) {
    // 노티 거부 / 노티 수락 이면 알림 수락 요청 레이아웃을 출력하지도 않는다.
    if (Notification.permission === 'denied' || Notification.permission === 'granted') return false;

    let isSubscribe = confirm(text);

    if (!isSubscribe) {
      return false;
    } else {
      this._requestSystemPermission();
    }
  }

  // temp
  async getSubscription  () {
    var sub = await registration.pushManager.getSubscription();
    // return sub;
    console.log(sub.toJSON())
  }


}

(() => {
  window.PushMessage = PushMessage;
  window.pushMessage = new PushMessage();
})();
