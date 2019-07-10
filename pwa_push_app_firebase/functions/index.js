const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin:true});




var serviceAccount = require("./firebase_admin_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pushtest-c0b5a.firebaseio.com"
});


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});


// exports.helloWorld2 = functions.https.onRequest((request, response) => {
//     fetch('https://pushtest-c0b5a.firebaseio.com/test.json',{
//         method: 'POST',
//         headers:{
//             'Content-Type': 'application/json',
//             'Accept' : 'applicatoin/json'
        
//         },
//         body: JSON.stringify({name:'cress00'})
//     })
// });

exports.storeSubscription = functions.region('asia-northeast1').https.onRequest(function(req, res){
    // res.send(req.body.name);
    cors(req, res, function(){
        admin.database().ref('test').push({
            name: req.body.name
        }).then(()=>{
            res.status(201).json({messate:'Data stored', name: req.body.name})
        }).catch((err)=>{
            res.status(500).json({error: err})
        })
    })
})

