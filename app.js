const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const log = require('debug')('vasco-frontend');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

app.use(express.static('client'));

io.on('connection', function(socket){
  log('a user connected');
  socket.on('disconnect', function(){
    log('user disconnected');
  });
});

http.listen(process.env.PORT || 3000, function(){
  log('listening on *:' + this.address().port);
});
