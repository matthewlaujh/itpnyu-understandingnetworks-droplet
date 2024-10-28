var express = require('express');         
var server = express();                   
var bodyParser = require('body-parser');  
var proxyLocation = '/';            

var config = require('./config');
server.use(express.static('public'));

server.get('/config', (req, res) => {
    res.json(config);
});

function serverStart() {
  var port = this.address().port;
  console.log('Server listening on port ' + port);
}

function handleGet(request, response) {
  response.send("hello, you sent me a GET request");
  response.end();
}

function handlePost(request, response) {
  console.log('Got a POST request');
  response.send("hello, you sent me a POST request");
  response.end();
}

function handleDate(request, response) {
  console.log('You sent a GET request for the date');
  var now = new Date();
  response.send("Date: " + now + "\n");
  response.end();
}

server.listen(8080, serverStart);
server.get(proxyLocation, handleGet);    
server.get(proxyLocation + '/data', handleGet);    
server.get(proxyLocation + '/date', handleDate);   
server.post(proxyLocation + '/data', handlePost);
