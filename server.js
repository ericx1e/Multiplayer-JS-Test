
var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static('public'));

console.log("My socket server is running");

var io = require('socket.io').listen(server);

// var io = socket(server);

io.sockets.on('connection', newConnection);

function newConnection(socket) {
  console.log('new connection ' + socket.id);

  socket.on('player', playerMsg);
  socket.on('bullet', bulletMsg);

  function playerMsg(data) {
    io.sockets.emit('background');
    socket.broadcast.emit('player', data);
    // io.sockets.emit('player', data); //also sends to client that sent
    // console.log(data);
  }

  function bulletMsg(data) {
    socket.broadcast.emit('bullet', data);
  }

  socket.on('disconnect', disconnected);
  function disconnected() {
    console.log(socket.id + ' disconnected');
  }
}
