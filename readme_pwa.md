# PWA
PWA란 무엇이며 실제로 적용한 예시에 대한 내용 

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
