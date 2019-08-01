/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "index.html",
    "revision": "502103d70807a9b2125000474396ac67"
  },
  {
    "url": "main.js",
    "revision": "ca606654745475ec40610135d68d9da0"
  },
  {
    "url": "style.css",
    "revision": "f8ed22fc1bd21379ebef3ca51bbd94e0"
  },
  {
    "url": "sw.js",
    "revision": "68b329da9893e34099c7d8ad5cb9c940"
  },
  {
    "url": "sw2.js",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "workbox-config.js",
    "revision": "a377ad7863a2a6e74192e3644ead4524"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
