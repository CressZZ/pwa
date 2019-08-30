const webpush = require('web-push');

const applicationServerPublicKey = 'BA4Zlii7aeJeIiDJvprBfv4FWmpL7KKaBwJDL6Nut4zwC-4y2LxVY30zRscv6cZwQYaGOEOHS8O0oiAoBCo4jCk';
const applicationServerPrivate = 'tzv_L9neZGfzdK6o2hFs8Y9qbkSvB1xsie2ah9veKlo'

const applicationServerPublicKey2 = 'BF5BXWwl_mdN3VUJiGy_l98funGD9gg1klZI1d38P2EbCMjcIhz3LYGZeeEkXOxfL4REVz7s_Yhfj1G6Bogwx9k';
const applicationServerPrivate2 = 'tMkJnpVKkhM9pBYVCaip1i27rU07YNuTVU19XQFQGnY'

const subscription = {"endpoint":"https://fcm.googleapis.com/fcm/send/drBWkmPoUlY:APA91bEqHDr9t-xkOVwvm7gzQOST2fWj7PLHFKPYpheYvW-0Bee9EUqFEPlZajERQFXUKOW7mAntjb1tUHae-0GhaDGop-FdBKU_IV5cuLKrgccgG9U3QmnLJaMF-zyzuDhYVRFey3JF","expirationTime":null,"keys":{"p256dh":"BKXAFjT7Du1OLQpSdYtPN8NjrhEwdiEiOCFBkryOEbvt3FbR7gg1fjIi6wVJqJdy_T3yDryWfCJdhGc0IhhUzxE","auth":"HbZ15GM6h6835R6W8vWR4A"}}

async function sendPushMessageAsSort(){
    
    const payload = JSON.stringify({a:"test"})
    const options = {
        vapidDetails: {
          subject: 'mailto:sender@example.com',
          publicKey: applicationServerPublicKey,
          privateKey: applicationServerPrivate
        },
        TTL: 10
    }
    try{
        var result = await webpush.sendNotification(subscription, payload, options)
        console.log(result);
    }catch(err){
        console.log(err)

    }

}

sendPushMessageAsSort();