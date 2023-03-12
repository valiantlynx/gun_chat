const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.set('view engine', "ejs");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
  });

  
app.listen(3000, function(req, res) {
    console.log("Server is running successfully");
});


