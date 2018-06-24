"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
admin.initializeApp();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.generateCoin = functions.https.onRequest((request, response) => {
    const ownerPubKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkvxncAlvGEBoTth4jAjd
eHJvjvV/GMlSFID6hMSFh9rLfmR0eB2lgYQ5izU1GDkYQQW7r5BHrGQBqSf9VQqH
4yqRY027X64n1/IMcEUVOt0ZqjKzsNJv+DLP9ji7D/7coFBE+xoNkZJ3LxWJTaVB
yZAKyVh57gxH5WTo6zYbLMlh2hkcP1ThYQPjSjLULb19b7iDHVwhQi938cXzj5ol
CH3cgjB2GwqLPHaR0k9V2mbrNjeOPFOR5mqOHoOGwE4lzzRwICyKjZeQPbmSm3+n
wyJ020fcDsjPj4PNEeEmyMMBlMNLWfVsWyHHH3ftupUHDQ9QiZHcD5GGKkmLQ51D
bQIDAQAB
-----END PUBLIC KEY-----`;
    admin.firestore().collection("coins").add({
        amount: request.body.amount || 1,
        owner: ownerPubKey
    }).then(() => response.send(200))
        .catch(() => response.send(500));
});
function makeTransaction(data) {
    return admin.firestore().collection("transaction").add(data);
}
exports.send = functions.https.onRequest((request, response) => {
    if (!request.body) {
        response.send(400);
    }
    else {
        const data = request.body;
        const coin = data.coin;
        const sign = data.sign;
        const to = data.to;
        const text = data.text;
        const transactionData = {
            coin,
            sign,
            to,
            text: text || "",
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
        const verify = crypto.createVerify("SHA256");
        verify.update(coin + ":" + to);
        if (coin && sign && to) {
            admin.firestore().collection("coins").doc(coin).get()
                .then(coinsnap => {
                if (!coinsnap.exists) {
                    transactionData["accepted"] = false;
                    transactionData["status"] = "invalid coin";
                    makeTransaction(transactionData).then(() => response.status(400).send("invalid coin")).catch(err => { console.log(err); console.log(data); response.send(500); });
                }
                else {
                    const coindata = coinsnap.data();
                    if (verify.verify(coindata.owner.replace(/ {4,}/g, ""), sign, "base64")) {
                        coinsnap.ref.update({ owner: to }).then(() => {
                            transactionData["accepted"] = true;
                            transactionData["status"] = "completed";
                            makeTransaction(transactionData).then(() => response.send(200)).catch(err => { console.log(err); console.log(data); response.send(500); });
                        }).catch(coinupdateerr => {
                            transactionData["accepted"] = false;
                            transactionData["status"] = "cannot update coin";
                            console.log("coinupdateerr", coinupdateerr);
                            makeTransaction(transactionData).then(() => response.send(500)).catch(err => { console.log(err); console.log(data); response.send(500); });
                        });
                    }
                    else {
                        console.log("invalid sign");
                        transactionData["accepted"] = false;
                        transactionData["status"] = "invalid sign";
                        response.status(400).send("invalid sign");
                        makeTransaction(transactionData).catch(err => { console.log(err); console.log(data); response.send(500); });
                    }
                }
            }).catch(err => {
                console.log(err);
                response.status(500).send("something wrong");
            });
        }
        else {
            response.status(400).send("request need 'coin', 'sign', 'to' field");
        }
    }
});
exports.list = functions.https.onRequest((request, response) => {
    if (!request.body) {
        response.send(400);
    }
    else {
        const data = request.body;
        const query = data.pubkey;
        admin.firestore().collection("coins").where("owner", "==", query).get().then(queryss => {
            let ret = [];
            let sum = 0;
            queryss.forEach(doc => {
                const docdata = doc.data();
                ret.push({ id: doc.id, amount: docdata.amount });
                sum += docdata.amount;
            });
            response.status(200).send(JSON.stringify({ sum, coins: ret }));
        }).catch(err => {
            console.log(err);
            response.send(500);
        });
    }
});
//# sourceMappingURL=index.js.map