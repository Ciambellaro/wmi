// WEB SERVER ***(SFRUTTA NODE E EXPRESS)***
const express = require('express');
const app = express();

app.listen(4444, function(){
    console.log("Il server è in ascolto sulla porta 4444");
})

app.use(express.static('public')); 

//********************* */ GET / (root - contiene la mappa OSM/Leaflet quindi index.html) *************************
app.get('/', function (req, res) {
    res.sendfile('index.html'); // utilizza il file index.html come template della visivo della pagina
});