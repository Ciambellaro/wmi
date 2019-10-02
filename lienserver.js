// Dependencies

const Youtube = require("youtube-api")
    , fs = require('fs')
    , readJson = require("r-json")
    , Lien = require("lien")
    , Logger = require("bug-killer")
    , opn = require("opn")
    , prettyBytes = require("pretty-bytes")
    ;

    var express = require('express');
    var app = express();

// I downloaded the file from OAuth2 -> Download JSON
const CREDENTIALS = readJson(`${__dirname}/credentials.json`);


// Init lien server
var server = new Lien({
    host: "localhost"
  , port: 8443
  , public: __dirname + "/public"
  , ssl: {
        key: "privkey.pem"
      , cert: "pubcert.pem"
    }
});

/*app.get('/', function (req, res) {
  res.sendfile('login.html'); 
});

app.get('/map', function (req, res) {
  res.sendfile('index.html'); 
});*/

// Listen for load
server.on("load", function (err) {
    console.log(err || "Server started on port 8443.");
    err && process.exit(1);
});

// Add page
server.addPage("/", function (lien) {
    lien.end("Hello World");
});

// Add a dynamic route
server.addPage("/post/:id", function (lien) {
    lien.end("Post id: " + lien.params.id);
});

server.addPage("/test", "/index.html");

let oauth = Youtube.authenticate({
  type: "oauth"
, client_id: CREDENTIALS.web.client_id
, client_secret: CREDENTIALS.web.client_secret
, redirect_url: CREDENTIALS.web.redirect_uris[0]
});

opn(oauth.generateAuthUrl({
  access_type: "offline"
, scope: ["https://www.googleapis.com/auth/youtube.upload"]
}));

// Handle oauth2 callback
server.addPage("/oauth2callback", lien => {
  Logger.log("Trying to get the token using the following code: " + lien.query.code);
  oauth.getToken(lien.query.code, (err, tokens) => {

      if (err) {
          lien.lien(err, 400);
          return Logger.log(err);
      }

      Logger.log("Got the tokens.");

      oauth.setCredentials(tokens);

      lien.end("The video is being uploaded. Check out the logs in the terminal.");

      var req = Youtube.videos.insert({
          resource: {
              // Video title and description
              snippet: {
                  title: "Prova pubblico"
                , description: "Test video upload via YouTube API"
              }
              // I don't want to spam my subscribers
            , status: {
                  privacyStatus: "public"
              }
          }
          // This is for the callback function
        , part: "snippet,status"

          // Create the readable stream to upload the video
        , media: {
              body: fs.createReadStream("video.mp4")
          }
      }, (err, data) => {
          console.log("Done.");
          process.exit();
      });

      setInterval(function () {
          Logger.log(`${prettyBytes(req.req.connection._bytesDispatched)} bytes uploaded.`);
      }, 250);
  });
});