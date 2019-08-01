const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin:true});
var serviceAccount = require("./firebase_admin_key.json");
const webpush = require('web-push');

const applicationServerPublicKey = 'BA4Zlii7aeJeIiDJvprBfv4FWmpL7KKaBwJDL6Nut4zwC-4y2LxVY30zRscv6cZwQYaGOEOHS8O0oiAoBCo4jCk';
const applicationServerPrivate = 'tzv_L9neZGfzdK6o2hFs8Y9qbkSvB1xsie2ah9veKlo'

const applicationServerPublicKey2 = 'BF5BXWwl_mdN3VUJiGy_l98funGD9gg1klZI1d38P2EbCMjcIhz3LYGZeeEkXOxfL4REVz7s_Yhfj1G6Bogwx9k';
const applicationServerPrivate2 = 'tMkJnpVKkhM9pBYVCaip1i27rU07YNuTVU19XQFQGnY'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pushtest-c0b5a.firebaseio.com"
});

exports.helloWorld = functions.https.onRequest((request, response) => {
    console.log('hello from firebase');
    response.send("Hello from Firebase!!");
});

// subscription 저장
exports.storeSubscription = functions.region('asia-northeast1').https.onRequest(function(req, res){
    cors(req, res, function(){
        let body = JSON.parse(req.body)
        let subscription = body.subscription
        let sort = body.sort
        admin.database().ref('subscription').push({subscription, sort}).then(()=>{
            res.status(201).json({message:'Data stored', subscription: subscription})
        }).catch((err)=>{
            res.status(500).json({error: err})
        })
    })
})

// subscription 저장
exports.storeSubscription2 = functions.region('asia-northeast1').https.onRequest(function(req, res){
    cors(req, res, function(){
        let body = JSON.parse(req.body)
        let subscription = body.subscription
        let sort = body.sort
        admin.database().ref('subscription2').push({subscription, sort}).then(()=>{
            res.status(201).json({message:'Data stored', subscription: subscription})
        }).catch((err)=>{
            res.status(500).json({error: err})
        })
    })
})
// subscription 삭제
exports.removeSubscription = functions.region('asia-northeast1').https.onRequest(function(req, res){
    cors(req, res, function(){
        let subscription = JSON.parse(req.body).subscription
        admin.database().ref('subscription').orderByChild('subscription/endpoint').equalTo(subscription.endpoint).once('value').then((snapshot)=>{
            if(snapshot.numChildren()>0){
                snapshot.forEach(function(child){
                    child.ref.remove()
                })
                res.status(201).json({message:'Data removed', subscription: subscription})
            }else{
                res.status(401).json({message:'No have data', subscription: subscription})
            }
        })
    })
})

// subscription 삭제
exports.removeSubscription2 = functions.region('asia-northeast1').https.onRequest(function(req, res){
    cors(req, res, function(){
        let subscription = JSON.parse(req.body).subscription
        admin.database().ref('subscription2').orderByChild('subscription/endpoint').equalTo(subscription.endpoint).once('value').then((snapshot)=>{
            if(snapshot.numChildren()>0){
                snapshot.forEach(function(child){
                    child.ref.remove()
                })
                res.status(201).json({message:'Data removed', subscription: subscription})
            }else{
                res.status(401).json({message:'No have data', subscription: subscription})
            }
        })
    })
})

exports.getsubscription = functions.region('asia-northeast1').https.onRequest(function(req, res){
    cors(req, res, function(){
        admin.database().ref('subscription').once('value').then((snapshot)=>{
            let test = [];
            snapshot.forEach((e)=>{
                test.push(e.val().subscription)
            })
            res.status(201).json(test)
        })
    })
})

function getSubscriptions(){
    admin.database().ref('subscription').once('value').then((snapshot)=>{
        let subscriptions = [];
        snapshot.forEach((e)=>{
            subscriptions.push(e.val().subscription)
            console.log(e.val())
        })
        return subscriptions
    })
}

exports.sendPushMessage = functions.region('asia-northeast1').https.onRequest(function(req, res){
    const payload = JSON.parse(req.body).payload;
    const options = {
        vapidDetails: {
          subject: 'mailto:sender@example.com',
          publicKey: applicationServerPublicKey,
          privateKey: applicationServerPrivate
        },
        TTL: 10
    }
    admin.database().ref('subscription').once('value').then((snapshot)=>{
        let promises = [];
        snapshot.forEach((e)=>{
            promises.push(webpush.sendNotification(e.val().subscription, payload, options))
        })
        Promise.all(promises)
        .then(function(values) {
            console.log(values);
            res.status(201).json(values)
        })
        .catch(function(err){
            console.log(err)
            res.status(401).json(err)
        })
    })
})


exports.sendPushMessage2 = functions.region('asia-northeast1').https.onRequest(function(req, res){
    const payload = JSON.parse(req.body).payload;
    const options = {
        vapidDetails: {
          subject: 'mailto:sender@example.com',
          publicKey: applicationServerPublicKey2,
          privateKey: applicationServerPrivate2
        },
        TTL: 10
    }
    admin.database().ref('subscription2').once('value').then((snapshot)=>{
        let promises = [];
        snapshot.forEach((e)=>{
            promises.push(webpush.sendNotification(e.val().subscription, payload, options))
        })
        Promise.all(promises)
        .then(function(values) {
            console.log(values);
            res.status(201).json(values)
        })
        .catch(function(err){
            console.log(err)
            res.status(401).json(err)
        })
    })
})

exports.sendPushMessageAsSort = functions.region('asia-northeast1').https.onRequest(function(req, res){
    
    const body = JSON.parse(req.body)
    const payload = body.payload;
    const sorts = body.sort;
    const options = {
        vapidDetails: {
          subject: 'mailto:sender@example.com',
          publicKey: applicationServerPublicKey,
          privateKey: applicationServerPrivate
        },
        TTL: 10
    }

    cors(req, res, function(){
        admin.database().ref('subscription').once('value').then((snapshot)=>{
            let promises = [];
            snapshot.forEach((e)=>{
                console.log(sorts);
                if(sorts.some(targetSort => e.val().sort.includes(targetSort))){
                    console.log(e.val().sort);
                    promises.push(webpush.sendNotification(e.val().subscription, payload, options))
                }
            })
            Promise.all(promises)
            .then(function(values) {
                console.log(values);
                res.status(201).json(values)
            })
            .catch(function(err){
                console.log(err)
                res.status(401).json(err)
            })
        })
    })
})


exports.sendPushMessageAsSort2 = functions.region('asia-northeast1').https.onRequest(function(req, res){
    
    const body = JSON.parse(req.body)
    const payload = body.payload;
    const sorts = body.sort;
    const options = {
        vapidDetails: {
          subject: 'mailto:sender@example.com',
          publicKey: applicationServerPublicKey2,
          privateKey: applicationServerPrivate2
        },
        TTL: 10
    }

    cors(req, res, function(){
        admin.database().ref('subscription2').once('value').then((snapshot)=>{
            let promises = [];
            snapshot.forEach((e)=>{
                console.log(sorts);
                if(sorts.some(targetSort => e.val().sort.includes(targetSort))){
                    console.log(e.val().sort);
                    promises.push(webpush.sendNotification(e.val().subscription, payload, options))
                }
            })
            Promise.all(promises)
            .then(function(values) {
                console.log(values);
                res.status(201).json(values)
            })
            .catch(function(err){
                console.log(err)
                res.status(401).json(err)
            })
        })
    })
})
