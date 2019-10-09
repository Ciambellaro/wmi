// Dependencies
const Youtube = require("youtube-api"),
    fs = require('fs'),
    readJson = require("r-json"),
    Lien = require("lien"),
    Logger = require("bug-killer"),
    opn = require("opn"),
    prettyBytes = require("pretty-bytes");

var express = require('express');
var app = express();
var url = require('url');
var bodyparser = require('body-parser');
var oauth;
var auth;
var access = 0;


// Init lien app
var app = new Lien({
    host: "localhost",
    port: 8443,
    public: __dirname + "/public",
    ssl: {
        key: "privkey.pem",
        cert: "pubcert.pem"
    }
});


// I downloaded the file from OAuth2 -> Download JSON
const CREDENTIALS = readJson(`${__dirname}/credentials.json`);

/*app.get('/', function (req, res) {
  res.sendfile('login.html'); 
});

app.get('/map', function (req, res) {
  res.sendfile('index.html'); 
});*/

// Listen for load
app.on("load", function(err) {
    console.log(err || "server started on port 8443.");
    err && process.exit(1);
});

// Add page
//app.get("/", `${__dirname}/login.html`);
app.get('/', lien => {
    access = 0;
    lien.file(`${__dirname}/login.html`);
});

//app.get("/map", `${__dirname}/index.html`);

app.get('/map', lien => {
        lien.file(`${__dirname}/index.html`);
});

app.post('/auth', lien => {
        access += 1;
        oauth = Youtube.authenticate({
            type: "oauth",
            client_id: CREDENTIALS.web.client_id,
            client_secret: CREDENTIALS.web.client_secret,
            redirect_url: CREDENTIALS.web.redirect_uris[0]
        });

        auth = oauth.generateAuthUrl({
            access_type: "offline",
            scope: ["https://www.googleapis.com/auth/youtube.upload"]
        });

        console.log(lien.req.body.titoloClip);
        console.log(lien.req.body.selectpickercat);
        console.log(lien.req.body.selectpickeraud);
        console.log(lien.req.body.coordin);
        opn(auth);
        lien.redirect('/map');
});

// Handle oauth2 callback
app.get("/oauth2callback", lien => {

    Logger.log("Trying to get the token using the following code: " + lien.query.code);
    oauth.getToken(lien.query.code, (err, tokens) => {

        if (err) {
            lien.lien(err, 400);
            return Logger.log(err);
        }

        Logger.log("Got the tokens.");

        oauth.setCredentials(tokens);

        //lien.end("The video is being uploaded. Check out the logs in the terminal.");

        var req = Youtube.videos.insert({
            resource: {
                // Video title and description
                snippet: {
                    title: "Prova pubblico",
                    description: "Test video upload via YouTube API"
                }
                // I don't want to spam my subscribers
                ,
                status: {
                    privacyStatus: "public"
                }
            }
            // This is for the callback function
            ,
            part: "snippet,status"

                // Create the readable stream to upload the video
                ,
            media: {
                body: fs.createReadStream("video.mp4")
            }
        }, (err, data) => {
            console.log("Done.");
            lien.end("Video caricato correttamente, ora puoi chiudere questa pagina :)");
        });
    });
});

// Listen for server errors
app.on("serverError", err => {
    console.log(err.stack);
});