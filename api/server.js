const express = require("express");
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const bodyParser = require('body-parser');
let busboy = require('busboy');
const { Readable } = require('stream');
const pinataSDK = require('@pinata/sdk');

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

// server.post('/uploadFile', function (request, response) {
//   response.header("Access-Control-Allow-Origin", "*");
// 	response.header("Access-Control-Allow-Headers", "X-Requested-With");
  
//   let formData = new FormData();

//   const bb = busboy({ headers: request.headers });
//   const buf = [];
  
//   bb.on('file', (name, file, info) => {
//     file.on("data", (d) => {
//       buf.push(d)
//     }).on("end", async () => {
//       let data = Buffer.concat(buf);
//       console.log("This is the buffer");
//       console.log(data);
//       const readStream = new Readable({
//         read() {
//           this.push(data)
//         }
//       })
//       console.log("This is the read stream:")
//       console.log(readStream);
//       formData.append('file', readStream, name);
//     });
//   });
//   request.pipe(bb);

//   axios.post(url,
//     formData, 
//     {
//       headers: {
//           'Content-Type': `multipart/form-data; boundary= ${formData._boundary}`,
//           'pinata_api_key': pinataApiKey,
//           'pinata_secret_api_key': pinataSecretApiKey
//       }
//     }
//   ).then(function(response) {
//     console.log("success");
//     console.log(response);
//   }).catch(function(error){
//     throw new Error(error);
//     console.log("This is the form data")
//     console.log(formData)
//   });
// });

server.post('/uploadFile', function (request, response) {
  response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
  
  const bb = busboy({ headers: request.headers });
  const buf = [];
  bb.on('file', (name, file, info) => {
      file.on('data', (data) => {
        buf.push(data);
      })
      file.on('end', () => {
        const readStream = createReadableStream(buf);
        console.log(readStream);
    pinata.pinFileToIPFS(readStream).then((result) => {
      //handle results here
      console.log(result);
  }).catch((err) => {
      //handle error here
      console.log(err);
  });
      });
  });
  request.pipe(bb);
    
});

const createReadableStream = (buffer) => {
  const readableInstanceStream = new Readable({
      read() {
          for (const bytes of buffer) {
              this.push(bytes);
          }
          this.push(null);
      },
  });
  return readableInstanceStream;
};

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