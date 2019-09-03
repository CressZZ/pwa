# PWA란 
- 아래의 내용을 필요한대로 골라서 점진적으로 웹을 앱처럼 만든다. 
    - 보안(https), 
    - 앱설치, 
    - GPS, 
    - Push, 
    - 카메라기능, 
    - 빠른 속도(오프라인환경에서 작동, 캐쉬등...) 등등...

# caching strategy 캐싱 전략
## 1. Cache only (캐시만 사용)
- 모든 리소스에 대해 케시만 사용하여 불러옴
```js
self.addEventListener('fetch', event=>{
    event.repondWith(
        caches.match(event.request); // return A Promise that resolves to the matching Response.
    )
})
```
## 2. Cache, falling back to network (캐시, 실패하는 경우 네트워크)
```js

// Promise callback
self.addEventListener('fetch', event=>{
    event.respondWith(
        caches.match(event.request).then(reponse => {
            return response || fetch(event.request)
        })
    )
})

// async/await
self.addEventListener('fetch', event =>{
    event.respondWith(
        async function(){
            let result = await caches.match(event.request);
            if(result) return result ;

            return fetch(event.request)
        }
    )
})

```
## 3. Network only (네트워크만 사용)
```js
self.addEventListener('fetch', function(event){
    event.respondWith(
        fetch(event.request)
    )
})
```

## 4. Network, falling back to cache (네트워크, 실패하는 경우 캐시)
```js
// Promise callback
self.addEventListener('fetch', event =>{
    event.respondWith(
        fetch(event.request).catch(()=>{
            return caches.match(event.request);
        })
    )
})

// async/await
self.addEventListener('fetch', event =>{
    event.respondWith(
        async function(){
            try{
                return await fetch(event.request)
            }catch(err){
                return caches.match(event.request)
            }
        }
    )
})
```
## 5. Cache, then network (캐시 이후 네트워크)

## 6. Generic fallback (기본 대체 리소스)
```js
// Promise callback
self.addEventListener('fetch', event=>{
    event.respondWith(
        fetch(event.request).catch(()=>{
            return caches.match(event.request).then(response=>{
                    return response || caches.match('/generic.png')
                )}
            })
        })
    )
})

// async/await
self.addEventListener('fetch', event=>{
    event.respondWith(
        async function(){
            try{
                let response = await fetch(event.request);
                return response
            }catch (err) {
                let response = await caches.match(event.request);
                return response || caches.match('/generic.png');
            }
        }
    )
})

```
## 7. Cache on demand (요청에 따라 캐시 -> 캐시, 실패하는 경우 네트워크, 이후 캐시 저장)
```js

// Promise callback
self.addEventListener('fetch', event=>{
    event.respondWith(
        caches.open('cache-name').then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                return cachedResponse || fetch(event.request).then(networkResponse => {
                    cache.put(event.request, networkresponse.clone());
                    return networkResponse;
                })
            })
        })
    )
})

// async/await
self.addEventListener('fetch', event=>{
    event.respondWith(
        async function(){ // async function 은 Promise (async 함수에 의해 반환 된 값으로 해결되거나, async함수 내에서 발생하는 캐치되지 않는 예외로 거부되는 값)을 리턴한다. 
            let cache = await caches.open('cache-name');
            let cachedResponse = await cache.match(event.request);

            if(cachedResponse) return cachedResponse;

            let networkResponse = await fetch(event.request);
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
        }
        
    )
})


```
## 8. Cache, falling back to network with frequent updates (캐시, 이후 네트워크 사용해 캐시 업데이트 -> 캐시, 성공하든 실패하든 네이트워크 이용하여 캐시 저장)
```js
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open('cache-name').then(cache => {
            return cache.match(evnet.request).then(cachedResponse => {
                var fetchPromise = fetch(evnet.request).then(networkResponse =>{
                    cache.put(event.request, networkResponse.clone())
                    return networkResponse;
                });
                return cacheResponse || fetchPromise;
            })
        })
    )
})


// async/await
self.addEventListener('fetch', event=>{
    event.respondWith(
        async function(){ // async function 은 Promise (async 함수에 의해 반환 된 값으로 해결되거나, async함수 내에서 발생하는 캐치되지 않는 예외로 거부되는 값)을 리턴한다. 
            let cache = await caches.open('cache-name');
            let cachedResponse = await cache.match(event.request); // undefined 반환 가능

            let networkResponse = await fetch(event.request);
            cache.put(event.request, networkResponse.clone());

            return cachedResponse || networkResponse;

           
        }
        
    )
})

```
## 9. Network, falling back to cache with frequent updates (네트워크, 실패하는 경우 캐시 사용 및 비번한 캐시 업데이트)
```js
self.addEventListener('fetch',event => {
    event.respondWith(
        caches.open('cache-name').then(cache => {
            return fetch(event.request).then(networkResponse => {
                cache.put(event.request, networkResponse.clone())
                return networkResponse;
            }).catch((=>{
                return caches.match(event.request)
            }))
        })
    )
})

self.addEventListener('fetch', event => {
    event.respondWith(
        async function(){
            let cache = await caches.open('cache-name');
            try{
                let networkResponse = fetch(event.request);
                cache.put(event.request, networkResponse.clone())
                return networkResponse;
            }catch{
                let cachedResponse = await caches.match(event.request);
                return cachedResponse;
            }
        }
    )
})

```
## 10. 앱 셸

#  Service worker scope
> Scope is linked with domain/origin. You can not create a service worker that intercepts request for other origins. If you try to register a service worker from origin which is different from origin of service worker file sw.js, then error will be thrown like The origin of the provided scriptURL ('https://cdn.example.com/sw.js') does not match the current origin. [https://itnext.io/service-workers-your-first-step-towards-progressive-web-apps-pwa-e4e11d1a2e85]

# 서비스 워커
- 서비스 워커는 자신이 제어하는 페이지에서 발생하는 이벤트를 수신합니다.웹에서 파일을 요청하는 것과 같은 이벤트를 가로채거나 수정하고 다시 페이지로 돌려보낼 수 있습니다. 

# App 설치 
- BeforeInstallPromptEvent ("install" a web site to a home screen.)
- 사파리 지원 안됨
- `beforeinstallprompt` : 앱 설치 조건이 만족 되면 (https://developers.google.com/web/fundamentals/app-install-banners/?hl=ko#criteria) `beforeinstallprompt` 이벤트 실행
- `BeforeInstallPromptEvent.prompt()` : 앱을 설치 할건지 묻는 함수
## 설치 조건 
- The web app is not already installed.
    - and prefer_related_applications is not true.
- Meets a user engagement heuristic (previously, the user had to interact with the domain for at least 30 seconds, this is not a requirement anymore)
- Includes a web app manifest that includes:
- short_name or name
- icons must include a 192px and a 512px sized icons
- start_url
- display must be one of: fullscreen, standalone, or minimal-ui
- Served over HTTPS (required for service workers)
- Has registered a service worker with a fetch event handler
# registration.showNotification
## tag
- 알림을 나타내는 고유 식별자 입니다. 만약 현재 표시되 ㄴ태그와 동일한 태그를 가진 알림이 도착하면, 예전 알림은 조용히 새 알림으로 대체됩니다. 
- 알림을 여러개 생성해 사용자를 귀찮게 하는 것보다 이 방법이 더 좋은 경우가 많스니다. 예를 들어, 메시징 앱에 안 읽은 메시지가 하나 있는 경우, 알림에 그 메시지 내용을 포함하고 싶을 것입니다. 그런데 기존 알림이 사라지기 전에 다섯개의 신규 메시지가 도착해다면, 여섯개의 별도 알림을 보여주는 것보다 6개의 새로운 메시지가 있습니다. 와 같이 기존 알림 내용을 업데이트 하는 것이 더 좋습니다. 
- [만들면서 배우는 프로그래시브 웹 p.284]

# Notification icon & badge image size (알림 아이콘 및 뱃지 이미지 사이즈에 대해)
## icon
- `192px`
- Sadly there aren't any solid guidelines for what size image to use for an icon. Android seems to want a 64dp image (which is 64px multiples by the device pixel ratio). `If we assume the highest pixel ratio for a device will be 3, an icon size of 192px or more is a safe be` (https://developers.google.com/web/fundamentals/push-notifications/display-a-notification)

## badge
- `72px`
- As with the icon option, there are no real guidelines on what size to use. Digging through Android guidelines the recommended size is 24px multiplied by the device pixel ratio. `Meaning an image of 72px or more should be good (assuming a max device pixel ratio of 3).`



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



# Notification 에 대한 정리 
https://developers.google.com/web/fundamentals/push-notifications/display-a-notification
## 화면 구성
![](./notification-ui.png)
## badge 아이콘
- badge의 경우 모바일 크롬만 되는듯 하다. (삼성 브라우저는 안됬음)

# push가 동작하는 조건 
## pc인 경우 
- background에서 브라우저 앱이 돌고 있을때(맥 기준으로 브라우저를 닫더라도, 실행 아이코에 파란색 점이 찍혀 있을때)
- 테스트 결과 완전히 종료된 이후 push를 보내면, 다시 브라우저 실행 시켰을때 메시지를 받는다.
## mobile의 경우
- 테스트 결과 브라우저 앱을 완전히 종료해도 메시지가 온다. (https://stackoverflow.com/questions/39034950/google-chrome-push-notifications-not-working-if-the-browser-is-closed)
- 딱히 app install 절치를 진행하지 않아도 됨. 

# VAPID & GMC(FCM) - Push 보내는 방법의 과거와 현재
- `gcm_sender_id` 는 과거의 방법이다. 
- 현재는 `applicationServerKey`즉 `VAPID` 를 사용한다. 
- 간단히 말하면, `web push protocal`이 정착되기 전 과거 브라우저는 `GCM(FCM) protocol`을 사용하였고 보안상의 문제로  
- `gcm_sender_id`를 `menifest.json` 에, 
- 타겟이 크롬인 경우`Server key(GCM API key)` 도 함께 `Authorization headerer`에 넣어야 한다.
- 그러나 요즘 브라우저는 `web push protocal`을 사용며 `VAPID`를 사용하고 있고, 이때는 위 `gcm_sender_id` 및 `Server key(GCM API key)`가 필요 없다.

## 참조 1
> Throughout this book we’ve been using the `application server key('VAPID')` to identify our application with push services. This is the Web Standards approach of application identification.
In older versions of Chrome (version 51 and before), Opera for Android and the Samsung Internet Browser there was a non-standards approach for identifying your application.
In these browsers they required a `gcm_sender_id` parameter to be added to a web app manifest and the value have to be a Sender ID for a Google Developer Project.
This was completely proprietary and only required since the `application server key` / `VAPID` spec had not been defined. (`여기서 'application server key' 라고 하면  ' VAPID' 와 동일한 의미인데, pushManager.subscript({option})의 option값 중 하나의 key가 'applicationServerKey'이며 value값은 'VAPID'가 된다.`)
In this section we are going to look at how we can add support for these browsers. Please note that this isn’t recommended, but if you have a large audience on any of these browsers / browser versions, you should consider this.
[https://web-push-book.gauntface.com/chapter-06/01-non-standards-browsers/]

## 참조2
> When Chrome first supported the Web Push API, it relied on the Firebase Cloud Messaging (FCM),formerly known as Google Cloud Messaging (GCM), push service. This required using it's proprietary API. This allowed the Chrome to make the Web Push API available to developers at a time when the Web Push Protocol spec was still being written and later provided authentication (meaning the message sender is who they say they are) at a time when the Web Push Protocol lacked it. Good news: neither of these are true anymore.
FCM / GCM and Chrome now support the standard Web Push Protocol, while sender authentication can be achieved by implementing VAPID, meaning your web app no longer needs a 'gcm_sender_id'.
[https://developers.google.com/web/updates/2016/07/web-push-interop-wins#introducing_vapid_for_server_identification]

## 참조3
- VAPID를 사용하면 `FCM-specific steps` 을 진행하지 않아도 된다.
> Using VAPID also lets you avoid the FCM-specific steps for sending a push message. You no longer need a Firebase project, a gcm_sender_id, or an Authorization header(GCM 계정의 서버 아이디).[https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications#working_with_data_payloads]

## GCM / FCM 용어
### 아래의 용어 사용하는 이유
> 42버전과 51버전 사이의 크롬은 구글 클라우드 메시징을 사용해 푸시 메시지를 구현하였고, 오페라와 삼성 브라우저도 같은 방법을 사용했다. 즉, 이전 버번의 브라우저에서도 푸시 알림이 작동하기바란다면 VAPID 키 이외에도 GCM API(gcm_sender_id) 키를 생성해야 한다. 

### `GCMAPIKEY` = `GCM-API-KEY` = `GCM Server Key` 
예전에 `VAPID` 도입전에 GCM(FCM)을 사용하여 푸시를 할경우, 그리고 그 푸시를 `크롬`에 할경우 필요 했던 API 값. (`header`)

### `gcm_sender_id` = `GCM 발신자 ID`
예전에 `VAPID` 도입전에 GCM(FCM)을 사용하여 푸시를 할경우, 그 푸시가 `크롬이든 아니든` 간에 꼭 넣어 줘야 하는 값. (`manifest.json`)

## VAPID를 사용하여 subscription을 생성 하면 endpoint 가 바뀐다. 
```js
    // subscription 객체를 resolve하는 프로미스가 리턴된다.
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey // VAPID
    }) 
```

- 이때 VAPID를 써서 만들어진 endpoint의 `origin`이 `fcm.googleapis.com`일지라도 이건 `FCM protocol`이 아니라 `Web Push Protocol` 이다. 
>You'll know if it has worked by examining the endpoint in the resulting subscription object; if the origin is `fcm.googleapis.com`, it's working.
Even though this is an FCM URL, use the `Web Push Protocol` not the `FCM protocol`, this way your server-side code will work for any push service.[https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications#the_web_push_protocol]

# Notification Permission
> 사용자가 Permision 에 동의 하지 않으면, 사용자에게 다시 Permision을 요청할 수 없습니다. (이 경우 permision 승인 결과를 반영 하려면 사용자가 browser의 설정에서 notification permission으 수동으로 변경해 주어야 합니다. ) 사용자가 permission을 결정하지 않은채로 tab을 닫으면, 나중에 다시 물을 수 있습니다. - 프로그레시브 웹 앱의 모든것 p.277 -

- 사용자가 x 버튼 3번 누르면 강제로 차단으로 변경 

# ServiceWorkerRegistration.pushManager.subscribe & notification.requestpermission
- `ServiceWorkerRegistration.pushManage.subscribe` 메서드는 기본적으로 푸쉬 허용 여부가 없을때 `notification.requestpermission`을 호출한다.

>There is one side effect of calling subscribe(). If your web app doesn't have permissions for showing notifications at the time of calling subscribe(), the browser will request the permissions for you. This is useful if your UI works with this flow, but if you want more control (and I think most developers will), stick to the Notification.requestPermission() API that we used earlier.
[https://developers.google.com/web/fundamentals/push-notifications/subscribing-a-user#permissions_and_subscribe]
[https://stackoverflow.com/questions/46551259/what-is-the-correct-way-to-ask-for-a-users-permission-to-enable-web-push-notifi]

# Cache API
- `worker scope` 와 `window scope` 의 api 형태는 같지만 궁극적으로는 다른 거다. 
> Do note that worker scope and standard window scope is not the same. There are some APIs missing (e.g. localStorage is not available). So self in the Service Worker is kind of like window in standard JS, but not exactly the same.  [https://enux.pl/article/en/2018-05-05/pwa-and-http-caching], [https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/caches]

# Notification API
- Cache와 마찬가지로 `worker scope` 와 `window scope` 의 api 형태는 같지만 궁극적으로는 다른 거다. 
> In addition, the Notifications API spec specifies a number of additions to the ServiceWorker API, to allow service workers to fire notifications. [https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API#Service_worker_additions]

> ...앞에서 notification을 보여주기 위해 사용했던 'new Notification()' 이 아니라 service worker의 method인 showNotification을 사용한다. navigator.serviceWorker.ready를 통해 install되고 activation된 상태의 service worker인 swreg를 얻으면, swreg.showNotification을 사용할 수 있다. (pwa 웹 앱의 모든것 p.282)


# push service 
>The term push service refers to a system that allows application servers(`우리 백엔드`) to send push messages to a webapp(`우리 프론트`). A push service serves the push endpoint or endpoints for the push subscriptions it serves.
The user agent connects to the push service used to create push subscriptions(`subscription을 생성함으로서` / `ServiceWorkerRegistration.pushManager.subscript()`). User agents MAY limit the choice of push services available. Reasons for doing so include performance-related concerns such as service availability (including whether services are blocked by firewalls in specific countries, or networks at workplaces and the like), reliability, impact on battery lifetime, and agreements to steer metadata to, or away from, specific push services. [https://www.w3.org/TR/push-api/#dfn-push-services\]

# end-point 
> A push subscription has an associated push endpoint. It MUST be the absolute URL exposed by the push service where the application server can send push messages to. A push endpoint MUST uniquely identify the push subscription.

> 밀어 넣기 구독에는 연결된 밀어 넣기 끝 점이 있습니다. 응용 프로그램 서버가 푸시 메시지를 보낼 수있는 푸시 서비스에 의해 노출 된 절대 URL이어야합니다. 밀어 넣기 끝점은 밀어 넣기 구독을 고유하게 식별해야합니다.
[https://www.w3.org/TR/push-api/#dfn-push-endpoint]

# pwa 웹 앱의 모든것 책 중에서...
- p.273 부터 시작하는, 유저가 notification permission 을 허용했을때, `구독 되었습니다.` 라는 Notification은 `Normal javascript code` 또는 `service worker` 둘중 어디서든지 처리해도 상관 없다. 어자피 페이지가 있는 상태에서 유저가 permission 을 허용하고, 그에 대한 Notification 을 볼거니까

- p.317 에서 하는 구독된 push에 대한 Notification 은 `service worker` 에서만 실행 되어야 한다. 당연히..



# 지원현황
## service worker
- 모바일 환경 전부, 피시 크롬 (https://caniuse.com/#search=serviceworker)

## BeforeInstallPromptEvent(앱설치)
- 오직 크롬만 완벽히 지원하며, 삼성 인터넷의 경우 일부 지원 (https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent)

## push api 
- 사파리 모바일/피시 안됨, 삼성 브라우저 됨 (https://caniuse.com/#search=push) *테스트 완료*

## notification api
- 사파리 모바일 /삼성브라우저 안됨 (https://caniuse.com/#search=notification) *테스트 완료*
- push api 에 대한 notification은 삼성브라우저에서 됨
- 
## cache api
- MDN 에는 사파리 모바일 지원 안된다고 나옴(https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- developers.google.com에서도 사파리는 지원 안된다고 나옴 (https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/cache-api)
- 테스트 하면 지원 함.
- isserviceworkerready에서는 지원 한다고 나옴 (https://jakearchibald.github.io/isserviceworkerready/index.html#moar)
- (https://love2dev.com/blog/what-browsers-support-service-workers/) 해당 문서에서는 2018년 3월에 IOS 11.3버전의 safari 13버전에서 `service-worker` `menifest` `cache` 를 지원 한다고 언급되어 있다.

# offline 환경 pwa 예시
- https://maxwellito.github.io/breaklock/

# pwa 예시
## 인스톨 & 오프라인
- app.starbucks.com
## 푸시
- https://housing.com/in/buy/real-estate-mumbai

# 단점
- 정적 파일이 변경될 때, service worker에서 캐쉬이름을 변경해줘야 된다. 
- 모바일 디버깅이 힘들다
- 개발 환경 ( 테스트를 https:// 에서 진행해야 한다. )

# firebase message TIP & TEST
## usePublicVapidKey 변화에 따른 - getPublicVapidKey_()
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

## usePublicVapidKey 변화에 따른 - FCM 프로토콜 & webpush 프로토콜  전송
- `usePublicVapidKey 바꿀때 마다, service-worker 재등록 필요`
- usePublicVapidKey 바꿀때 subscription은 변경되지 않는다. 
- firefox 브라우저의 경우 subscription의 endpoint는 항상 `mozila` 이다.

### 1. 프론트 스크립트에서 usePublicVapidKey 사용 안했을 경우 
- `webpush 프로토콜 전송` :  전송 안됨 (VAPID가 다를 것으로 생각됨)
- `fcm 프로토콜 전송` : 전송 됨

### 2. 프론트 스크립트에서 usePublicVapidKey 사용 했을 경우 (fcm 관리자 페이지에서 제공하는 VAPID)
- `webpush 프로토콜 전송` :  전송 됨
- `fcm 프로토콜 전송` : 전송 됨

### 3. 프론트 스크립트에서 usePublicVapidKey 사용 했을 경우 (별도로 생성된 VAPID)
- `webpush 프로토콜 전송` :  전송 됨
- `fcm 프로토콜 전송` : 전송 안됨 (Token 값이 생성 안됨)


# 확인해야 할거 
- html 페이지와 sw.js 파일의 위치가 달라도 되는가?

# 추가
## 파이어 폭스의 경우
- firebase functions는 무료버전일 경우 다른 회사 서비스 API를 호출 하지 않는다. 
- functions를 사용하면 파이어 폭스에 push가 오지 않는다. 
- functions안쓰면 push가 정상적으로 작동한다. 확인 완료
- functions-emulator 에서도 firfox push service 이용가능하다. 
```js
// node cli 모드에서 직접 실행한다. 
const applicationServerPublicKey = 'BA4Zlii7aeJeIiDJvprBfv4FWmpL7KKaBwJDL6Nut4zwC-4y2LxVY30zRscv6cZwQYaGOEOHS8O0oiAoBCo4jCk';
const applicationServerPrivate = 'tzv_L9neZGfzdK6o2hFs8Y9qbkSvB1xsie2ah9veKlo'
const options = {
    vapidDetails: {
        subject: 'mailto:sender@example.com',
        publicKey: applicationServerPublicKey,
        privateKey: applicationServerPrivate
    },
    TTL: 10
}
var subscription = {"endpoint":"https://updates.push.services.mozilla.com/wpush/v2/gAAAAABdQnHZHxSlZqb_WbqXy0Uq1Ox1eUICde8oZUQsnOgC292uCoruPbMQjp2TBDanskxAzvEhWt56q74g0Im8ceKt4I0Fy6Tx9hrxyz3b2-n8rLXW87rij5TUjX7P6bpd5jcInIJPWXRnMnhgZDjVSKxvX4W-C7kJOJ4gy81su5HCzq1pfMs","keys":{"auth":"oskzKMcb14gfV_ECJW_ovQ","p256dh":"BJ0djwjBYWVqRAVIDjl2Y4p6PapsmaB3SuutFzmJCCvDtzjhT45H-y6QaHZRiF0UVkUCDXm4a35BAb7aQPuqABs"}}


webpush.sendNotification(subscription, JSON.stringify({message:'me', url:''}), options) .then(function(values) {
    console.log(values);
})   .catch(function(err){
    console.log(err)
})

```

## 하나의 serviceworker에는 하나의 subscription만 존재 한다. 
1. 다른 path에 같은 serviceworker를 가질경우
- 어느 한쪽 path에서 subscription객체가 변경되면 다른 path의 subscription도 바뀐다. 
- 이게 당연한게, subscribe()메서드가 serivceworkerregistration.pushManager 객체에 있는거니까, 등록되어 있는 serviceworker에 종속되는게 당연하다. 
- 테스트 결과도 일치한다. 


2. 위의 경우 각기 다른 path에서 다른 VAPID를 가질경우
- 마지막으로 subscription객체를 생성할때 사용한 VAPID가 사용되고, 
- 서버에서는 이 VAPID에 해당하는 Private 키를가지고 있어야 푸쉬를 보낼 수 있다. 
- pushserver(백엔드)에서 잘못된 VAPID를 사용하여 메시지를 보내면 애러가 난다. 
npm
3. 다른 path (같은 depth) 에서 다른 serviceworker를 가질경우
- 다른 service worker 를 가질 수 없다. 

4. 다른 path (다른 depth) 에서 다른 serviceworker를 가질경우
- 다른 service worker 를 가질 수 있다. 

5. 그럼 다른 path (다른 depth) 에서 다른 serviceworker를 가질경우에 다른 subscribe()을 가지며, push를 발송한 경우 두개의 push를 수신 받는가?
- 그렇다


## service worker 등록 로직
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




## 랜선 뽑은상태에서 구독 생성 (subscribe) 하면 어떻게 되는가
- 구독 되지 않는다. 
- 단 크롬 devtool에서 오프라인 상태로 설정하고 subscribe 하면 구독 된다. (완전한 offline 상태가 아니여서 인것 같다.)

## 구독정보가 미리 생성되어 있는 경우 랜선 뽑으면 어떻게 되는가
- 구독 정보 가져 온다. 
- swRegistration.pushmanager.getSubscription 에 정보가 있는 것으로, swRegistration이 가지고 있을 것이다. 


## subscription 구독시 VAPID 는 필수 이다. 
- https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe#Browser_compatibility
- VAPID 없이 생성하려고 하면 애러가 난다 .


## https://developers.google.com/web/fundamentals/push-notifications/faq => 완전중요

## Why doesn't push work when the browser is closed?
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

## What is the deal with GCM, FCM, Web Push and Chrome?
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

```
By default firebase will be looking for /firebase-messaging-sw.js which should contain the firebase libraries and listeners. More details here: https://firebase.google.com/docs/cloud-messaging/js/receive

If you would like to use an existing service worker, you can use https://firebase.google.com/docs/reference/js/firebase.messaging.Messaging#useServiceWorker

like this...

```

# 서비스 워커를 unregister 시킬때, subscription은 어떻게 되는가?
- 결론은 구독 취소 된다. 
## Clarify when to unsubscribe if the service worker is unregistered 
- https://github.com/w3c/push-api/issues/190
> As @wanderview points out in https://bugzilla.mozilla.org/show_bug.cgi?id=1185716#c20, it's possible for a client to be using a service worker registration when it's removed. In that case, the registration is flagged, and can be restored or removed later.
It's unclear what to do with the push subscription in this case. Should it be removed unconditionally, even when the service worker still has clients? Or should it only be removed once all clients have gone away?  

>This is all frightfully obtuse, but if we consider subscriptions to be bound to or owned by registrations, then unregister() already includes steps that would remove the subscription. It's transitive, but I interpret the last step of https://slightlyoff.github.io/ServiceWorker/spec/service_worker/#clear-registration-algorithm to cover this. Well, it's all down to garbage collection, but that shouldn't be observable by script.
Am I missing something? I have to admit, it looks like the service work spec is designed to be maximally incomprehensible.  

> This is all frightfully obtuse, but if we consider subscriptions to be bound to or owned by registrations, then unregister() already includes steps that would remove the subscription. It's transitive, but I interpret the last step of https://slightlyoff.github.io/ServiceWorker/spec/service_worker/#clear-registration-algorithm to cover this. Well, it's all down to garbage collection, but that shouldn't be observable by script.
Am I missing something? I have to admit, it looks like the service work spec is designed to be maximally incomprehensible.


## https://love2dev.com/blog/how-to-uninstall-a-service-worker/
Also, if you have a push notification subscription registered with the service worker, that subscription is revoked. The next time the service worker checks for the subscription it will prompt you to subscribe.

# Subscription
- https://w3c.github.io/push-api/#widl-PushSubscription-endpoint

A push subscription is a message delivery context established between the user agent and the push service on behalf of a web application. Each push subscription is associated with a service worker registration and a service worker registration has at most one push subscription.
> `push subscription`은 `user agent(브라우저등)`와 `push service`사이에서(`web application(웹서버)` 대신에)  설정정된 메시지 전송 컨텍스트 입니다.   
> `각각의 push subscription은 하나의 service worker registration과 관련되어 있고, 하나의 service worker registration은 최대 하나의 push subscription을 가집니다.` -> `중요`

A push subscription has an associated push endpoint. It MUST be the absolute URL exposed by the push service where the application server can send push messages to. A push endpoint MUST uniquely identify the push subscription.
> `push subscripotion`은 하나의 `push endpoint`를 가지고 있습니다. `push endpoint`는 반드시 푸시 서비스에 의해 만들어진 절대경로의 URL로서 `application server`가 푸시 메시지를 보낼수 있는 URL이어야 합니다. `push endpoint` 는 만드시 `push subscription`을 유니크하게 식별 해야 합니다.

A push subscription MAY have an associated subscription expiration time. When set, it MUST be the time, in milliseconds since 00:00:00 UTC on 1 January 1970, at which the subscription will be deactivated. The user agent SHOULD attempt to refresh the push subscription before the subscription expires.
> 하나의 구독은 하나의 `expiratin time`을 가질수 있습니다. `expriation time`은 subscription이 비활성화 될 시간을 1970년 1월 1일 00시 기준으로 그 이후의 시간을 밀리 세컨드로 표현한 시간으로 설정되어야 합니다. `user agent`는 구독이 만료되기전에 구독을 갱신해야 합니다.

A push subscription has internal slots for a P-256 ECDH key pair and an authentication secret in accordance with [RFC8291]. These slots MUST be populated when creating the push subscription.
> 구독은 `P-256 ECDH key pair`와 `[RFC8291]`과 관련된 `authentication secret`을 위한 내부 슬롯을 가집니다. 이 슬롯들은 구독이 생성될때 반드시 채워져야 합니다.

If the user agent has to change the keys for any reason, it MUST fire the "pushsubscriptionchange" event with the service worker registration associated with the push subscription as registration, a PushSubscription instance representing the push subscription having the old keys as oldSubscription and a PushSubscription instance representing the push subscription having the new keys as newSubscription.
> 만약 `user agent` 가 어떤 이유로든 키를 변경 해야 하는 경우 `service worker registration`에서 `pushsubscriptionchange` 이벤트를 발생 시켜야 합니다. 이전 키를 가지는 oldSubscription과 새로운 키를 가지는 newSubscription이 있습니다. 



# Firebase_sdk에서 index.html 에 넣는 firebaseConfig 변경될 경우
1. 한번 생성된 토큰은 변함이 없다. 
2. 단 messaging 객체를 보면 messagingSenderId 가 변경되어 있다. 
3. 한번 생성된 subscription 도 변경이 없다. 

# Firebase_sdk에서 usePublicVapidKey 사용 여부에 따른 차이
1. usePublicVapidKey을 사용 안하면, firebaseConfig가 바껴도 subscription 객체의 applicationServerkey값은 동일하다. 
2. usePublicVapidKey을 사용 하면 applicationServerkey값이 바뀐다.


https://stackoverflow.com/questions/42455658/what-is-the-use-of-firebase-messaging-sw-js-in-firebase-web-notifications




"https://fcm.googleapis.com/fcm/send/d_NxdJduu-Q:APA91bFM1dzQVP6v7n5wzQrHEiXydK3ggapvy-lFv7LBxHQMoHGnAferE6imcD6VHq4oiSHrvaVPoPLPtV4dZU1ATXvqsKw7T_bEnweBXKYxlff_NyK9r_YecEoRp-sxiePrl-gdgdFN"

"https://updates.push.services.mozilla.com/wpush/v2/gAAAAABdQnHZHxSlZqb_WbqXy0Uq1Ox1eUICde8oZUQsnOgC292uCoruPbMQjp2TBDanskxAzvEhWt56q74g0Im8ceKt4I0Fy6Tx9hrxyz3b2-n8rLXW87rij5TUjX7P6bpd5jcInIJPWXRnMnhgZDjVSKxvX4W-C7kJOJ4gy81su5HCzq1pfMs"

"https://fcm.googleapis.com/fcm/send/e55OgyFDk8A:APA91bEb_5HuuVoNPAvf_mtGNJWvOopxq8XyO0zo5F9kD4MFdf9f99Dc50NtwtnBupjSodO1NhV7pWX-j4a8NZu1TqCzVBIyVR9xEm8XWJkjBO-X8fFmhhnjn2trJAhb6vhsnpkRqyzd"