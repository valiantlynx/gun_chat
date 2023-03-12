const express = require("express");
const bodyParser = require("body-parser");
const http = require('http');
const Gun = require('gun');

const app = express();

app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const gun = Gun({ web: server });

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

const cors = require('cors');
app.use(cors());

app.delete('/messages/:id', (req, res) => {
  const id = req.params.id;
  gun.get('messages').get(id).once((data, key) => {
    if (data) {
      gun.get('messages').get(id).put(null);
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  });
});


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



