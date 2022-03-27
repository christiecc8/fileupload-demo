const pinataSDK = require('@pinata/sdk');
const pinataApiKey='ab7a2d0d4fe81f7f21ce'
const pinataSecretApiKey='f7798043ec32dcc7c8f7b5870651579b2a76f855e556eabb2689c33cc51093bc'
const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey);
const imageUrl = 'https://gateway.pinata.cloud/ipfs/'

module.exports = function(readStream) {
    let promise = new Promise(function( resolve, reject) { 
        resolve(pinata.pinFileToIPFS(readStream));
    });
    return promise;
}