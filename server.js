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
 
    https.createServer(options, router.handleRequest).listen(8000);
