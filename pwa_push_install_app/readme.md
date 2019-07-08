#  BeforeInstallPromptEvent ("install" a web site to a home screen.)
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


# Push & Notification 작동 원리 (프로레시브 웹 앱의 모든것 p.271)
## Permission for Push Notifications
## Subscriptions
- push 등록은 각 `device` 와 `browser`별로 등록된다. 즉 같은 device의 다른 browser라면 다른 사용자로 인식한다. 
- 기존에 등록된 `subscript`이 없다면 새로운 `subscrition`을 생성해야 하며, 이 `subscription`은 `backend server`로 전달 되어야 한다. 
## Push server
- Push notification은 별도의 external server(browsr vendor에서 제공하는 push server)를 필요로 한다. 
- push마다 어떤 message를 app(아마도 web page)에 전달하기 위해서는 browser의 도움이 필요로 한다. 
- 우리의 aPP(아마도 web page) 자체로는 message를 수신 할수 없기 때문이다. 
- (web socket을 만들수도 있지만, 우리 app이 항상 오픈 되어 있어야 작동하기 때문에 적합하지 않다.)
- Browser vendor(공급자)는 자사의 browser로 어떤 app을 이요하는 사용자에게 push를 발송하기 위한 'Push server'를 제공한다. 
- Google, Mozilla 등 각각의 browser vendor가 push server를 가지고 있고, 해당 browese사용자에게 push를 발송하기 위해서는 vendor의 push server에 연계된 setting이 필요하다. 
## End point
- push server는 각 browser vendor의 소유 이므로 우리가 설정 할 수는 없다. 
- 단, 우리가 javascript로 `new subscription`을 setup하면 (configurePushSub 함수를 정의하면) javascript는 자동으로 push server (browsder vendor 제공)에 접근해서 endpoint를 가져온다.
- 새로 등록된 subscript은 push API endpoint 정보 `(push server의 url)` 을 가지게 되고, 각가의 등롣된 `device-browser`마다 자신만의 다른 endpoint를 가지게 된다. 
- google의 endpoit 예시
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
- mozila의 endpoit 예시
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
- endpoint는 push server의 url이며 우리는 이 endpoint url로 new push message를 send하게 된다. 
- browser vendor(push server)는 이 push message를 각 web app에 전달 한다. 

## Authentication information
- endpoint 유출 시 endpoint를 아는 누구나가 push message를 보낼 수 있다. 
- 그래서 특별한 key rk vlfdygksek. 
- 설정한 key에 의해서 subscription생성 시 authentication정보도 만들어 지는다. 이 인증 정보는 우리만이 우리의 web app 에 push 할수 있도록 분별해 준다. 
## subsription과 backend server 
- browser vendor의 push server와는 별개로 우리 app의 code가 구동 될 수 있는 backend server(firebase)도 필요하다. 
- 사용자 app의 servidce worker는 new subscription을 생성하고
- subscription은 endpoint등에 대한 정보를 가지고 있으면, 
- backend 서버는 각각의 subscription을 가 보관한다. 



# push가 동작하는 조건 
## pc인 경우 
- background에서 브라우저 앱이 돌고 있을때(맥 기준으로 브라우저를 닫더라도, 실행 아이코에 파란색 점이 찍혀 있을때)
- 테스트 결과 완전히 종료된 이후 push를 보내면, 다시 브라우저 실행 시켰을때 메시지를 받는다.
## mobile의 경우
- 테스트 결과 브라우저 앱을 완전히 종료해도 메시지가 온다. (https://stackoverflow.com/questions/39034950/google-chrome-push-notifications-not-working-if-the-browser-is-closed)
- 딱히 설치 하지 않아도 됨. 


# Notification Permission
- >사용자가 Permision 에 동의 하지 않으면, 사용자에게 다시 Permision을 요청할 수 없습니다. (이 경우 permision 승인 결과를 반영 하려면 사용자가 browser의 설정에서 notification permission으 수동으로 변경해 주어야 합니다. ) 사용자가 permission을 결정하지 않은채로 tab을 닫으면, 나중에 다시 물을 수 있습니다. - 프로그레시브 웹 앱의 모든것 p.277 -

- 사용자가 x 버튼 3번 누르면 강제로 차단으로 변경 

# pushManager.subscribe & notification.requestpermission
- pushManage.subscribe 메서드는 기본적으로 푸쉬 허용 여부가 없을때 notification.requestpermission을 호출한다.

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
## app.starbucks.com
- 인스톨, 오프라인
## https://housing.com/in/buy/real-estate-mumbai
- 푸시

# 단점
- 정적 파일이 변경될 때, service worker에서 캐쉬이름을 변경해줘야 된다. 
- 모바일 디버깅이 힘들다
- 
# 해결해야 할거
- push server
- 개발 환경 ( 테스트를 https:// 에서 진행해야 한다. )

# 확인해야 할거 
- html 페이지와 sw.js 파일의 위치가 달라도 되느가?