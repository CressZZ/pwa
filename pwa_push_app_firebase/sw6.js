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

/* eslint-env browser, serviceworker, es6 */

'use strict';




let CACHE_NAME = 'test-cache-v2';
let CACHED_URLS = [
    './index-offline2.html',
    `./scriptss/main2.js`,
    `./styles/index.css`,
]
self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data:`, event.data.json());

    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
    const data = event.data.json();
    const title = 'Push Codelab';
    const options = {
        body: `${data.message}`,
        icon: `./promo/test/pwa/images/icon.png`,
        badge: `./promo/test/pwa/images/badge.png`,
        image: `./promo/test/pwa/images/bg.jpg`,
        data: data,
        actions: [
            {
                action:"test",
                title: "title",
                icon:`./promo/test/pwa/images/icons/256x.png`,
            },
            {
                action:"test2",
                title: "title2",
                icon:`./promo/test/pwa/images/icons/256x.png`,
            },
        ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click Received.');
    console.log('[Service Worker] evet.data: ', event.notification);


    event.notification.close();

    event.waitUntil(clients.matchAll({
        type: "window"
      }).then(function(clientList) {
        if (clientList.length > 0) {
            clientList[0].navigate(event.notification.data.url)
            clientList[0].focus();
            return;
        }

        if (clients.openWindow) return clients.openWindow(event.notification.data.url);
      }));


});



self.addEventListener('install', event => {
    console.log('io');
    console.log('service worker is installed!')
    self.skipWaiting();
    // event.waitUntil(


    //     caches.open(CACHE_NAME)
    //     .then(cache => {
    //         console.log('install origin!', self.location.origin);

    //         return cache.addAll(CACHED_URLS)
    //             // .then(()=>cache.add(myRequest_css))
    //             // .then(()=>cache.add(myRequest_main))
    //             .then(()=>{console.log('service worker is installed!')}) 
    //             .then(()=>{  self.skipWaiting();})
    //             // .catch((err)=>{console.log(err)})
    //     })
    //     .catch(err => console.log(err)) // 프로미스에 catch가 있으므로 이 프로미스는 resolve 된것 이고, 결과적으로  event.waitUntil()의 인자는 resolve이므로, install 이벤트가 완료 된다.
    // )
})

self.addEventListener('fetch', function(event){
    event.respondWith(
        fetch(event.request)
        .catch(function(){
            return caches.match(event.request).then(response => {
                if(response){
                    console.log(response)
                    return response;
                }else if(event.request.headers.get("accept").includes("text/html")){
                    return caches.match("./index-offline2.html")
                }
            })
        })
    )
   
})
