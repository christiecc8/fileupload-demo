const express = require("express");
const fs = require('fs');
const FormData = require('form-data');
const bodyParser = require('body-parser');
const multiparty = require('multiparty');
var util = require('util');
var pinata_uploader = require("./utils.js");

const ipfsURL = 'https://gateway.pinata.cloud/ipfs/'

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
    if (name === 'nftName') {
      nftName = value;
    } else if (name === 'nftDescription') {
      nftDesc = value;
    }
  })

  // Parts are emitted when parsing the form
  form.on('part', async function(part) {
    if (part.filename !== undefined) {
      // filename is defined when this is a file
    
      let imageResponse = await pinata_uploader.uploadImage(part);
      nftUrl = ipfsURL + imageResponse.IpfsHash;
 
      let imageJson = {'name': nftName, 'description': nftDesc, image: nftUrl};
      pinata_uploader.uploadUri(imageJson).then((result) => {
        nftResponse = ipfsURL + result.IpfsHash;
        response.json(nftResponse);
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