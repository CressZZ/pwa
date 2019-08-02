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

// fcm 에서 생성한  VAPID
const applicationServerPublicKey = 'BOCHoU_Ym8vKG5mjwIVzNTThP_rpcjrI7C2liL3sYhGpAt-leD9V3-ggUaItj5guFW5m5JEwremfCnt_pt2JIrE ';
// private = vS5NkdSrlnucWS_hT2I8qqW2MYNvqdlLyCLjeUBvapk

const API_ORIGIN_LOCAL = 'http://localhost:8010/pushtest-c0b5a/us-central1';
const API_ORIGIN_ONSERVICE = 'https://asia-northeast1-pushtest-c0b5a.cloudfunctions.net';
const API_ORIGIN = location.origin.indexOf('local') > 0 && API_ORIGIN_LOCAL || API_ORIGIN_ONSERVICE


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

    updateSubscriptionInfo(subscription);

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

    updateSubscriptionInfo(subscription);
    addSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function addSubscriptionOnServer(subscription){
  let sort = [];
  document.querySelectorAll('input[name=sort]').forEach(checkbox=>{
    if(checkbox.checked){
      sort.push(checkbox.value)
    }
  })

  fetch(`${API_ORIGIN}/storeSubscription`, {
    'method': 'POST',
    'Content-type': 'application/json',
    'Accept': 'application/json',
    'body': JSON.stringify({subscription: subscription, sort: sort})
  }).then((res)=>{
    res.json().then((data)=>{
      console.log('구독내용 서버에 전송', data)
    });
    document.querySelectorAll('input[name=sort]').forEach(checkbox => {
      checkbox.setAttribute('disabled', 'true');
    })
  }).catch((err)=>{console.log('실패')})
}

function removeSubscriptionOnServer(subscription){

  fetch(`${API_ORIGIN}/removeSubscription`, {
    'method': 'POST',
    'Content-type': 'application/json',
    'Accept': 'application/json',
    'body': JSON.stringify({subscription: subscription})
  }).then((res)=>{
    res.json().then((data)=>{
      console.log('구독내용 서버에서 삭제 완료', data)
    });
    document.querySelectorAll('input[name=sort]').forEach(checkbox => {
      checkbox.removeAttribute('disabled');
    })
   
  }).catch((err)=>{console.log('실패')})
}

// 서버로 보내야 함 
function updateSubscriptionInfo(subscription) {  
  
  const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails = document.querySelector('.js-subscription-details');


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
    updateSubscriptionInfo(null);
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
  // 서버에서 지워야 하지 않을까?

  // 구독 해지 (push service에 구독 안한다고 보냄)
  .then(function(subscription) {
    if (subscription) {
      removeSubscriptionOnServer(subscription)
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionInfo(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}
