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
    './index-offline.html',
    'https://cress00-pwa.s3.ap-northeast-2.amazonaws.com/pwa/script/main.js',
    'https://cress00-pwa.s3.ap-northeast-2.amazonaws.com/pwa/styles/index.css',
]
self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'Push Codelab';
    const options = {
        body: 'Yay it works.',
        icon: 'images/icon.png',
        badge: 'images/badge.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('https://developers.google.com/web/')
    );
});


// self.addEventListener('fetch', function(event){
//     if(event.request.url.includes("index.css")){
//         event.respondWith(
//             new Response("body {background: green}", {headers:{"Content-type": "text/css"}})
//         )
//     }
// })
var myHeaders = new Headers();
myHeaders.append('Origin', 'https://cresszz.github.io');
var myInit = { 
    method: 'GET',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default' 
  };
  
var myRequest = new Request('https://cress00-pwa.s3.ap-northeast-2.amazonaws.com/pwa/styles/index.css', myInit);
// var myRequest2 = new Request('https://cress00-pwa.s3.ap-northeast-2.amazonaws.com/pwa/script/main.js', myInit);

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache)=> {
            return cache.add('./index-offline.html')
                .then(()=>cache.add('https://code.jquery.com/jquery-3.4.1.js'))
                .then(()=>cache.add(myRequest))
                // .then(()=>cache.add('https://cress00-pwa.s3.ap-northeast-2.amazonaws.com/pwa/script/main.js'))

                
        })
        // .then(cache => {
        //     return cache.addAll(CACHED_URLS)
        //         .catch((err)=>{console.log(err)})
        // })
        .catch(err => console.log(err))
    )
})

self.addEventListener('fetch', function(event){
    event.respondWith(
        fetch(event.request).catch(function(){
            return caches.match(event.request).then(response => {
                if(response){
                    return response;
                }else if(event.request.headers.get("accept").includes("text/html")){
                    return caches.match("./index-offline.html")
                }
            })
        })
    )
   
})