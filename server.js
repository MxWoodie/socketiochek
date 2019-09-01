const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});

app.use(express.static(path.join(__dirname, 'dist')));

io.on('connection', (socket) => {
  socket.username = socket.id;
  updateUsersList();
  socket.broadcast.emit('user status', { username: socket.username, status: 'connected' });
  socket.on('chat message', (data) => {
    if (data.recipient.id === '/') {
      io.emit('chat message',  { username: socket.username, message: data.message });
      if( data.image ) {
        io.emit('chat image', { username: socket.username, image: data.image });
      }
    } else {
      socket.emit('chat message', { username: `To ${data.recipient.username}`, message: data.message, private: 1 });
      socket.to(data.recipient.id).emit('chat message', { username: `From ${socket.username}`, message: data.message, private: 1 });
      if( data.image ) {
        socket.emit('chat image', { username: `To ${data.recipient.username}`, image: data.image, private: 1 });
        socket.to(data.recipient.id).emit('chat image', { username: `From ${socket.username}`, image: data.image, private: 1 });
      }
    }
  });
  socket.on('set username', (newUsername) => {
    io.emit('set username', { username: socket.username, newUsername: newUsername });
    socket.username = newUsername;
    updateUsersList();
  });
  socket.on('start typing', () => {
    io.emit('start typing', { id: socket.id, username: socket.username });
  });
  socket.on('stop typing', () => {
    io.emit('stop typing', { id: socket.id, username: socket.username });
  });
  socket.on('disconnect', () => {
    io.emit('stop typing', { id: socket.id ,username: socket.username });
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
    userList.push({id: key, username: username});
  }
  io.emit('update list of users', userList);
}
