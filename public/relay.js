; (function () {
  var cluster = require('cluster');
  if (cluster.isMaster) {
    return cluster.fork() && cluster.on('exit', function () { cluster.fork(); require('./crashed'); });
  }

  var fs = require('fs');
  var config = {
    port: process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8081,
    peers: process.env.PEERS && process.env.PEERS.split(',') || ['http://localhost:8765/gun']
  };

  var Gun = require('gun')

  if (process.env.HTTPS_KEY) {
    config.key = fs.readFileSync(process.env.HTTPS_KEY);
    config.cert = fs.readFileSync(process.env.HTTPS_CERT);
    config.server = require('https').createServer(config, Gun.serve(__dirname));
  } else {
    config.server = require('http').createServer(Gun.serve(__dirname));
  }

  var gun = Gun({ web: config.server.listen(config.port), peers: config.peers });

  const gunNode = gun.get('messages');
  let syncing = false; // flag to prevent syncing the data back to peers
  gunNode.map().on(async (data, key) => {
    if (!data) {
      return;
    } else {
      // sync data to other peers
      if (!syncing) {
        syncing = true;
        console.log('Syncing data to other peers:', data);
        //sync data to other peers
        console.log('syncing data to other peers');
        console.log("data", gun.get('users'));

        // put data into the graph
        //gun.get("messages").put(null); // store the data in the relay's own instance of Gun
        
        syncing = false;
      }
    }
  });

  console.log('Relay peer started on port ' + config.port + ' with /gun');
  module.exports = gun;
}());
