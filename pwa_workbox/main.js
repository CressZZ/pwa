if('serviceWorker' in navigator){
    registerServiceWorker('./sw.js')
    registerServiceWorker('./sw2.js')
    registerServiceWorker('./service-worker-workbox.js')
}

async function registerServiceWorker(path){
    try{
        await navigator.serviceWorker.register(path)
        console.log( 'Service worker registered : ' + path)
    }catch(error){
        console.log(error)
    }
}