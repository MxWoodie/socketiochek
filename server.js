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
  const usernames = ['Username', 'Poet', 'Plotnik', 'Alexander', 'Paul'];
  let username = usernames[Math.floor(Math.random() * usernames.length)];
  socket.broadcast.emit('chat message', `${username} connected!`);
  socket.on('chat message', (msg) => {
    io.emit('chat message',  `${username}: ${msg}`);
  });
  socket.on('set username', (newUsername) => {
    io.emit('set username', `${username} is now ${newUsername}`);
    username = newUsername;
  });
  socket.on('disconnect', () => {
    socket.broadcast.emit('chat message', `${username} disconnected!`);
  });
});

http.listen( process.env.PORT || 3000, () => {
  console.log('Listening on port 3000')
})