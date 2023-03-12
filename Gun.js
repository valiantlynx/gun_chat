const Gun = require('gun');

const relay = Gun({
    web: require('http').createServer().listen(8080),
    peers: ['https://valiantlynx-crispy-bassoon-946qwr67rwxcpvxp-8765.preview.app.github.dev:8765/gun']
  });
  
  const gun = Gun({
    web: server.listen(port),
    file: 'data',
    peers: [relay]
  });
  