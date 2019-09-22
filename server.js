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