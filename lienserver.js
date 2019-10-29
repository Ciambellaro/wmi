// Dependencies
const Youtube = require("youtube-api")
    fs = require('fs'),
    readJson = require("r-json"),
    Lien = require("lien"),
    Logger = require("bug-killer"),
    opn = require("opn"),
    prettyBytes = require("pretty-bytes");

const mongo = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

var cookie = require('cookie');
var express = require('express');
var app = express();
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + "/public/uploads");
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, "video.mp4");
    }
});
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

// Listen for load
app.on("load", function (err) {
    console.log(err || "server started on port 8443.");
    err && process.exit(1);
});

app.get('/', lien => {
    access = 0;
    lien.file(`${__dirname}/login.html`);
});


//per leggere il file json del login
app.get('/log.json', lien => {
    lien.file(`${__dirname}/log.json`);
});



app.post('/login', lien => {
    // gestione form accedi
    var usernameLogin = "";
    var passwordLogin = "";
    usernameLogin = lien.req.body.userLogin;
    passwordLogin = lien.req.body.pwdLogin;

    mongo.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("registrazioni");

        console.log("LOGIN: " + usernameLogin + " " + passwordLogin);
        var queryLogin = { username: usernameLogin };
        dbo.collection("registrazioni").find(queryLogin).toArray(function (err, result) {
            if (err) throw err;
            if (result == "") {
                console.log("USERNAME ERRATO");
                lien.redirect("/");
            } else if (passwordLogin == result[0].password) {
                //scrive su un file json chi sta accedendo
                let obj = { 
                    username: result[0].username,
                    password: result[0].password, 
                    tipologia: result[0].tipologia
                };
                let data = JSON.stringify(obj);
                fs.writeFile('log.json', data, (err) => {
                    if (err) throw err;
                });

                lien.redirect("/map");
            } else {
                console.log("PASSWORD ERRATA");
                lien.redirect("/");
            }
            db.close();
        });
    });
});

app.get('/registrazione', lien => {
    lien.file(`${__dirname}/registrazione.html`);
});

app.post('/registrazione', lien => {
    // gestione form registrati
    var usern = "";
    var pwd = "";
    var pwdConf = "";
    var tipo = "";
    var esisteGia = false;
    usern = lien.req.body.user;
    pwd = lien.req.body.pass;
    pwdConf = lien.req.body.passConf;
    tipo = lien.req.body.tipologia;
    console.log("**** USERNAME: " + usern + ", PASSWORD: " + pwd + ", CONFERMA: " + pwdConf + ", TIPOLOGIA: " + tipo + " ****");

    mongo.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("registrazioni");
        
        /*dbo.collection("registrazioni").find({}).toArray(function (err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
        });*/

        var control = { username: usern };
        dbo.collection("registrazioni").find(control).toArray(function (err, result) { // cerca nel db utenti con username inserito
            if (err) throw err;
            if (result.length > 0) esisteGia = true;  //esiste già un utente con quel username?
            if (esisteGia == false) {  //se non esiste
                if (pwd == pwdConf) {  //conferma pwd va bene?
                    var myobj = { username: usern, password: pwd, tipologia: tipo };
                    dbo.collection("registrazioni").insertOne(myobj, function (err, res) {  //aggiungilo
                        if (err) throw err;
                        console.log("UTENTE INSERITO[ Username: " + myobj.username + ", Password: " + myobj.password + ", Tipologia: " + myobj.tipologia + " ]");
                        db.close();
                        lien.redirect("/");
                    });
                } else {
                    console.log("Errore nel confermare la password");
                }
            } else {
                console.log(" ########### UTENTE GIA' ESISTENTE! ##############");
            }
            db.close();
        });
    });
});

app.get('/map', lien => {
    lien.file(`${__dirname}/index.html`);
});

var titolo = "";
var coordinate = "";
var scopo = "";
var categoria = "";
var audience = "";
var dettaglio = "";
var lingua = "";

app.post('/auth', lien => {
    var upload = multer({
        storage: storage
    }).single('userVideo');
    upload(lien.req, lien.res, function (err) {
        //lien.res.end('File is uploaded')
        console.log("File is uploaded");
        titolo = lien.req.body.titoloClip;
        coordinate = lien.req.body.coordin;
        scopo = lien.req.body.optionsRadios;
        lingua = lien.req.body.lan;
        categoria = lien.req.body.cat;
        dettaglio = lien.req.body.det;
        audience = lien.req.body.aud;

        video = lien.req.body.userVideo;

        console.log("*******************" + titolo + " " + coordinate + " " + scopo + " " + lingua + " " + categoria + " " + dettaglio + " " + audience + " " + video);
    });

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
                    description: coordinate + ":" + scopo + ":" + lingua + ":" + categoria + ":" + dettaglio + ":" + audience
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
                body: fs.createReadStream(__dirname + "/public/uploads/video.mp4")
            }
        }, (err, data) => {
            console.log("Done.");
            //process.exit();
        });
    });
});

// Listen for server errors
app.on("serverError", err => {
    console.log(err.stack);

});