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
    $('#messages').append($('<li class="messages-item">').text(msg));
    $('#messages').animate({scrollTop: $('#messages').prop("scrollHeight")}, 300);
  });
  $('.messages-form').submit((e) => {
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('chat message', (msg) => {
    $('#messages').append($('<li class="messages-item">').text(msg));
    $('#messages').animate({scrollTop: $('#messages').prop("scrollHeight")}, 300);
  });
});