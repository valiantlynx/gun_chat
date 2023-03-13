const Gun = require('gun');
const WebSocket = require('ws');


const gun = Gun({peers: ['http://localhost:8080/gun', 'https://prat.minfuel.com/gun']});

const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', function connection(ws) {
  const gunNode = gun.get('messages');
  
  // send the current state of messages to the client
  gunNode.map().on((data, key) => {
    ws.send(JSON.stringify({action: 'add', data}));
  });

  // listen for messages from the client and add them to Gun
  ws.on('message', function incoming(message) {
    const {action, data} = JSON.parse(message);
    if (action === 'add') {
      gunNode.set(data);
    } else if (action === 'delete') {
      gunNode.get(data).put(null);
    }
  });
});
