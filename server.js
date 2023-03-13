const express = require("express");
const bodyParser = require("body-parser");
const http = require('http');
const Gun = require('gun');
const cors = require('cors');


const app = express();
app.use(cors());

app.set('view engine', "ejs");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const server = http.createServer(app);

const gun = Gun({ web: server });

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/gun', function(req, res) {
  res.send(__dirname + '/index.js');
});





const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
