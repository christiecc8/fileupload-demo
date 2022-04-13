import dotenv from 'dotenv';
dotenv.config()

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_API_SECRET_KEY;
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey);


module.exports = {
    uploadImage:function(readStream) {
        console.log("test key: " + pinataApiKey);
        console.log("test secret: " + pinataSecretApiKey);
        let promise = new Promise(function(resolve, reject) { 
            resolve(pinata.pinFileToIPFS(readStream));
        });
    return promise;
    },

    uploadUri:function(uri) {
       let promise = new Promise(function(resolve, reject) {
           resolve(pinata.pinJSONToIPFS(uri));
       });
       return promise;
    }
}