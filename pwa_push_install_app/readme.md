#  BeforeInstallPromptEvent ("install" a web site to a home screen.)
- 사파리 지원 안됨
- `beforeinstallprompt` : 앱 설치 조건이 만족 되면 (https://developers.google.com/web/fundamentals/app-install-banners/?hl=ko#criteria) `beforeinstallprompt` 이벤트 실행
- `BeforeInstallPromptEvent.prompt()` : 앱을 설치 할건지 묻는 함수

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
- 


# Notification Permission
- >사용자가 Permision 에 동의 하지 않으면, 사용자에게 다시 Permision을 요청할 수 없습니다. (이 경우 permision 승인 결과를 반영 하려면 사용자가 browser의 설저에서 notification permission으 수동으로 변경해 주어야 합니다. ) 사용자가 permission을 결정하지 않은채로 tab을 닫으면, 나중에 다시 물을 수 있습니다. - 프로그레시브 웹 앱의 모든것 p.277 -

- 사용자가 x 버튼 3번 누르면 강제로 차단으로 변경 

# pushManager.subscribe & notification.requestpermission
- pushManage.subscribe 메서드는 기본적으로 푸쉬 허용 여부가 없을때 notification.requestpermission을 호출한다.

>There is one side effect of calling subscribe(). If your web app doesn't have permissions for showing notifications at the time of calling subscribe(), the browser will request the permissions for you. This is useful if your UI works with this flow, but if you want more control (and I think most developers will), stick to the Notification.requestPermission() API that we used earlier.
[https://developers.google.com/web/fundamentals/push-notifications/subscribing-a-user#permissions_and_subscribe]
[https://stackoverflow.com/questions/46551259/what-is-the-correct-way-to-ask-for-a-users-permission-to-enable-web-push-notifi]

# Cache API
- `worker scope` 와 `window scope` 의 api 형태는 같지만 궁극적으로는 다른 거다. 
> Do note that worker scope and standard window scope is not the same. There are some APIs missing (e.g. localStorage is not available). So self in the Service Worker is kind of like window in standard JS, but not exactly the same.  [https://enux.pl/article/en/2018-05-05/pwa-and-http-caching], [https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/caches]



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


# 단점
- 정적 파일이 변경될 때, service worker에서 캐쉬이름을 변경해줘야 된다. 
- 모바일 디버깅이 힘들다
- 
# 해결해야 할거
- push server
- 개발 환경 ( 테스트를 https:// 에서 진행해야 한다. )

# 확인해야 할거 
- html 페이지와 sw.js 파일의 위치가 달라도 되느가?