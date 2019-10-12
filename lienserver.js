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
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null,  __dirname + "/public/uploads");
     },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null , "video.mp4");
    }
});
const bodyParser = require('body-parser');
var url = require('url');
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

//app.use(bodyParser.json());       
//app.use(bodyParser.urlencoded({ extended: false})); 

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

var titolo = "";
var coordinate = "";
var scopo = "";
var categoria = "";
var audience = "";
var video;

app.post('/auth', lien => {
        var upload = multer({
            storage: storage
        }).single('userVideo');
        upload(lien.req, lien.res, function(err) {
            //lien.res.end('File is uploaded')
            console.log("File is uploaded");
            titolo = lien.req.body.titoloClip;
            coordinate = lien.req.body.coordin;
            scopo = lien.req.body.optionsRadios;
            categoria = lien.req.body.cat;
            audience = lien.req.body.aud;
            video = lien.req.body.userVideo;

            console.log("######## " + coordinate);
        });

        //console.log("########: " + titolo + " " + coordinate + " " + scopo + " " + categoria + " " + audience + " video: " + video + " ################# ");

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

        console.log(auth);
        console.log(oauth);
        opn(auth);

       
        lien.redirect("/map");
});

// Handle oauth2 callback
app.get("/oauth2callback", lien => {

    console.log("*******************" + titolo + " " + scopo + " " + coordinate + " " + categoria + " " + audience + " " + video);

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
                    title: titolo,
                    description: "Metadati del video:  Coordinate location: " + coordinate +
                                 "Scopo clip: " + scopo  + "Categoria: " + categoria + 
                                 "Audience clip: " + audience + "."
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
                body: fs.createReadStream( __dirname + "/public/uploads/video.mp4")
            }
        }, (err, data) => {
            console.log("Done.");
            //process.exit();
        });

        /*setInterval(function() {
            Logger.log(`${prettyBytes(req.req.connection._bytesDispatched)} bytes uploaded.`);
        }, 250);*/

        
    });

    

});

// Listen for server errors
app.on("serverError", err => {
    console.log(err.stack);
});