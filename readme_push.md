# 1. PWA - Push 
1. 개요
    1. PWA란
    2. PWA를 위한 기술
        1. service worker
        2. manifest.json
2. PUSH
    1. 개요
        1. 모바일 환경에서 push 기능
            1. `모바일`인 경우 `네이티브 앱`과 동일하게 브라우저가 종료된 상태에서도 푸쉬 메시지가 온다. 
        2. PC 환경에서 push 기능
    2. PWA중 push를 사용하기 위해 필요한 기술
        1. Service-worker (PUSH API, FCM API)
        2. Notificatoin API
    3. Push API (Native Push Service) & Friebase Cloude Message
        1. Push API (Native Push Service)
        2. Friebase Cloude Message
    4. 한계점 (미해결)
        1. App ID가 변경될때(FCM) Token이 새로 생성되지 않는다.
            1. 세부 내용
            2. 임시 해결책
        2. VAPID가 변경될 경우(PUSH API) Subscription이 새로 생성되지 않는다. 
            1. 세부 내용
            2. 임시 해결책
        3. 결론
2. APP INSTALL
    1. 개요

3. TIP & TEST

4. 실제 적용한 내용
    1. Friebase Cloude Message
    2. service_worker.js
    3. manifest.json
    4. ICON 이미지 위치
    5. 적용 방법

5. 

5. 관련 자료

---  

# 1. 개요
PWA란 무엇이며 실제로 적용한 예시에 대한 내용을 `간략하게` 적는다. 

## 1) PWA 란
- PWA란 Progressive Web Application의 약자로 `웹 어플리케이션`을 점진적 향상 시켜 `웹 어플리케이션`과 `네이티브 어플리케이션`의 이점을 모두 갖게 하는 것을 말한다. 
- `웹 앱`을 향상시킬 수 있는 기술에는 아래와 같은 것들이 있다.  
    - 보안 강화를 위한 `https` 적용.
    - `웹 앱`의 인스톨 기능
    - 디바이스 크기에 따른 `반응형 웹` 디자인
    - 디바이스의 `GPS` 기능 
    - `push` 알림 기능 
    - 디바이스의 `카메라` 기능 사용
    - 속도의 개선 (`오프라인 환경`, `캐쉬`)
    - 백그라운드 동기화
- 이론적으로 이미 많은 `웹 앱` 들이 `https`, `반응형`등을 사용 함으로서 PWA를 적용하고 있다고 볼 수 있다. 
- 단, 지금은 PWA의 기술들 중 `push`기능과 `install`기능, 그리고 직접 다루지는 않겠지만 속도 개선을 위한 `캐쉬` 기능에 대해 중점으로 살펴 본다. 

## 2) PWA를 위한 기술
-  `push`기능과 `install`기능, 그리고 `캐쉬` 기능 등을 사용하기 위해 필요한 핵심 `기술`에는 `Service worker` 와 `Manifest` 두가지 가 있다.

### (1) Service worker
- `브라우저` 와 `네트워크` 사이에있는 프록시 서버역할을 한다.
    - ( `[브라우저]` <---> `[Service worker]` <---> `[네트워크]` )
    - 서비스 워커는 자신이 제어하는 페이지에서 발생하는 이벤트를 수신한다. 웹에서 서버에 네트워크를 통해 파일을 요청하는 것과 같은 이벤트를 가로채거나 수정하고 다시 페이지로 돌려보낼 수 있다. 
- `푸시 알림` 및 `백그라운드 동기화` API에 대한 액세스를 허용 한다. 
- 각각의 Serivce worker 는 그 Service worker의 기능을 사용할 수 있는 `Scope`를 가지고 있다. 
    - 즉, 도메인 마다 고유의 `Serivce worker`를 가질 수 있고, 심지어 `Depth`마다 고유의 `Serivce worker`를 가질 수 있다.
- `Service Worker`는 반드시 `ssl` 즉, `https` 프로토콜 환경에서만 동작을 하고, 
- 예외로 `localhost://` 프로토콜 환경에서도 작동을 한다. 
- `127.0.0.1` 등의 프로토콜도 동작하나, 임의로 변경한 host인 `local.test://` 등에서는 동작 하지 않는 것으로 확인 하였다. 
- 각 `Device`안의 각 `Navigator`에 종속되어 설치 된다.
    - 즉, 같은 기기라고 하더라고 브라우저 마다 다른 `Service worker`가 설치된다. 
- 자세한 내용은 링크 참조 : [[구글 Developers]](https://developers.google.com/web/fundamentals/primers/service-workers/?hl=ko), [[MDN]](https://developer.mozilla.org/ko/docs/Web/API/Service_Worker_API), 


### (2) Manifest.json
- `웹 앱`을 `인스톨` 하기 위한 파일이다. 
- 이름, 작성자, 아이콘, 버전, 설명 및 필요한 모든 리소스 목록이 포함된다.
- `인스톨` 기능과는 별개로 `GCM(Google Cloude Message)`을 위한 `gcm_sender_id` 값이 들어가는 경우도 있다. (`gcm_sender_id`는 현재 필요하지 않다. ) 
- 자세한 내용은 링크 참조 : [[MDN]](https://developer.mozilla.org/en-US/docs/Web/Manifest), [[MDN(2)]](https://developer.mozilla.org/ko/docs/Web/Progressive_web_apps/Installable_PWAs), [[구글 Developers]](https://developers.google.com/web/fundamentals/codelabs/your-first-pwapp/?hl=ko)

# 2. PUSH 
## 1) 개요
- `웹 앱`에 `네이티브 앱` 처럼 푸쉬 메시지를 보낸다. 
### (1) 모바일 환경에서 push 기능
### a. `모바일`인 경우 `네이티브 앱`과 동일하게 브라우저가 종료된 상태에서도 푸쉬 메시지가 온다. 

(https://developers.google.com/web/fundamentals/push-notifications/faq)
### [# Why doesn't push work when the browser is closed?](https://developers.google.com/web/fundamentals/push-notifications/faq)

> 브라우저가 닫힌 상태에서는 왜 푸쉬가 동작하지 않나요?

This question crops up quite a bit, largely because there are a few scenarios that make it difficult to reason with and understand.
>이 문제는 복잡합니다.

Let's start with Android. The Android OS is designed to listen for push messages and upon receiving one, wake up the appropriate Android app to handle the push message, regardless of whether the app is closed or not.
>안드로이드를 생각해 보면, 안드로이드 os는 push message가 들어오면, 해당 어플리케이션을 깨우도록 설계되어 있습니다. 해당 어플리케이션이 닫혀있든 그렇지 않든 말이죠.

This is exactly the same with any browser on Android, the browser will be woken up when a push message is received and the browser will then wake up your service worker and dispatch the push event.
> 안드로이드의 브라우저 역시 정확히 같은 동작을 합니다. 푸쉬 메시지가 오면 (특정)브라우저는 깨어 날 것이고, (특정)브라우저는 해당 service worker를 깨우고 service worker에 push event를 dispatch 할 것입니다.

On desktop OS's, it's more nuanced and it's easiest to explain on Mac OS X because there is a visual indicator to help explain the different scenarios.
> 데스트탑 OS의 경우에는 좀더 미묘합니다. 맥 OS X의 경우가 설명하기 쉬울 것 같은데, 맥 OS X의 경우에는 시각적인 설명이 가능하기 때문입니다. 

On Mac OS X, you can tell if a program is running or not by a marking under the app icon in the dock.
> 맥 OS X의 경우 dock의 프로그램 아이콘아래에 표시되는 marking에 의하여 프로그램이 구동중인지 아닌지를 알 수 있습니다. 

If you compare the two Chrome icons in the following dock, the one on the left is running, as illustrated by the marking under the icon, whereas the Chrome on the right is not running, hence the lack of the marking underneath.
> 두개의 크롬 아이콘이 dock에 있다고 칩시다. 하나는 아이콘 아래에 marking 표시가 있고, 이것은 running 중이라는 것을 보여 줍니다. 다른 하나는 marking 표시가 없고 이것은 running중이 아님을 보여 줍니다. 

Example of OS X 
> 예시

In the context of receiving push messages on desktop, you will receive messages when the browser is running, i.e. has the marking underneath the icon.
> 푸쉬 메시지가 데탑에 전송된 상화에서, 브라우저가 running중이라면 우리는 푸쉬 메시지를 받을 수 있을 것 입니다. 즉, 아이콘 아래에 marking 표시가 있는 경우 입니다.  

This means the browser can have no windows open, and you'll still receive the push message in your service worker, because the browser in running in the background.
> 이것은 윈도우가 열려 있지 않는 브라우저가 가능 하다는 이야기 이며, 우리는 우리의 서비스 워커가 푸쉬 메시지를 받을 것 이라는 이야기 입니다. 왜냐하면 브라우저가 백그라운드 상에서 구동 중이기 때문입ㄴ디ㅏ.

The only time a push won't be received is when the browser is completely closed, i.e. not running at all (no marking). The same applies for Windows, although it's a little trickier to determine whether or not Chrome is running in the background.
> 브라우저가 완전히 닫혀 있는경우 우리는 푸쉬를 받을 수 없습니다. 즉. marking 표시가 없을 때입니다. 위도우도 마찬가지 입니다. 

### (2) pc 환경에서 push 기능
### a. `pc`환경인 경우 브라우저 및 install된 웹앱이 백그라운에서 동작하고 있어야 한다. 
- 자세한 내용은 위 `mobile` 환경 참조 

## 2) PWA중 push를 사용하기 위해 필요한 기술
### (1) Service-worker (PUSH API, FCM API)
- `service worker`를 등록하면 `serviceWorkerRegistration`객체를 얻을 수 있고,
- `serviceWorkerRegistration`은 `Push API`의 인터페이스인 `pushManager`, `PushSubscription`, `PushEvent`, `PushMessageData`를 프로퍼티로 가지고 있고, 
- `push` service를 위해서는 후술할 `FCM`을 사용하든, 네이티브 `Push API`를 직접 사용하든 `Push API`는 꼭 필요하며, 따라서 `service woker`가 필수 조건이 된다. 
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
    - 직접 사용거나
    - FCM(Friebase Cloude Message) SDK 를 사용한다. 

### (1) Push API (Native Push Service)]
- `Push API`를 직접 사용한다. 
- 2016년 7월 `VAPID`가 도입되면서 크롬은 `Push API`을 지원 하였고, 
- 크롬은 푸쉬를 보내기 위한 서비스를 기존 `GCM`에서 `FCM (Push API 사용)`으로 변경 하였다. 
- 크롬이 지원하니까 표준 아닌가?
- 상세 사용 방법은 링크 참조 : https://developers.google.com/web/fundamentals/codelabs/push-notifications/

### (2) Friebase Cloude Message
- `Push API`를 `FCM (Push API 사용)`을 통해 사용한다. 
- 상세 사용 방법은 링크 참조 : https://firebase.google.com/docs/cloud-messaging/js/client 
- 자세한 용어에 대한 내용은 아래 참조 

(https://developers.google.com/web/fundamentals/push-notifications/faq)
### [# What is the deal with GCM, FCM, Web Push and Chrome?](https://developers.google.com/web/fundamentals/push-notifications/faq)

This question has a number of facets to it and the easiest way to explain is to step through the history of web push and Chrome. (Don't worry, it's short.)
> 이 질문에 대한 대답은 다양하지만, 가장 쉬운 접근방법은 `web push`와 `Chrome`에 대한 역사를 살펴 보는 방법 입니다. (걱정 마세요. 짧습니다.)

December 2014
When Chrome first implemented web push, Chrome used Google Cloud Messaging (GCM) to power the sending of push messages from the server to the browser.
> 목요일, 2014년   
> 크롬이 처음 web push를 시행할때, 크롬은 서버에서 브라우저로 메세지를 보내기 위해 `Google Cloud Messaging` (GCM)을 사용 하였습니다. 

This was not web push. There are a few reasons this early set-up of Chrome and GCM wasn't "real" web push.
> 이것은 `web push가 아닙니다!` Chrome과 GCM의 초창기 설정이 실제 web push가 아닌 것에는 몇 가지 이유가 있습니다.

GCM requires developers to set up an account on the Google Developers Console.  
Chrome and GCM needed a special sender ID to be shared by a web app to be able to set up messaging correctly.  
GCM's servers accepted a custom API request that wasn't a web standard.
> GMC을 사용하기 위애서는 개발자가 `Google Developers Console`계정을 만들어야 했습니다.   
> 크롬과 GCM은 메시지를 정확하게 설정할 수 있도록 웹 앱에서 공유 되어야할 특별한 sender ID가 필요했ㅅ브니다. 
> GCM을 위한 서버는 web standard가 아닌 custom API를 적용하경슷ㅂ니다.

July 2016
In July a new feature in web push landed - Application Server Keys (or VAPID, as the spec is known). When Chrome added support for this new API, it used Firebase Cloud Messaging (also known as FCM) instead of GCM as a messaging service. This is important for a few reasons:
> 6월 2016 
> 2016뇬 6월에 `Application Server Keys(or VAPID)`라는 새로운 기능이 web push에 나타났습니다. 크롬이 이 새로운 API를 지원하게 되었을때, 크롬은 GCM대신 `FCM`(크롬이 사용하는 `web push service`)을 메시지 서비스로서 사용하게 되었습니다. 아래는 그 FCM을 사용하게 된 중요한 이유 입니다.  

Chrome and Application Sever Keys do not need any kind of project to be set up with Google or Firebase. It'll just work.  
FCM supports the web push protocol, which is the API that all web push services will support. This means that regardless of what push service a browser uses, you just make the same kind of request and it'll send the message.  
> 크롬과 `Application Server Keys`는 `Google 또는 Firebase`에서 설정해야할 그 어떤 프로젝트도 필요 없게 되었습니다.   
> `FCM`(크롬이 사용하는 `web push service`)은 모든 `web push service`들이 지원하는 `API`인 `web push protocol`을 지원하게 되었습니다. 이것의 의미는 브라우저가 어떤 `push service`를 이용하든, 똑같은 종류의 request를 만들면 메시지를 보낼수 있다는 의미 입니다. 

Why is it confusing today?
> 왜 혼란스럽다 오늘?

There is a large amount of confusion now that content has been written on the topic of web push, much of which references GCM or FCM. If content references GCM, you should probably treat it as a sign that it's either old content OR it's focusing too much on Chrome. (I'm guilty of doing this in a number of old posts.)
> 오늘날 `web push`를 주제로 쓰여진 문서들, 그중에서도 `GCM`과 `FCM`을 참조하는 문서들은 많은 혼란을 야기 합니다. 일단, `GCM`관련 문서에 대해서는 꽤 오래된 문서라고 생각해도 좋고 그 문서는 크롬에 초점이 맞춰진 문서라고 생각하십시요! (글쓴이는 이러한 많은 오래된 포스트에 대해 죄책감을 가지고 있습니다.)

Instead, think of web push as consisting of a browser, which uses a push service to manage sending and receiving messages, where the push service will accept a "web push protocol" request. If you think in these terms, you can ignore which browser and which push service it's using and get to work.
> 반면 웹 푸시는 브라우저의 입부분 이라고 생각 해봅시다. 브라우저는 푸시 서비스를 이용하여 메시지를 송, 수신 하며, 푸시 서비스는 `웹 푸시 프로토콜`로 만들어진 request요청을 사용합니다. 이러한 관점에서 보면 우리는 어떤 브라우저가 어떤 푸시서비스를 사용하고 있고 어떻게 작동하는지 무시 할 수 있습니다.

This guide has been written to focus on the standards approach of web push and purposefully ignores anything else.
> 이 가이드는 표준적인 접근법에 관점을 두고 있으며, 그 이외에는 일부로 언급하지 않습니다.

Firebase has a JavaScript SDK. What and Why?
> 파이어 베이스는 왜 Javscript SDK를 가지고 있나요? 그리고 그게 뭔가요?  

For those of you who have found the Firebase web SDK and noticed it has a messaging API for JavaScript, you may be wondering how it differs from web push.
> 여러분들 중에는 자바스크립트의 `messaging API`인 `Firebase web SDK`에 대해 알고 있으며 관심이 있을 것입니다. 여러분은 아마도 이게 `web push`와 어떻게 다른거야! 라고 궁금해 할 것입니다. 

The messaging SDK (known as Firebase Cloud Messaging JS SDK) does a few tricks behind the scenes to make it easier to implement web push.
> 이 메시징 SDK(`Firebase Cloud Messating JS SDK`라고 알려진)는 웹 푸시를보다 쉽게 ​​구현할 수 있도록 몇 가지 트릭을 제공합니다.

Instead of worrying about a PushSubscription and its various fields, you only need to worry about an FCM Token (a string).
> `FCM JS SDK`를 사용하면 `PushSubscription`객체가 가지고 있는 많은 `메서드`와 `프로퍼티`에 대한 이해 없이 우리는 `FCM Token(a string)`만 가지고 있으면 됩니다. 

Using the tokens for each user, you can use the proprietary FCM API to trigger push messages. This API doesn't require encrypting payloads. You can send a plain text payload in a POST request body.
> 유저들 각각의 `token` 을 이용하면 푸시 메시지를 전송할 수 있는 적절한 `FCM API`를 사용 할 수 있습니다. 이 API는 암호화된 `payloads` 가 필요하지 않습니다. 단지 plain text로 만들어지 payload를 post 방식으로 body넣어 날리기만 하면 됩니다.

FCM's proprietary API supports custom features, for example FCM Topics (It works on the web too, though it's poorly documented).
> FCM의 API는 여러 커스텀 기능을 지원하고 있는데, 예를 들면 `FCM Topics`가 바로 그것 입니다. (`FCM Topics`는 웹에서도 작동 하지만, 문서화가 잘 되어 있지는 않습니다.) 

Finally, FCM supports Android, iOS and web, so for some teams it is easier to work with in existing projects.
This uses web push behind the scenes, but its goal is to abstract it away.
> 끝으로 `FCM`은 `Androiod`, `iOS`, 그리고 `web`을 모두 지원합다. 그렇기 때문에 각각 다른 플랫폼을 담당하는 서로 다른 팀들이 쉽게 협력할수 있습니다. `FCM` 코드 뒤에서 `web push`를 사용하지만, `FCM`의 목적은 `web push`를 사용하는 방법을 추상화 하는 것 입니다. 

Like I said in the previous question, if you consider web push as just a browser and a push service, then you can consider the Messaging SDK in Firebase as a library to simplify implementing web push.
> 내가 아까 전에 질문에 대답 한것 처럼, 만약 `web push`를 딱 `browser`와 `push service`때문에 고려하고 있다면 간단한 웹푸시 구현 작업을 위해 하나의 `library`로서 `Messaging SDK in Firebase`를 사용하는 걸 고려 할수 있을 것입니다.


### (3) Friebase Cloude Message 심화
- `Push API`를 쉽게, 넓게 쓰게 하는 것이 `FCM`이라고 생각하면 좋은데, 
- 문서등이 보기 어렵게 되어 있는듯 하고, Native위주인 경향도 있어서 개념잡기가 어려울 수 있다. 
#### a. 문서에 대해 
- 기본적으로 영어 문서이나, 한글로 변경 할수 있지만, 한글로 변경하면 왼쪽에 카테고리 목차가 사라진다!
- 프론트엔드가 FCM을 적용할때의 `가이드` : https://firebase.google.com/docs/cloud-messaging/js/client
- 프론트 엔트 FCM `API` : https://firebase.google.com/docs/reference/js/firebase.messaging.Messaging
--- 
- 서버가 FCM을 적용할때의 `가이드` : https://firebase.google.com/docs/cloud-messaging/server
- 서버가 메시지 보내기 위해 `FCM 프로토콜`을 직접 사용할때 `API` : https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages
- 서버가 메시지 보내기 위해 `ADMIN SDK`를 사용할때 `API` : https://firebase.google.com/docs/reference/admin

#### a. FCM은 네이티브 앱의 푸쉬기능을 제공하는 것을 우선으로 시작된 서비스로 생각된다. 
- 개인적인 생각이지만, FCM은  웹을 위한 Push API 라이브러리로서 탄생한 것이 아니고, 
- 네이티브 푸쉬기능에서 확장된 서비스로서 웹 Push API를 지원 하는 것으로 보인다. 
- 중요한것은 아님
#### b. FCM App Service Protocol 





    4. 한계점 (미해결)
        1. App ID가 변경될때(FCM) Token이 새로 생성되지 않는다.
            1. 세부 내용
            2. 임시 해결책
        2. VAPID가 변경될 경우(PUSH API) Subscription이 새로 생성되지 않는다. 
            1. 세부 내용
            2. 임시 해결책
        3. 결론
2. APP INSTALL
    1. 개요

3. TIP & TEST

4. 실제 적용한 내용
    1. Friebase Cloude Message
    2. service_worker.js
    3. manifest.json
    4. ICON 이미지 위치
    5. 적용 방법
