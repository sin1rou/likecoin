const crypto = require("crypto");
const fs = require("fs");
const admin = require("firebase-admin");
const webclient = require("request");

const serviceAccount = require("./keys/likecoin-4c824-firebase-adminsdk-y82z7-cad252c292.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://likecoin-4c824.firebaseio.com"
  });

const priKey = fs.readFileSync("./keys/watace.key");
const pubKey = fs.readFileSync("./keys/watace.pub");
const alicePub = fs.readFileSync("./Keys/alice.pub");
const aliceKey = fs.readFileSync("./keys/alice.key");

// const alice = crypto.createECDH('secp384r1');
// const aliceKey = alice.generateKeys('base64','compressed');

// console.log(aliceKey);
// console.log(alice.getPrivateKey('base64'));
// console.log(alice.getPublicKey('base64'));

const sendTo = pubKey;
const signKey = aliceKey;

const coin = "QGmbWGNkqAHg42NSqXzD";
const sign = crypto.createSign('SHA256');
sign.update(coin+":"+sendTo);
const stamp = sign.sign(signKey,"base64");
console.log(stamp);

const sendData = {
    coin:coin,
    sign:stamp,
    to:String(sendTo)
};
console.log(sendData);

// webclient.post({
//     url:"https://us-central1-likecoin-4c824.cloudfunctions.net/send",
//     headers: {
//         "content-type": "application/json"
//     },
//     body: JSON.stringify(sendData)
//     },(error, response, body)=>{
//         console.log(response.statusCode, body);
//     }
// );

webclient.post({
    url:"https://us-central1-likecoin-4c824.cloudfunctions.net/list",
    headers: {
        "content-type": "application/json"
    },
    body: JSON.stringify({pubkey:String(pubKey)})
    },(error, response, body)=>{
        console.log(response.statusCode, body);
    }
);

// admin.firestore().collection("transaction").doc("uzpKCGFvOIKs7VGamTaU").get().then(snap=>{
//     const data = snap.data();
//     const verify = crypto.createVerify('SHA512');
//     verify.update(data.coin+":"+data.to);
//     admin.firestore().collection("coins").doc(data.coin).get().then(coinsnap=>{
//         console.log(coinsnap.data().owner.replace(/ {4,}/g,""));
//         const isTrue = verify.verify(coinsnap.data().owner.replace(/ {4,}/g,""),data.sign,"base64");
//         console.log(isTrue);

//     })
// })