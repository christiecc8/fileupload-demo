const express = require("express");
const fs = require('fs');

const pinataApiKey='ab7a2d0d4fe81f7f21ce'
const pinataSecretApiKey='f7798043ec32dcc7c8f7b5870651579b2a76f855e556eabb2689c33cc51093bc'

const app = express();

app.get('/testAPI', function(request, response) {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
  response.send("API is up and working!");
});

app.post('/uploadFile', function(request, response) {
  response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
  response.send("Received");
  fs.readFile(request.files.file.path, function(err, data) {
     console.log(data)
  });
});

app.listen(process.env.PORT || 9000);