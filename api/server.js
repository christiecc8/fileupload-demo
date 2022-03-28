const express = require("express");
const fs = require('fs');
const FormData = require('form-data');
const bodyParser = require('body-parser');
const multiparty = require('multiparty');
var util = require('util');
var pinata_uploader = require("./utils.js");

const imageUrl = 'https://gateway.pinata.cloud/ipfs/'

// const pinataSDK = require('@pinata/sdk');
// const pinataApiKey='ab7a2d0d4fe81f7f21ce'
// const pinataSecretApiKey='f7798043ec32dcc7c8f7b5870651579b2a76f855e556eabb2689c33cc51093bc'
// const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey);
// const imageUrl = 'https://gateway.pinata.cloud/ipfs/'

// const pinataApiKey='ab7a2d0d4fe81f7f21ce'
// const pinataSecretApiKey='f7798043ec32dcc7c8f7b5870651579b2a76f855e556eabb2689c33cc51093bc'
// const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey);

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.get('/testAPI', function(request, response) {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
  response.send("API is up and working!");
});

/* This is the API route that the front end calls to initiate IPFS file upload */
server.post('/uploadFile', async function (request, response) {
  response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
  
  var form = new multiparty.Form({
    autoFields: true
  });
  var nftName;
  var nftDesc;
  var nftUrl;
  var nftResponse;

  form.on('error', function(err) {
    console.log('Error parsing form: ' + err.stack);
  });
  
  form.on('field', function(name, value) {
    console.log('field: ' + name + ' with value ' + value);
    if (name === 'nftName') {
      nftName = value;
    } else if (name === 'nftDescription') {
      nftDesc = value;
    }
  })

  // Parts are emitted when parsing the form
  form.on('part', async function(part) {
    if (part.filename === undefined) {
      // ignore field's content
      part.resume();
    }
  
    if (part.filename !== undefined) {
      // filename is defined when this is a file
      console.log('got file named ' + part.filename);
      
      let response = await pinata_uploader.uploadImage(part);
      console.log("The response is")
      console.log(response);
      nftUrl = imageUrl + response.IpfsHash;
      console.log("Nft name is " + nftName + " desc is " + nftDesc + " and url is: " + nftUrl);
      
      let imageJson = {'name': nftName, 'description': nftDesc, image: nftUrl};
      pinata_uploader.uploadUri(imageJson).then((result) => {
        nftResponse = result;
        console.log("This is the nft reponse:")
        console.log(nftResponse);
      }).catch(error => {
        throw new Error(error);
      });
      part.resume();
    }
  
    part.on('error', function(err) {
      // decide what to do
      console.log("error");
    });
  });
  
  // Close emitted after form parsed
  form.on('close', function() {
    console.log('Upload completed!');
  });

  form.parse(request);
  // Parse req
  // try {
  //   form.parse(request);
  // } catch (error) {
  //   console.log("Error parsing");
  // } finally {
  //   console.log("All done~");
  //   response.json(nftResponse);
  // }
});


server.post('/uploadFileTesting', function (request, response) {
  let data = new FormData();
  let fileStream = fs.createReadStream('./pug.jpg')
  data.append('file', fileStream);
  console.log(fileStream);
  // console.log(data);
  return axios.post(url,
        data,
        {
            headers: {
                'Content-Type': `multipart/form-data; boundary= ${data._boundary}`,
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretApiKey
            }
        }
    ).then(function (response) {
        //handle response here
        // console.log(response);
        console.log("succeses testing")
    }).catch(function (error) {
        //handle error here
        console.log(response);
        console.log("failure testing")
    });
  
});


server.listen(process.env.PORT || 9000);