const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.username = socket.id;
  socket.emit('set username placeholder', socket.username);
  updateUsersList();
  socket.broadcast.emit('user status', { username: socket.username, status: 'connected' });
  socket.on('chat message', (message) => {
    io.emit('chat message',  { username: socket.username, message: message });
  });
  socket.on('set username', (newUsername) => {
    io.emit('set username', { username: socket.username, newUsername: newUsername });
    socket.username = newUsername;
    socket.emit('set username placeholder', socket.username);
    updateUsersList();
  });
  socket.on('start typing', () => {
    io.emit('start typing', { id: socket.id ,username: socket.username });
  });
  socket.on('stop typing', () => {
    io.emit('stop typing', { id: socket.id, username: socket.username });
  });
  socket.on('disconnect', () => {
    socket.broadcast.emit('user status', { id: socket.id, username: socket.username, status: 'disconnected' });
    updateUsersList();
  });
});

http.listen( port, () => {
  console.log(`Listening on port ${port}`)
});

function updateUsersList() {
  const userList = [];
  for(key in io.sockets.connected) {
    const username = io.sockets.connected[key].username;
    userList.push(username);
  }
  io.emit('update list of users', userList);
}