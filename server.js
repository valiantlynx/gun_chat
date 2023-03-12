const http = require('http');
const Gun = require('gun');

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Hello, Gun.js!');
});



const gun = Gun({
  web: server.listen(port),
  file: 'data',
});

console.log(`Gun server running on port ${port}`);
