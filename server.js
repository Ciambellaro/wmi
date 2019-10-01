
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
httpsServer.listen(8443, function(){
  console.log("Server in ascolto sulla porta 8443");
});

