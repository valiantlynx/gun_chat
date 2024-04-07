const express = require('express');
const Gun = require('gun');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Integrate Gun with Express
const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
const gun = Gun({ web: server });

// Use Gun middleware
app.use(Gun.serve);

console.log('Server started with GunDB');
