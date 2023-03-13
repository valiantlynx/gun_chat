
const Gun = require('gun');
const gun = Gun({peers: ['http://localhost:8081/gun']});

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(message) {
    console.log('received:', message);
  });
  var count = 0;
  setInterval(function(){
    count += 1;
    ws.send('hello world ' + count);
  }, 1000);

});

console.log("Server running on port 8080");



