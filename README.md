# PWA란 
- 아래의 내용을 필요한대로 골라서 점진적으로 웹을 앱처럼 만든다. 
    - 보안(https), 
    - 앱설치, 
    - GPS, 
    - Push, 
    - 카메라기능, 
    - 빠른 속도(오프라인환경에서 작동, 캐쉬등...) 등등...


# install
- https://stackoverflow.com/questions/50332119/is-it-possible-to-make-an-in-app-button-that-triggers-the-pwa-add-to-home-scree/50356149#50356149
Chrome(or any PWA supporting browser) triggers the beforeinstallprompt event for Web app install banner, which you can catch and re-trigger in more appropriate time when you think user wont miss it/convinced about adding your site to home page. Starting Chrome version 68, catching beforeinstallprompt and handling the install prompt programmatically is mandatory and no banners will be shown automatically.

In case the user have missed the prompt/declined to add to home screen, the event can't be manually triggered by our code. This is intentionally left that way to avoid web pages annoying the users to repeatedly prompt the user for adding to home screen. Thinking of users perspective, this makes complete sense.

Yes, there are cases when user miss the option accidentally and he may not know of the browser menu option to "Add to home screen" and it would be nice for us to trigger the same again. But unfortunately, that's not an option. At lest for now and I personally don't see that changing much considering how developers can abuse if its left to the developers to prompt.

Alternate option: If the user have missed the install prompt or even chosen not to install it to home screen, give some time and when you think he is starting to like your site(based on conversions) you can show him a full page or half page Div popup kind of install instructions to add your site to home screen from browsers menu. It can have some images or Gif animation showing user how to add to home screen from the menu. With that, it should be self explanatory to most users, if not all.

Here is some code example for the same, which is iOS specific(look under #PROTIP 3).

As a bonus, you can show some promotions like discounts or added features when user add to home screen, which will convince user to do so. PWA has a way to find if the site is accessed form the home screen or browser.

For Development/testing: If you need this banner to come multiple times for dev/testing purpose, you can set the below flow in your Chrome for the same,

# install
- 다른 path의 multiple 설치 ok
- pc 에서 설치된 앱 지우는 곳 `chrome://apps/`

- `chrome://flags/#bypass-app-banner-engagement-checks`





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




# FCM 관련 잠정 결정 
## 전역 service-worker.js 파일을 사용한다. 
- 별도의 scope를 가진 serviceworker(`firebase-messaging-sw.js` 포함)을 사용하지 않는다. 
- 다른 scope를 가진 service-worker는 자동으로 파일 업데이트를 확인 하지 않는다. (테스트 결과)
- 해당 scope의 페이지에 진입하거나 강제로 servicewoker를 업데이트 해줘야 한다. 
- `firebase-messaging-sw.js`의 경우에는 `messaging.getToken();` 메서드 실행시 강제 업데이트가 된다. 
- 필요 없어질 경우 해당 serviceworker를 unregester 시키는 방법도 애매하다. 
- 위의 경우처럼 업데이트 시점을 위해, 루트 패스 하위 페이지는 적절한 servicewoker파일의 업데이트를 위하여 업데이트를 위한 js파일이 별도로 필요해진다. 

## service-worker.js 파일에서 push를 위한 firebase 라이브러리를 사용하지 않는다. 
- setBackgroundMessageHandler을 사용하면 포그라운드에서 노티 띄우는게 복잡해 진다. 
- 복잡해 진다는 것은 각 js 파일에 포그라운드 이벤트 수신시 노티를 띄우는 로직을 추가 해야 한다. 
- firebase 라이브러리가 없어도 디폴트 push API로 잘 동작 한다. 

## manifest.json의 위치
### static 서버에 있을 경우
- `start_url` 의 경로가 도메인을 포함한 절대 경로로 지정해야 하므로, 각 망별로 다른 manifest.json을 생성 해야 한다.
- `icon` 이미지 경로가 통일 되나, 어자피, 위의 이유로 manifest.json 을 여러개 만들어야 한다. 
### web 서버에 있을 경우
- `start_url` 의 경로가 상재 경로로 지정할 수 있어 manifest.json파일이 하나면 된다.
- `icon` 이미지를 web server에 저장 하거나 
- `icon` 이미지를 static server에 저장하려면 망별로 다른 static 서버에 저장해야 하며, manifest.json 파일도 망별로 다른 것을 준비 해야 한다. 
- 그런데 이미지를 web server에 저장해도 되나!?
### 결론
- 일단 web 서버에 넣고, `icon`이미지도 web server에 저장 하면 하나의 manifest.json과 icon 파일로 해결 가능 하다.??








# 여러개 인스톨 할때 (install) => 안드로이드 크롬, 맥 크롬 테스트 완료
- `manifest.json` 의  `start_url` 이 다르면 여러개 설치 할 수 있다. 
- 특이한 점으로 하위 `scope`에서 인스톨 하면, 상위 `scope`를 별도로 설치 할수 있지만, 
- 상위 `scope`를 먼저 인스톨 하고, 하위 `scope`를 설치 하려 하면 설치 표시가 안나온다. 
-  `start_url`이 `scope` 역할을 하여, `scope`을 벗어 나면, 상단에 스코프 벗어 났다고 표시 된다. 

# install
## 링크 클릭 및 서버 redirect시 앱이 열림
- `manifest.json` 의 `start_url` 스코프에 해당하는 링크를 클릭 하거나, 서버에서 redirect 회신이 오면 
    - 안드로이드 크롬의 무조건 경우 인스톨한 앱이 열리고
    - 안드로이드 삼성의 경우 선택권이(앱으로 열지, 브라우저로 열지)주어진다. 
    - https://developers.google.com/web/fundamentals/integration/webapks#android_intent_filters

## 크롬에서 인스톨 되는 시간 
- 안드로이드 크롬에서 인스토 되는 시간이 좀 길다. 
- 인스톨이 완료되지 않은 시점에서 브라우저를 백그라운드 실행 `종료` 해버리면 인스톨이 되지 않는다. 
## 푸시 


# manifest.json => start_url
- 사파리에서 작동함





# pwa 예시
## 인스톨 & 오프라인
- app.starbucks.com
## 푸시
- https://housing.com/in/buy/real-estate-mumbai

# 단점
- 정적 파일이 변경될 때, service worker에서 캐쉬이름을 변경해줘야 된다. 
- 모바일 디버깅이 힘들다
- 개발 환경 ( 테스트를 https:// 에서 진행해야 한다. )
