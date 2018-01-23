const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const db = require('redis').createClient(process.env.VASCO_URL);

db.on('error', err => { throw err; });
db.monitor();
db.on('monitor', (...args) => io.emit('monitor', ...args));

app.get('/ping', (req, res) => res.send('pong'));
app.get('/data', (req, res) =>
  db.keys('*', (err, keys) => {
    if (err) { throw err; }
    const services = {};
    res.json(keys);
  })
);

app.get('/', (req, res) => res.sendFile(__dirname + '/build/index.html'));
app.use(express.static('client'));

http.listen(process.env.PORT || 3000);
console.log('started');
