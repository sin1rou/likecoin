LIKE COIN
=========

## What is like coin?
Like coin is an internetive online coin like BitCoin, but like coin does not use blockchain technology.

## Idea
Using RSA cryptosystem, a coin contain public-key, and this indicate who own this coin.

To make transaction, user sign with private-key and send data to likecoin server.(see detail below)

## Usage
### list
```js
const webclient = require("request");
const fs = require("fs");

const pubKey = fs.readFileSync("pass/to/public-key");

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
```
then return is:
```json
{"sum":1,"coins":[{"id":"QGmbWGNkqAHg42NSqXzD","amount":1}]}
```

### send
```js
const crypto = require("crypto");
const fs = require("fs");
const webclient = require("request");

//alice wants to send a coin to bob
const alice_private_key = fs.readFileSync("pass/to/alice_private_key");
const bob_public_key = somehowGetBobPublicKey();

//coin id
const coin = "QGmbWGNkqAHg42NSqXzD";

const sign = crypto.createSign('SHA256');
sign.update(coin+":"+bob_public_key);
const signature = sign.sign(alice_private_key,"base64");

const data = {
    coin:coin,
    sign:signature,
    to:String(bob_public_key)
};

webclient.post({
    url:"https://us-central1-likecoin-4c824.cloudfunctions.net/send",
    headers: {
        "content-type": "application/json"
    },
    body: JSON.stringify(data)
    },(error, response, body)=>{
        console.log(response.statusCode, body);
    }
);
```

