const express = require("express");
const bodyParser = require("body-parser");
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const server = http.createServer(app);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/company', function(req, res) {
  res.sendFile(__dirname + '/company.html');
});

//etc

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
