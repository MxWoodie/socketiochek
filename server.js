const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.username = socket.id;
  socket.emit('set username placeholder', socket.username);
  updateUserList();
  socket.broadcast.emit('chat message', `${socket.username} connected!`);
  socket.on('chat message', (message) => {
    const msg = {
      username: socket.username,
      message: message
    }
    io.emit('chat message',  msg);
  });
  socket.on('set username', (newUsername) => {
    io.emit('set username', `${socket.username} is now ${newUsername}`, newUsername);
    socket.username = newUsername;
    socket.emit('set username placeholder', socket.username);
    updateUserList();
  });
  socket.on('disconnect', () => {
    socket.broadcast.emit('chat message', `${socket.username} disconnected!`);
    updateUserList();
  });
});

http.listen( process.env.PORT || 3000, () => {
  console.log('Listening on port 3000')
});

function updateUserList() {
  const userList = [];
  for(key in io.sockets.connected) {
    const username = io.sockets.connected[key].username;
    userList.push(username);
  }
  io.emit('update list of users', userList);
}