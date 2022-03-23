const express = require("express");
const fs = require('fs');
const FormData = require('form-data');
const bodyParser = require('body-parser');
const pinataSDK = require('@pinata/sdk');
const multiparty = require('multiparty');
var util = require('util');

const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
const pinataApiKey='ab7a2d0d4fe81f7f21ce'
const pinataSecretApiKey='f7798043ec32dcc7c8f7b5870651579b2a76f855e556eabb2689c33cc51093bc'
const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey);

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.get('/testAPI', function(request, response) {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
  response.send("API is up and working!");
});

server.post('/uploadFile', function (request, response) {
  response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
  
  var form = new multiparty.Form();
  form.on('error', function(err) {
    console.log('Error parsing form: ' + err.stack);
  });
  
  // Parts are emitted when parsing the form
  form.on('part', function(part) {
    // You *must* act on the part by reading it
    // NOTE: if you want to ignore it, just call "part.resume()"
  
    if (part.filename === undefined) {
      // filename is not defined when this is a field and not a file
      console.log('got field named ' + part.name);
      // ignore field's content
      part.resume();
    }
  
    if (part.filename !== undefined) {
      // filename is defined when this is a file
      console.log('got file named ' + part.name);
      pinata.pinFileToIPFS(part).then((result) => {
          //handle results here
          console.log(result);
      }).catch((err) => {
          //handle error here
          console.log(err);
      });
      // ignore file's content here
      part.resume();
    }
  
    part.on('error', function(err) {
      // decide what to do
    });
  });
  
  // Close emitted after form parsed
  form.on('close', function() {
    console.log('Upload completed!');
  });
  
  // Parse req
  form.parse(request);
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