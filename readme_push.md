
# PUSH 
## 1) 개요
- `웹 앱`에 `네이티브 앱` 처럼 푸쉬 메시지를 보낸다. 
### (1) 모바일 환경에서 push 기능
#### `모바일`인 경우 `네이티브 앱`과 동일하게 브라우저가 종료된 상태에서도 푸쉬 메시지가 온다. (https://developers.google.com/web/fundamentals/push-notifications/faq) 

[# Why doesn't push work when the browser is closed?](https://developers.google.com/web/fundamentals/push-notifications/faq)

> 브라우저가 닫힌 상태에서는 왜 푸쉬가 동작하지 않나요?  
>이 문제는 복잡합니다.  
>안드로이드를 생각해 보면, 안드로이드 os는 push message가 들어오면, 해당 어플리케이션을 깨우도록 설계되어 있습니다. 해당 어플리케이션이 닫혀있든 그렇지 않든 말이죠.  
> 안드로이드의 브라우저 역시 정확히 같은 동작을 합니다. 푸쉬 메시지가 오면 (특정)브라우저는 깨어 날 것이고, (특정)브라우저는 해당 service worker를 깨우고 service worker에 push event를 dispatch 할 것입니다.  
> 데스트탑 OS의 경우에는 좀더 미묘합니다. 맥 OS X의 경우가 설명하기 쉬울 것 같은데, 맥 OS X의 경우에는 시각적인 설명이 가능하기 때문입니다.   
> 맥 OS X의 경우 dock의 프로그램 아이콘아래에 표시되는 marking에 의하여 프로그램이 구동중인지 아닌지를 알 수 있습니다.   
> 두개의 크롬 아이콘이 dock에 있다고 칩시다. 하나는 아이콘 아래에 marking 표시가 있고, 이것은 running 중이라는 것을 보여 줍니다. 다른 하나는 marking 표시가 없고 이것은 running중이 아님을 보여 줍니다.   
> 예시  
> 푸쉬 메시지가 데탑에 전송된 상화에서, 브라우저가 running중이라면 우리는 푸쉬 메시지를 받을 수 있을 것 입니다. 즉, 아이콘 아래에 marking 표시가 있는 경우 입니다.    
> 이것은 윈도우가 열려 있지 않는 브라우저가 가능 하다는 이야기 이며, 우리는 우리의 서비스 워커가 푸쉬 메시지를 받을 것 이라는 이야기 입니다. 왜냐하면 브라우저가 백그라운드 상에서 구동 중이기 때문입ㄴ디ㅏ.  
> 브라우저가 완전히 닫혀 있는경우 우리는 푸쉬를 받을 수 없습니다. 즉. marking 표시가 없을 때입니다. 위도우도 마찬가지 입니다.   

### (2) pc 환경에서 push 기능
#### `pc`환경인 경우 브라우저 및 install된 웹앱이 백그라운에서 동작하고 있어야 한다. 
- 자세한 내용은 위 `mobile` 환경 참조 

## 2) PWA중 push를 사용하기 위해 필요한 기술
### (1) Service-worker (PUSH API, FCM API)
- `service worker`를 등록하면 `serviceWorkerRegistration`객체를 얻을 수 있고,
- `serviceWorkerRegistration`은 `Push API`의 인터페이스인 `pushManager`, `PushSubscription`, `PushEvent`, `PushMessageData`를 프로퍼티로 가지고 있고, 
- `push service`를 위해서는 후술할 `FCM`을 사용하든, 네이티브 `Push API`를 직접 사용하든 `Push API`는 꼭 필요하며, 따라서 `service woker`가 필수 조건이 된다. 
- 하나의 `service worker` 는 하나의 `subscription(구독정보)` 만 가질 수 있다. 
- 이론적으로는 다른 `depth`에 다른 `service worker` 가 설치 되어 있다면, 하나의 도메인이 여러개의 `subscription(구독정보)`을 가질 수 도 있다.

### (2) SSL / Localhost
- `Service worker` 사용이 필수 이므로 `SSL`환경 역시 필수 이다.  

### (3) Push API
- `subscription(구독정보)`를 만들거나 지우고 => (메시지를 `어디에` 보낼건지)
- `메시지 수신 이벤트`를 바인딩 한다 => (메시지를 `받는다`)

### (4) Notificatoin API
- 수신된 메시지를 `보여준다.`
- `Notificatoin API`를 위한 `Interface` 는 아래 두군데에서 가지고 있으며 비슷하게 동작 하고, 어디서 사용하든 상관 없다. 
    - `ServiceWorkerGlobalScope` 
    - `window`

## 3) Push API (Native Push Service) & Friebase Cloude Message
- `Push API` 를 사용하는 방법(`구독정보 생성`, `메시지 수신`)에는 크게 두가지가 있다.
    - 1) 직접 Push API를 사용거나
    - 2) FCM(Friebase Cloude Message) SDK 를 사용한다. 

### (1) Push API (Native Push Service)
- `Push API`를 직접 사용한다. 
- `2016년 7월` `VAPID`가 도입되면서 크롬은 `Push API`을 지원 하였고, 
- 크롬은 푸쉬를 보내기 위한 서비스를 기존 `GCM`에서 `FCM (Push API 사용)`으로 변경 하였다. 
- 크롬이 지원하니까 표준으로 봐도 좋을듯 하다.
- 상세 사용 방법은 링크 참조 : https://developers.google.com/web/fundamentals/codelabs/push-notifications/

### (2) Friebase Cloude Message
- `Push API`를 `FCM (Push API 사용)`을 통해 사용한다. 
- 상세 사용 방법은 링크 참조 : https://firebase.google.com/docs/cloud-messaging/js/client 
- 최소한 web 환경에서의 FCM 사용은 일종의 라이브러리 라고 생각하면 된다.
- 자세한 용어에 대한 내용은 아래 참조 (https://developers.google.com/web/fundamentals/push-notifications/faq)  

[# What is the deal with GCM, FCM, Web Push and Chrome?](https://developers.google.com/web/fundamentals/push-notifications/faq)

> 이 질문에 대한 대답은 다양하지만, 가장 쉬운 접근방법은 `web push`와 `Chrome`에 대한 역사를 살펴 보는 방법 입니다. (걱정 마세요. 짧습니다.)   
> 목요일, 2014년     
> 크롬이 처음 web push를 시행할때, 크롬은 서버에서 브라우저로 메세지를 보내기 위해 `Google Cloud Messaging` (GCM)을 사용 하였습니다.   
> 이것은 `web push가 아닙니다!` Chrome과 GCM의 초창기 설정이 실제 web push가 아닌 것에는 몇 가지 이유가 있습니다.
> GMC을 사용하기 위애서는 개발자가 `Google Developers Console`계정을 만들어야 했습니다.   
> 크롬과 GCM은 메시지를 정확하게 설정할 수 있도록 웹 앱에서 공유 되어야할 특별한 sender ID가 필요했ㅅ브니다. 
> GCM을 위한 서버는 web standard가 아닌 custom API를 적용하경슷ㅂ니다.
> 6월 2016 
> 2016뇬 6월에 `Application Server Keys(or VAPID)`라는 새로운 기능이 web push에 나타났습니다. 크롬이 이 새로운 API를 지원하게 되었을때, 크롬은 GCM대신 `FCM`(크롬이 사용하는 `web push service`)을 메시지 서비스로서 사용하게 되었습니다. 아래는 그 FCM을 사용하게 된 중요한 이유 입니다.  
> 크롬과 `Application Server Keys`는 `Google 또는 Firebase`에서 설정해야할 그 어떤 프로젝트도 필요 없게 되었습니다.   
> `FCM`(크롬이 사용하는 `web push service`)은 모든 `web push service`들이 지원하는 `API`인 `web push protocol`을 지원하게 되었습니다. 이것의 의미는 브라우저가 어떤 `push service`를 이용하든, 똑같은 종류의 request를 만들면 메시지를 보낼수 있다는 의미 입니다. 
> 왜 혼란스럽다 오늘?  
> 오늘날 `web push`를 주제로 쓰여진 문서들, 그중에서도 `GCM`과 `FCM`을 참조하는 문서들은 많은 혼란을 야기 합니다. 일단, `GCM`관련 문서에 대해서는 꽤 오래된 문서라고 생각해도 좋고 그 문서는 크롬에 초점이 맞춰진 문서라고 생각하십시요! (글쓴이는 이러한 많은 오래된 포스트에 대해 죄책감을 가지고 있습니다.)  
> 반면 웹 푸시는 브라우저의 입부분 이라고 생각 해봅시다. 브라우저는 푸시 서비스를 이용하여 메시지를 송, 수신 하며, 푸시 서비스는 `웹 푸시 프로토콜`로 만들어진 request요청을 사용합니다. 이러한 관점에서 보면 우리는 어떤 브라우저가 어떤 푸시서비스를 사용하고 있고 어떻게 작동하는지 무시 할 수 있습니다.  
> 이 가이드는 표준적인 접근법에 관점을 두고 있으며, 그 이외에는 일부로 언급하지 않습니다.  
> 파이어 베이스는 왜 Javscript SDK를 가지고 있나요? 그리고 그게 뭔가요?  
> 여러분들 중에는 자바스크립트의 `messaging API`인 `Firebase web SDK`에 대해 알고 있으며 관심이 있을 것입니다. 여러분은 아마도 이게 `web push`와 어떻게 다른거야! 라고 궁금해 할 것입니다.  
> 이 메시징 SDK(`Firebase Cloud Messating JS SDK`라고 알려진)는 웹 푸시를보다 쉽게 ​​구현할 수 있도록 몇 가지 트릭을 제공합니다.  
> `FCM JS SDK`를 사용하면 `PushSubscription`객체가 가지고 있는 많은 `메서드`와 `프로퍼티`에 대한 이해 없이 우리는 `FCM Token(a string)`만 가지고 있으면 됩니다.  
> 유저들 각각의 `token` 을 이용하면 푸시 메시지를 전송할 수 있는 적절한 `FCM API`를 사용 할 수 있습니다. 이 API는 암호화된 `payloads` 가 필요하지 않습니다. 단지 plain text로 만들어지 payload를 post 방식으로 body넣어 날리기만 하면 됩니다.  
> FCM의 API는 여러 커스텀 기능을 지원하고 있는데, 예를 들면 `FCM Topics`가 바로 그것 입니다. (`FCM Topics`는 웹에서도 작동 하지만, 문서화가 잘 되어 있지는 않습니다.)   
> 끝으로 `FCM`은 `Androiod`, `iOS`, 그리고 `web`을 모두 지원합다. 그렇기 때문에 각각 다른 플랫폼을 담당하는 서로 다른 팀들이 쉽게 협력할수 있습니다. `FCM` 코드 뒤에서 `web push`를 사용하지만, `FCM`의 목적은 `web push`를 사용하는 방법을 추상화 하는 것 입니다.   
> 내가 아까 전에 질문에 대답 한것 처럼, 만약 `web push`를 딱 `browser`와 `push service`때문에 고려하고 있다면 간단한 웹푸시 구현 작업을 위해 하나의 `library`로서 `Messaging SDK in Firebase`를 사용하는 걸 고려 할수 있을 것입니다.  

### (3) Friebase Cloude Message 적용
- `Push API`를 쉽게, 넓게 쓰게 하는 것이 `FCM`이라고 생각하면 좋은데, 
- 문서등이 보기 어렵게 되어 있는듯 하고, Native위주인 경향도 있어서 개념잡기가 어려울 수 있다. 
#### a. 문서에 대해 
- 기본적으로 영어 문서이나, 한글로 변경 할수 있지만, 한글로 변경하면 왼쪽에 카테고리 목차가 사라진다!
- 프론트엔드 FCM `가이드` : https://firebase.google.com/docs/cloud-messaging/js/client
- 프론트엔트 FCM `API` : https://firebase.google.com/docs/reference/js/firebase.messaging.Messaging
--- 
- 서버 FCM `가이드` : https://firebase.google.com/docs/cloud-messaging/server
- 서버 FCM `프로토콜 API` : https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages
- 서버 FCM `ADMIN_SDK API` : https://firebase.google.com/docs/reference/admin

#### b. FCM App Server(앱 서버) Protocol 
##### - XMPP Server Protocol 
- Jabber, Google Talk, Facebook chat, MS .NET Messenger 에 사용되는 프로토콜
##### - HTTP V1 API
- 기존 HTTP API 보다 액세스 토큰을 통한 보안 향상, 확장성 강화, 메시지 맞춤설정 등 장점이 많다.
- HTTP API는 발송하는 서버키 값이 고정인데 반해 HTTP V1은 발송하는 서버키 값을 엑세스 토큰으로 받아서 사용하는 부분이 다르다. 
- 하지만 멀티캐스트 메시징을 지원하지 않아 아직까지는 기존 HTTP API를 많이 사용한다. 
- API 방식도 기존의 방식과는 다르다. 
##### - 기존 HTTP API
- FCM을 통해 메시지를 보내는 기본적인 방법
- 구글에서는 V1으로 마이그레이션을 추천한다. 
##### - Firebase SDK 
- SDK를 사용하여 메시지를 보내는 방식 
