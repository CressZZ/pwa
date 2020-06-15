
# 1. PUSH 개발 참고내용
# App ID가 변경될때(FCM) Token이 새로 생성되지 않는다.
- fcm 3.6 기준 Firbase config의 APP Id가 변경 될지라도 token이 재생성 되지 않는다. 
- 즉, 메시지를 받을 수 없다. 
- usePublicVapidKey가 변경 되면 getToken은 변경된다. 
- 즉, 옵션으로 usePublicVapidKey을 주고 APP ID가 변경될 필요가 있을때, VapidKey도 변경해 주면, 토큰이 재생성된다. 


# 하나의 serviceworker에는 하나의 subscription만 존재 한다. 
## a. 다른 path에 같은 serviceworker를 가질경우
- 어느 한쪽 path에서 subscription객체가 변경되면 다른 path의 subscription도 바뀐다. 
- 이게 당연한게, subscribe()메서드가 serivceworkerregistration.pushManager 객체에 있는거니까, 등록되어 있는 serviceworker에 종속되는게 당연하다. 
- 테스트 결과도 일치한다. 

## b. 위의 경우 각기 다른 path에서 다른 VAPID를 가질경우
- 마지막으로 subscription객체를 생성할때 사용한 VAPID가 사용되고, 
- 서버에서는 이 VAPID에 해당하는 Private 키를가지고 있어야 푸쉬를 보낼 수 있다. 
- pushserver(백엔드)에서 잘못된 VAPID를 사용하여 메시지를 보내면 애러가 난다. 

## c. 다른 path (같은 depth) 에서 다른 serviceworker를 가질경우
- 다른 service worker 를 가질 수 없다. 

## d. 다른 path (다른 depth) 에서 다른 serviceworker를 가질경우
- 다른 service worker 를 가질 수 있다. 

## e. 그럼 다른 path (다른 depth) 에서 다른 serviceworker를 가질경우에 다른 subscribe()을 가지며, push를 발송한 경우 두개의 push를 수신 받는가?
- 그렇다

# VAPID & GMC(FCM) - Push 보내는 방법의 과거와 현재
- `gcm_sender_id` 는 과거의 방법이다. 
- 현재는 `applicationServerKey`즉 `VAPID` 를 사용한다. 
- 간단히 말하면, `web push protocal`이 정착되기 전 과거 브라우저는 `GCM(FCM) protocol`을 사용하였고 보안상의 문제로  
- `gcm_sender_id`를 `menifest.json` 에, 
- 타겟이 크롬인 경우`Server key(GCM API key)` 도 함께 `Authorization headerer`에 넣어야 한다.
- 그러나 요즘 브라우저는 `web push protocal`을 사용며 `VAPID`를 사용하고 있고, 이때는 위 `gcm_sender_id` 및 `Server key(GCM API key)`가 필요 없다.
- 42버전과 51버전 사이의 크롬은 구글 클라우드 메시징을 사용해 푸시 메시지를 구현하였고, 오페라와 삼성 브라우저도 같은 방법을 사용했다. 즉, 이전 버번의 브라우저에서도 푸시 알림이 작동하기바란다면 VAPID 키 이외에도 GCM API(gcm_sender_id) 키를 생성해야 한다. 

# `GCMAPIKEY` = `GCM-API-KEY` = `GCM Server Key` 
예전에 `VAPID` 도입전에 GCM(FCM)을 사용하여 푸시를 할경우, 그리고 그 푸시를 `크롬`에 할경우 필요 했던 API 값. (`header`)

# `gcm_sender_id` = `GCM 발신자 ID`
예전에 `VAPID` 도입전에 GCM(FCM)을 사용하여 푸시를 할경우, 그 푸시가 `크롬이든 아니든` 간에 꼭 넣어 줘야 하는 값. (`manifest.json`)

# service worker 등록 로직
- `navigator.serviceWorker.register('sw.js')` 에서 `navigator` 는 브라우저의 종류와 버전 등 웹브라우저 전반에 대한 정보를 제공하는 객체로 즉 `해당 브라우저`에 `service worker`를 등록 시키겠다는 뜻이다. 
- 이때, `navigator.serviceWorker.register('sw.js')` 는 기본적으로 서비스 워커 등록의 범위 값은 서비스 워커 스크립트가있는 디렉토리로 설정됩니다. 즉,  `navigator.serviceWorker.register('sw.js', {scope: './'})` 의 줄임 말이다. 
(https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Examples)
- `register('sw.js')` 에서 `service worker` 파일의 상대경로 기준은 해당 `html`페이지가 있는 곳을 기준으로 한다.
- 예를 들면 `/test/index.html` 에서  `navigator.serviceWorker.register('sw.js')` 메서드를 호출하면, `/test/sw.js` 를 `navigator`에 등록시키 겠다는 이야기 이다. 

- 절대경로로 들어갈 경우 `register('/sw.js')` `root` 페스가 된다. 
- 지금까지 간과하고 있던 게 바로 `scope`의 중요성 인데, 그 이유는 `service worker`는 `브라우저에` 설치 되는 것이고 (`path`나 `domain`에 등록되는 것이 아니다.)
- 하나의 `scope` (`도메인`을 포함한 `path`) 는 하나의 `service worker`에 의해 제어 될 수 있으며,
- 그렇기 때문에 다른 path (같은 depth) 에서 다른 serviceworker를 가질수 없는 것이다.
- 즉, `service worker`는 `service worker`를 등록한 페이지(`path`) 에 자동으로 종속 되는 것이 아니라, (종속 된다고 생각되는 이유는 `service worker` 등록시 `scope` 설정을 안해 주면, 그 `service worker` 파일이 있는 곳이 `scope`로 지정되기 때문이다. )
- `scop`를 설정 할 수 있는 것이다. 
- 아래의 예시처럼 하나의 페이지에서 두개의 서비스 워커 등록이 가능하고 (`service worker`는 `navigator`에 등록 되는 것이므로 몇 개든 등록 가능하다)
- 각 등록된 `service worker`의 `scope`를 정의 해줘야 한다.

```js
// /test/index.html

/*
 * 상대경로로 지정된 sw6.js는 /test/ 에 있으며
 * service worker scope는 default 이므로  /test/ 로 지정된다.
 */
navigator.serviceWorker.register('sw6.js') 

/*
 * 상대경로로 지정된 sw6.js는 /test/ 에 있으며
 * service worker scope는 test/ 이므로  /foo/ 로 지정된다.
 */
navigator.serviceWorker.register('sw6.js', {scope: '/foo/'})

```

# 랜선 뽑은상태에서 구독 생성 (subscribe) 하면 어떻게 되는가
- 구독 되지 않는다. 
- 단 크롬 devtool에서 오프라인 상태로 설정하고 subscribe 하면 구독 된다. (완전한 offline 상태가 아니여서 인것 같다.)

# 구독정보가 미리 생성되어 있는 경우 랜선 뽑으면 어떻게 되는가
- 구독 정보 가져 온다. 
- swRegistration.pushmanager.getSubscription 에 정보가 있는 것으로, swRegistration이 가지고 있을 것이다. 

# subscription 구독시 VAPID 는 필수 이다. 
- https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe#Browser_compatibility
- VAPID 없이 생성하려고 하면 애러가 난다 .


# token이 삭제될 경우 ***(중요)***
## token이 삭제될 경우에는 크게 모바일 인터넷 사용 기록 삭제를 눌렀을 경우가 있다. (디폴트로 선택 되어 있는 것만 삭제)
### 1) 크롬 
- 노티 설정은 그대로, 토큰은 날라가는 것으로 보임
- 즉 push 안옴, push 받을 건지 알림창 생성도 안됨
- `쿠키 및 사이트 데이터` 삭제가 디폴트 + `사이트 설정`은 별도로 선택 가능 하게 되어 있음
### 2) 삼성 인터넷 
- 노티 설정 디폴트로 변경, 토큰도 날라가는 것으로 보임,
- 즉 push 안옴, push 받을 건지 알림창 생성은 됨.
- `쿠키 및 사이트 데이터` 삭제가 디폴트 + `사이트 설정`은 별도로 선택 불가. 아마 임의로 디폴트에 포함 되어 있는것 같음
### 3) 파이어 폭스 
- 노티 설정 디폴트로 변경, 토큰은 날라가는 것으로 보임, 
- 즉 push 안옴, push 받을 건지 알림창 생성은 됨.
- `쿠키`, `오프라인 웹 데이터` + `웹 사이트별 설정` 삭제가 디폴트
### 4) 위 세가지 경우 모두
- `사이트 데이터` 또는 `오프라인 웹 데이터` 가 삭제 됨으로서 service worker에 저장된 token 도 삭제 된는 것으로 보임 

## 삭제됬을 경우에 발생할수 있는 문제
- 일단 우리 로직의 기본은 `노티 설정` 허용 여부에 따라 `push 받을 건지 알림창 생성` -> `토큰 생성` -> `토큰 전송` 로직이다.
- 하지만 위의 경우와 같이 `노티 설정`은 허용 되어 있는데, `토큰` 이 `삭제`되거나, 혹은 `갱신` 되는 경우가 있을 수 있다. 
- 그럼 해당 servie woker는 `노티 설정`이 허용되어 있어 `토큰`을 생성하지 못하고, `push`를 받을 수 없게 된다. 

## 해결방안
- 따라서, 초기 토큰 생성시, 서버에 전송후 해당 토큰을 `sha-256`으로 인코딩 하여 쿠키로 하나 구워 버리고, 
- `pushMessage.js` 파일이 로딩 될때, 일단 service worker가 가진 token을 `messaging.getToken()` 으로 가져와 쿠키와 비교후, 
- 쿠키가 없거나, 값이 다르면 서버에 `push/register` API를 호출 하는 방식을 가져야 한다. 

## 왜 위와 같은 해결 방안을 적용 해야 하는가?
- FCM 에서는 현재 service worker가 token을 가지고 있는지 없는지 확인이 안된다. 
- `messaging.getToken()` 이라는 하나의 메서드만 존재 하는데, 이 메서드는 Token이 없으면, Token을 만들고, Token이 있으면 Token을 가져 오기 때문이다. 
- 따라서 `messaging.getToken()`으로 가져온 토큰이 이번에 새로생성된 토큰인지 아닌지 알 수가 없다. 
- 그렇다고 `messaging.getToken()`으로 가져오 토큰을 매번 서버에 전송하는 것은 리소스가 너무 크므로 말이 안된다. 

# 프론트 스크립트에서 usePublicVapidKey 사용 안했을 경우 
- `webpush 프로토콜 전송` :  전송 안됨 (VAPID가 다를 것으로 생각됨)
- `fcm 프로토콜 전송` : 전송 됨

# 프론트 스크립트에서 usePublicVapidKey 사용 했을 경우 (fcm 관리자 페이지에서 제공하는 VAPID)
- `webpush 프로토콜 전송` :  전송 됨
- `fcm 프로토콜 전송` : 전송 됨

# 프론트 스크립트에서 usePublicVapidKey 사용 했을 경우 (별도로 생성된 VAPID)
- `webpush 프로토콜 전송` :  전송 됨
- `fcm 프로토콜 전송` : 전송 안됨 (Token 값이 생성 안됨)

# usePublicVapidKey 변화에 따른 - getPublicVapidKey_()
- usePublicVapidKey 사용 안한것과, 사용 한것의 PublickKey는 다르다. (당연한 이야기)
```js
// 사용 안했을 경우 
messaging.getPublicVapidKey_().then(e=>console.log(e))
// Uint8Array(65) [4, 51, 148, 247, 223, 161, 235, 177, 220, 3, 162, 94, 21, 113, 219, 72, 211, 46, 237, 237, 178, 52, 219, 183, 71, 58, 12, 143, 196, 204, 225, 111, 60, 140, 132, 223, 171, 182, 102, 62, 242, 12, 212, 139, 254, 227, 249, 118, 47, 20, 28, 99, 8, 106, 111, 45, 177, 26, 149, 176, 206, 55, 192, 156, 110]


// 사용 했을 경우 (fcm 관리자 페이지에서 제공하는 VAPID)
messaging.getPublicVapidKey_().then(e=>console.log(e))
//Uint8Array(65) [4, 224, 135, 161, 79, 216, 155, 203, 202, 27, 153, 163, 192, 133, 115, 53, 52, 225, 63, 250, 233, 114, 58, 200, 236, 45, 165, 136, 189, 236, 98, 17, 169, 2, 223, 165, 120, 63, 85, 223, 232, 32, 81, 162, 45, 143, 152, 46, 21, 110, 102, 228, 145, 48, 173, 233, 159, 10, 123, 127, 166, 221, 137, 34, 177]


// 사용 했을 경우 (별도로 생성된 VAPID) 
//  "publicKey": "BOb7YRPDUwv_i3Hbeccn7Pv7IQ_Rt7t18R6wQ1IvIV1iH0-Cj8lAI2a7Jls6xOzFbdXluL5nrmS-QVwKSK_o9T4",
//  "privateKey": "ZuJ_7RUpSMZSMp62VV1zDJtZ8mggo_QlTnNBQGWHJQA"
messaging.getPublicVapidKey_().then(e=>console.log(e))
// Uint8Array(65) [4, 230, 251, 97, 19, 195, 83, 11, 255, 139, 113, 219, 121, 199, 39, 236, 251, 251, 33, 15, 209, 183, 187, 117, 241, 30, 176, 67, 82, 47, 33, 93, 98, 31, 79, 130, 143, 201, 64, 35, 102, 187, 38, 91, 58, 196, 236, 197, 109, 213, 229, 184, 190, 103, 174, 100, 190, 65, 92, 10, 72, 175, 232, 245, 62]
```

- usePublicVapidKey 사용 안한것과, 사용 한것의 messaging Token값이 항상 다르다. 
- 매번 새로 생성하기때문에


# usePublicVapidKey 변화에 따른 - FCM 프로토콜 & webpush 프로토콜  전송
-  usePublicVapidKey 바꿀때 subscription은 변경되지 않기때문에 
- `usePublicVapidKey 바꿀때 마다, service-worker 재등록 필요`
- 해당 내용은 (https://github.com/web-push-libs/web-push-php/issues/58), (https://github.com/w3c/push-api/issues/291) 에서 살펴 볼수 있다.
- 참조 (https://w3c.github.io/push-api/)
If the Service Worker is already subscribed, run the following substeps:
Retrieve the push subscription associated with the Service Worker.
If there is an error, reject promise with a DOMException whose name is "AbortError" and terminate these steps.
Let subscription be the retrieved subscription.
Compare the options argument with the options attribute of subscription. If any attribute on options contains a different value to that stored for subscription, then reject promise with an InvalidStateError and terminate these steps. The contents of BufferSource values are compared for equality rather than references.
When the request has been completed, resolve promise with subscription.
- appid가 변경된다고 token이 재생성 되지는 않늗다.
- 단, usePublicVapidKey가 변경 되면 getToken은 변경된다. 
- firefox 브라우저의 경우 subscription의 endpoint는 항상 `mozila` 이다.

# PUSH API를 사용할때, (FCM x) ApplicationServerKey(VAPID) 가변경 될 경우에도, Subscription은 자동으로 변경되지 않는다. 
- 해당 내용은 (https://github.com/web-push-libs/web-push-php/issues/58), (https://github.com/w3c/push-api/issues/291) 에서 살펴 볼수 있다.
- 참조 (https://w3c.github.io/push-api/)
- Subscription을 변경 하려면, 기존의 Subscription의 ApplicationServerKey와 변경될 ApplicationServerKey를 비교해야 하는데, 비교하는 법에 대해 자세히 나온게 없다. 
- 임의로 찾아낸 방법은 아래와 같다. 
```js
// main.js
// 1. 기존 subscripltion ApplicationServerKey
var test;
registration.pushManager.getSubscription().then(e=>test = e.options.applicationServerKey) // ArrayBuffer(65);
var test2 = new Uint8Array(test); // Uint8Array(65) 
var test3 = test2.join(','); // string

// 2. 변경할 ApplicationServerKey
var test4 = urlB64ToUint8Array('BHudr6Q2-mMVjpfXiu3fvQ6OSjl_iOmSQd4kTqN7hc8R8RjpQUsjPHhGvFvZd6n7oFriB3vPFNl_XrQIHOeiHjo').join(',') //string

// 3. 비교
test3 === test4 

```

# registration.showNotification
## tag
- 알림을 나타내는 고유 식별자 입니다. 만약 현재 표시되 ㄴ태그와 동일한 태그를 가진 알림이 도착하면, 예전 알림은 조용히 새 알림으로 대체됩니다. 
- 알림을 여러개 생성해 사용자를 귀찮게 하는 것보다 이 방법이 더 좋은 경우가 많스니다. 예를 들어, 메시징 앱에 안 읽은 메시지가 하나 있는 경우, 알림에 그 메시지 내용을 포함하고 싶을 것입니다. 그런데 기존 알림이 사라지기 전에 다섯개의 신규 메시지가 도착해다면, 여섯개의 별도 알림을 보여주는 것보다 6개의 새로운 메시지가 있습니다. 와 같이 기존 알림 내용을 업데이트 하는 것이 더 좋습니다. 
- [만들면서 배우는 프로그래시브 웹 p.284]
## renotify (boolean)
- 같은 태그로 보내면 조용히 대체 되나, 태그 값을 주면서 renotify를 주면, 교체 될때  알림이 왔다고 표시한다. 
- renotify가 true인데 tag가 빈값이면, TypeError가 전달된다.(https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification)

# 알림 안드로이드 크롬의 경우
- 디폴트가 소리로만 알림이다. 변경하기 위해서는 설정에서 중요도를 긴급으로 변경해야 합니다. 
- 인스톨 뒤에 중요도를 긴급으로 변경했음에도 불구하고 다시 디폴트가 소리로만 알림으로 변경된다. 마찬가지로 변경하기 위해서는 설정에서 중요도를 긴급으로 변경해야 합니다. 

# tip
- `Navigator.serviceWorker.register('sw.js')` 가 없어도, 한번등록된 serviceworker는 내용이 변경되면 업데이트 하려고 한다.


# Notification icon & badge image size (알림 아이콘 및 뱃지 이미지 사이즈에 대해)
## icon
- `192px`
- Sadly there aren't any solid guidelines for what size image to use for an icon. Android seems to want a 64dp image (which is 64px multiples by the device pixel ratio). `If we assume the highest pixel ratio for a device will be 3, an icon size of 192px or more is a safe be` (https://developers.google.com/web/fundamentals/push-notifications/display-a-notification)

## badge
- `72px`
- As with the icon option, there are no real guidelines on what size to use. Digging through Android guidelines the recommended size is 24px multiplied by the device pixel ratio. `Meaning an image of 72px or more should be good (assuming a max device pixel ratio of 3).`

# Splash Image
- IOS 의 경어 2019년 04월부터  polyfil 형식으로 splash 적용
- https://stackoverflow.com/questions/55840186/ios-pwa-splash-screen


# onTokenRefresh
- 언제 FCM토큰이 재생성 되는가!
- 구현되지 않았다!!!
- https://github.com/firebase/quickstart-js/issues/217
- https://stackoverflow.com/questions/42136312/how-i-can-test-firebase-notification-ontokenrefresh-method-call-in-javascript


# Push & Notification 작동 원리 
[https://w3c.github.io/push-api/#widl-PushSubscription-unsubscribe-Promise-boolean]  
![](./sequence_diagram.png)
[프로레시브 웹 앱의 모든것 p.271]
## Permission for Push Notifications
## Subscriptions
- push 등록은 각 `device` 와 `browser`별로 등록된다. 즉 같은 device의 다른 browser라면 다른 사용자로 인식한다. 
- 기존에 등록된 `subscript`이 없다면 새로운 `subscrition`을 생성해야 하며, 이 `subscription`은 `backend server`로 전달 되어야 한다. 
## Push server (Push Service)
- Push notification은 별도의 external server(browsr vendor에서 제공하는 push server)를 필요로 한다. 
- push마다 어떤 message를 app(아마도 web page)에 전달하기 위해서는 browser의 도움이 필요로 한다. 
- 우리의 APP(web page) 자체로는 message를 수신 할수 없기 때문이다. 
- (web socket을 만들수도 있지만, 우리 app이 항상 오픈 되어 있어야 작동하기 때문에 적합하지 않다.)
- Browser vendor(공급자)는 자사의 browser로 어떤 app을 이요하는 사용자에게 push를 발송하기 위한 `Push server(Push Service)` 를 제공한다. 
- Google, Mozilla 등 각각의 browser vendor가 push server(Push Service)를 가지고 있고, 해당 browese사용자에게 push를 발송하기 위해서는 vendor의 push server(Push Service)에 연계된 setting이 필요하다. 
## End point
- push server(Push Service)는 각 browser vendor의 소유 이므로 우리가 설정 할 수는 없다. 
- 단, 우리가 javascript로 `new subscription`을 setup하면 (​`ServiceWorkerRegistration.PushManager.subscribe(options)`) javascript는 자동으로 browsder vendor에서 제공하는 push server(Push Service)에 접근해서 `Endpoint`를 가져온다.
- 새로 등록된 subscript은 push API endpoint 정보 `(push server의 url)` 을 가지게 되고, 각가의 등롣된 `device-browser`마다 자신만의 다른 endpoint를 가지게 된다. 

### google의 endpoit 예시
```json
{
    "endpoint": "https://fcm.googleapis.com/fcm/send/d2Qi49CN31o:APA91bE41fL9u_kXfOmGEb6sdafOvdKPcvoHswJpMaX29PKeYzrZC2eT_wJ0lPL2YfDuK888wTUd8kSPFFEsDqxWJZgzu_XluhuG8-ACgZuauKHHqL1KpbBLjQngYgR477H6Piw-RVUA",
    "expirationTime": null,
    "keys": {
        "p256dh": "BECMKgghrm4EpyyCr2lQocH1KKWZTGVqbRf3QK8A0L2sYIQHgMczqrnxy6qTOFwZ3puyqGNbKmr0A3SQO_4dbl4",
        "auth": "ZlmR3iS9NgvzgOsD8j6iDA"
    }
}

```
### mozila의 endpoit 예시
```json
{
    "endpoint": "https://updates.push.services.mozilla.com/wpush/v2/gAAAAABdIbR7rKOoWIlaR-dF3fszV4W2hQusl4HpWsOJlA8Dc5VleB4mpCnhD7Oi1qer--DSPbJTiurEjjTUbgjPQAkQmwjxvyifArIYhTPiqhB7G19A5q_NAVctKmgESy1Vakz8v2MM5ezL10bch0Id0It3sqtd0ug9wKAuypUsU5O9CkkPMnc",
    "keys": {
        "auth": "CeC6IOLjchl1p4aCneY2Tg",
        "p256dh": "BNzA-UaiBZ_jw9nzg24AaEQEo_MhrILwj99roIAUE_11tgVyd62-NEk7WV4_pZYxYvhR56R3AjAXESby68HogXA"
    }
}
```
## push message
- endpoint는 push server(Push Service)의 url이며 우리는 이 endpoint url로 new push message를 send하게 된다. 
- browser vendor(push server)는 이 push message를 각 web app에 전달 한다. 

## Authentication information
- endpoint 유출 시 endpoint를 아는 누구나가 push message를 보낼 수 있다. 
- 그래서 특별한 key 가 필요하다. 
- 설정한 key에 의해서 subscription생성시(`​ServiceWorkerRegistration.PushManager.subscribe(options)`) authentication정보도 만들어 지는다. 이 인증 정보는 우리만이 우리의 web app 에 push 할수 있도록 분별해 준다. 
## subsription과 backend server 
- browser vendor의 push server와는 별개로 우리 app의 code가 구동 될 수 있는 backend server도 필요하다. 
- 사용자 app의 servidce worker는 new subscription을 생성하고
- subscription은 endpoint등에 대한 정보를 가지고 있으면, 
- backend 서버는 각각의 subscription을 가 보관한다. 

# Push & Notification에 대한 이해
- 각 브라우저는 각 push service를 가지고 있고, 백엔드 서버는 push service에 푸시를 보낼 메시지를 보낸다. 
- push service는 적절한 디바이스-브라우저에게 푸시를 보내고
- 서비스 워커는 해당 푸시를 받고, 브라우저를 깨운다. 

> There are several pieces that come together to make push notifications work. Browsers that support web push each implement their own push service, which is a system for processing messages and routing them to the correct clients. Push messages destined to become notifications are sent from a server directly to the push service, and contain the information necessary for the push service to send it to the right client and wake up the correct service worker. The section on the Push API describes this process in detail.  
When it receives a message, the service worker wakes up just long enough to display the notification and then goes back to sleep. Because notifications are paired with a service worker, the service worker can listen for notification interactions in the background without using resources. When the user interacts with the notification, by clicking or closing it, the service worker wakes up for a brief time to handle the interaction before going back to sleep.  [https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications#working_with_data_payloads]

# unsubscription
- 구독은 서비스 워커 하나에 유일하다. 
- 구독 된 상태에서 구독 하면 같은 subscription을 반환 한다. 
- 구독 해지 하고 재 구독 하면 다른 subscription을 반환 한다. 
- **구독 된 상태에서 오프라인 상태에서 구독 해지 후 온라인에서 구독 하면 새로운 구독이 된다** => **데이터베이스에는 예전 구독이 남아 있다**


# TTL 푸시 서비스에서 메시지를 보관하는 기간
- 0 으로 지정해 주자 (크롬 디폴트는 4주)

## chrome
- https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications
Managing Notifications at the Server
So far, we've been assuming the user is around to see our notifications. But consider the following scenario:

The user's mobile device is offline
Your site sends user's mobile device a message for something time sensitive, such as breaking news or a calendar reminder
The user turns the mobile device on a day later. It now receives the push message.
That scenario is a poor experience for the user. The notification is neither timely or relevant. Our site shouldn't display the notification because it's out of date.

You can use the time_to_live (TTL) parameter, supported in both HTTP and XMPP requests, to specify the maximum lifespan of a message. The value of this parameter must be a duration from 0 to 2,419,200 seconds, corresponding to the maximum period of time for which FCM stores and tries to deliver the message. Requests that don't contain this field default to the maximum period of 4 weeks. If the message is not sent within the TTL, it is not delivered.

Another advantage of specifying the lifespan of a message is that FCM never throttles messages with a time_to_live value of 0 seconds. In other words, FCM guarantees best effort for messages that must be delivered "now or never". Keep in mind that a time_to_live value of 0 means messages that can't be delivered immediately are discarded. However, because such messages are never stored, this provides the best latency for sending notifications.

## mozila
- https://blog.mozilla.org/services/2016/02/20/webpushs-new-requirement-ttl-header/

# web-push library (백엔드에서 푸쉬 보낼때 사용 할 라이브러리)
- https://developers.google.com/web/fundamentals/push-notifications/sending-messages-with-web-push-libraries

# webpush.sendNotification(pushSubscription, payload, options)
## payload
- argument 중 payload 값은 text 또는 node buffer 값으로 들어가야 한다. 
>The payload is optional, but if set, will be the data sent with a push message. This must be either a string or a node Buffer. [https://www.npmjs.com/package/web-push]




# 2. APP INSTALL 개발 참고내용

## scope 
- manifest.json에서 `scope` 혹은 `start_url` 멤버로 정의 된 스코프를 벗어나면 상단에 주소 url 이 표기 되는등 정상 적인 화면이 아닌 다른 화면이 보어거나, 브라우저가 실행된다. 
  

## start_url 과 scope
- If the scope member is not present in the manifest, it defaults to the parent path of the start_url member. For example, if start_url is /pages/welcome.html, and scope is missing, the navigation scope will be /pages/ on the same origin. If start_url is /pages/ (the trailing slash is important!), the navigation scope will be /pages/.
- Developers should take care, if they rely on the default behavior, that all of the application's page URLs begin with the parent path of the start URL. To be safe, explicitly specify scope.
(https://www.w3.org/TR/appmanifest/)


- 말인 즉슨 `scope`를 제대로 안적어 주면 `scope`의 디폴트 값은 `start_url`의 디폴트로 정의 해준 값의 `parent path`가 스코프로 정의 된다는 거다. 왠만하면 `scope`를 적어 주라고 하고 있다. 
- 실제로 내가 적용했을때 `satrt_url: index/?aplication=pwa` 같이 정의 했더니, `https://test.com/page1/test.html` 이 `scope`에서 벗어난것처럼 작동 되었다. 왜냐하면 여기서 `scope`는 `index/` 하위의 path가 될거고, 도메인 하위의 `/page` path는 `scope`에서 벗어난게 되기 때문이다!