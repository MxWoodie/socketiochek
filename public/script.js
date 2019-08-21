$(function () {
  var socket = io();
  socket.on('set username placeholder', (username) => {
    document.querySelector('.username-input').placeholder = username;
  });
  socket.on('update list of users', (users) => {
    $('.users-list').empty();
    users.forEach(user => {
      $('.users-list').append($('<li class="users-item">').text(user));
    });
  });
  $('.username-form').submit((e) => {
    e.preventDefault(); // prevents page reloading
    socket.emit('set username', $('.username-input').val());
    $('.username-input').val('');
    return false;
  });
  socket.on('set username', (msg) => {
    $('.messages-list').append($('<li class="messages-item">').text(msg));
    chatScroll();
  });
  $('.messages-form').submit((e) => {
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('.messages-input').val());
    $('.messages-input').val('');
    return false;
  });
  socket.on('chat message', (msg) => {
    $('.messages-list').append($(`<li class="messages-item"><b>${msg.username}:</b> ${msg.message}</li>`));
    chatScroll();
  });
  socket.on(('user status'), (msg) => {
    $('.messages-list').append($('<li class="messages-item">').append(msg));
    chatScroll();
  });
  const chatScroll = () => {
    $('.messages-list').animate({scrollTop: $('.messages-list').prop("scrollHeight")}, 300);
  }
});