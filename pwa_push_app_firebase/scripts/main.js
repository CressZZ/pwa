/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BA4Zlii7aeJeIiDJvprBfv4FWmpL7KKaBwJDL6Nut4zwC-4y2LxVY30zRscv6cZwQYaGOEOHS8O0oiAoBCo4jCk';
// private = tzv_L9neZGfzdK6o2hFs8Y9qbkSvB1xsie2ah9veKlo


const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// 지원 여부 확인
function makeTmplSupportList(item){
  let tmpl =  document.createElement("LI");  
  tmpl.innerHTML = item
  return document.querySelector('.support-list').appendChild(tmpl);
}
function makeTmplNotSupportList(item){
  let tmpl =  document.createElement("LI");  
  tmpl.innerHTML = item
  return document.querySelector('.not-support-list').appendChild(tmpl);
}

'serviceWorker' in navigator && makeTmplSupportList('serviceWorker') || makeTmplNotSupportList('serviceWorker');
'PushManager' in window && makeTmplSupportList('PushManager') || makeTmplNotSupportList('PushManager');
'caches' in window && makeTmplSupportList('caches') || makeTmplNotSupportList('caches');


if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('sw.js')
  .then(function(swReg) {
    console.log('Service Worker is registered', swReg);

    swRegistration = swReg;
    initialiseUI();
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');

  pushButton.textContent ='serviceWorker' in navigator && 'Push Not Supported!' || 'service worker Not Supported!';

}

// UI 세팅
function initialiseUI() {
  // 버튼 이벤트
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    // 구독이면 구독취소
    if (isSubscribed) {
      unsubscribeUser();
    // 구독 아니면 구속 신청
    } else {
      subscribeUser();
    }
  });


  // Set the initial subscription value
  // notification 받을 건지 물어봄
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    updateSubscriptionOnServer(subscription);

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }

    updateBtn();
  });
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  // 이시점에서 subscription정보를 service에서 갖옴
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed:', subscription);

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

// 서버로 보내야 함 
function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server
  // server로 subscription정보 보내기!!!!!!!!!!!
  // null인 경우 subscription구독 해지해야 하는가?

  
  const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails =
    document.querySelector('.js-subscription-details');

  // subscription 정보 출력
  if (subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove('is-invisible');
  // subscription 정보 닫기
  } else {
    subscriptionDetails.classList.add('is-invisible');
  }
}


function updateBtn() {
  // notification 안받으면 모든게 끝남 
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  // noti는 받는데, 구독은 할지 안할지 결정 하는 부분
  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  // 구독 해지 (push service에 구독 안한다고 보냄)
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}