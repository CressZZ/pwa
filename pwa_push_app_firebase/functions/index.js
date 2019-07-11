const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin:true});

var serviceAccount = require("./firebase_admin_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pushtest-c0b5a.firebaseio.com"
});

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

// subscription 저장
exports.storeSubscription = functions.region('asia-northeast1').https.onRequest(function(req, res){

    cors(req, res, function(){
        let subscription = JSON.parse(req.body).subscription
        // if(isAlreadyStoredSubscription(subscription)){
        //     res.status(201).json({message:'이미 있는 구독입니다.', name: subscription})
        // }
        admin.database().ref('subscription').push({subscription}).then(()=>{
            res.status(201).json({message:'Data stored', name: subscription})
        }).catch((err)=>{
            res.status(500).json({error: err})
        })
    })
})

exports.getSubscriptioin = functions.region('asia-northeast1').https.onRequest(function(req, res){

    cors(req, res, function(){

        admin.database().ref('subscription').once('value').then((snapshot)=>{
            let test = [];
            snapshot.forEach((e)=>{
                console.log(e.val());
                test.push(e.val().subscription)
            })
            res.status(201).json(test)
            
        })
    })
})

// const getSubscriptioin = () => {
//     admin.database().ref('subscription').once('value').then((subscription)=>{
//         return subscription;
//     })
// }

const isAlreadyStoredSubscription = (target) => {
    let subscriptions = getSubscriptioin();
    return subscriptions.filter((subscription)=>{return subscription.endpoint === target.endpoint;}).length > 0;
}


// message 전송


