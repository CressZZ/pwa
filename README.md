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

3. 다른 path (같은 depth) 에서 다른 serviceworker를 가질경우
- 다른 service worker 를 가질 수 없다. 

4. 다른 path (다른 depth) 에서 다른 serviceworker를 가질경우
- 다른 service worker 를 가질 수 있다. 

## subscription 구독시 VAPID 는 필수 이다. 
- https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe#Browser_compatibility
- VAPID 없이 생성하려고 하면 애러가 난다 .


"https://fcm.googleapis.com/fcm/send/d_NxdJduu-Q:APA91bFM1dzQVP6v7n5wzQrHEiXydK3ggapvy-lFv7LBxHQMoHGnAferE6imcD6VHq4oiSHrvaVPoPLPtV4dZU1ATXvqsKw7T_bEnweBXKYxlff_NyK9r_YecEoRp-sxiePrl-gdgdFN"

"https://updates.push.services.mozilla.com/wpush/v2/gAAAAABdQnHZHxSlZqb_WbqXy0Uq1Ox1eUICde8oZUQsnOgC292uCoruPbMQjp2TBDanskxAzvEhWt56q74g0Im8ceKt4I0Fy6Tx9hrxyz3b2-n8rLXW87rij5TUjX7P6bpd5jcInIJPWXRnMnhgZDjVSKxvX4W-C7kJOJ4gy81su5HCzq1pfMs"

"https://fcm.googleapis.com/fcm/send/e55OgyFDk8A:APA91bEb_5HuuVoNPAvf_mtGNJWvOopxq8XyO0zo5F9kD4MFdf9f99Dc50NtwtnBupjSodO1NhV7pWX-j4a8NZu1TqCzVBIyVR9xEm8XWJkjBO-X8fFmhhnjn2trJAhb6vhsnpkRqyzd"