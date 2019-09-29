/*
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('pubcert.pem')
};

const router = require('./routes');
 
const handleRequest = (request, response) => {
  response.writeHeader(200, {"Content-Type": "text/html"});  
  response.write(html);  
  response.end();  
};

/*
https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(8000);
*/
 
//https.createServer(options, router.handleRequest).listen(8000);


var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync( 'privkey.pem' );
var certificate = fs.readFileSync('pubcert.pem');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

// your express configuration here
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendfile('login.html'); 
});

app.get('/map', function (req, res) {
  res.sendfile('index.html'); 
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);

const Youtube = require("youtube-api")
    , readJson = require("r-json")
    , Lien = require("lien")
    , Logger = require("bug-killer")
    , opn = require("opn")
    , prettyBytes = require("pretty-bytes")
    ;

// I downloaded the file from OAuth2 -> Download JSON
const CREDENTIALS = readJson(`credentials.json`);

// Init lien server
let server = new Lien({
    host: "localhost"
  , port: 8443
});

// Authenticate
// You can access the Youtube resources via OAuth2 only.
// https://developers.google.com/youtube/v3/guides/moving_to_oauth#service_accounts
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
                    title: "Testing YoutTube API NodeJS module"
                  , description: "Test video upload via YouTube API"
                }
                // I don't want to spam my subscribers
              , status: {
                    privacyStatus: "private"
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