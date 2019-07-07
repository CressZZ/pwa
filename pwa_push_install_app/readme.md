#  BeforeInstallPromptEvent ("install" a web site to a home screen.)
- 사파리 지원 안됨
- `beforeinstallprompt` : 앱 설치 조건이 만족 되면 (https://developers.google.com/web/fundamentals/app-install-banners/?hl=ko#criteria) `beforeinstallprompt` 이벤트 실행
- `BeforeInstallPromptEvent.prompt()` : 앱을 설치 할건지 묻는 함수



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