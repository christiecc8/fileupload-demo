const express = require("express");
const fs = require("fs");
const FormData = require("form-data");
const bodyParser = require("body-parser");
const multiparty = require("multiparty");
const cors = require("cors");
var util = require("util");
var pinata_uploader = require("./utils.js");

const ipfsURL = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

const server = express();
server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.get("/testAPI", function (request, response) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");
  response.send("API is up and working!");
});

/* This is the API route that the front end calls to initiate IPFS file upload */
server.post("/uploadFile", async function (request, response) {
  try {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    response.header("Access-Control-Allow-Headers", "Content-Type");

    var form = new multiparty.Form({
      autoFields: true,
    });
    var nftName;
    var nftDesc;
    var nftUrl;
    var nftResponse;

    form.on("error", function (err) {
      console.log("Error parsing form: " + err.stack);
    });

    form.on("field", function (name, value) {
      console.log("Field: " + name + " value: " + value);
      if (name === "nftName") {
        nftName = value;
        console.log(nftName);
      } else if (name === "nftDesc") {
        nftDesc = value;
        console.log(nftDesc);
      }
    });

    // Parts are emitted when parsing the form
    form.on("part", async function (part) {
      if (part.filename !== undefined) {
        // filename is defined when this is a file
        console.log("got a file named " + part.name);
        let imageResponse = await pinata_uploader.uploadImage(part);
        nftUrl = ipfsURL + imageResponse.IpfsHash;

        let imageJson = { name: nftName, description: nftDesc, image: nftUrl };
        console.log(imageJson);

        pinata_uploader
          .uploadUri(imageJson)
          .then((result) => {
            nftResponse = ipfsURL + result.IpfsHash;
            var responseJson = {};
            responseJson["IPFSUrl"] = nftResponse;
            responseJson["IPFSUri"] = imageJson;
            console.log(responseJson);
            // should return status 200 on succesful uploads to our backend
            response.json(responseJson);
          })
          .catch((error) => {
            throw new Error(error);
          });
        part.resume();
      }

      part.on("error", function (err) {
        // decide what to do
        console.log("error");
      });
    });

    // Close emitted after form parsed
    form.on("close", function () {
      console.log("Upload completed!");
    });

    form.parse(request);
  } catch (error) {
    console.log("rest_api_error", error);
    return response.status(500).send({ msg: "internal service error srry :(" });
  }
});

server.listen(process.env.PORT || 9000);
