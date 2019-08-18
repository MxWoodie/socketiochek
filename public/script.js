$(function () {
  var socket = io();
  $('.username-form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('set username', $('#u').val());
    $('#u').val('');
    return false;
  });
  socket.on('set username', function(msg){
    $('#messages').append($('<li class="messages-item">').text(msg));
    $('#messages').animate({scrollTop: $('#messages').prop("scrollHeight")}, 300);
  });
  $('.messages-form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('chat message', function(msg){
    $('#messages').append($('<li class="messages-item">').text(msg));
    $('#messages').animate({scrollTop: $('#messages').prop("scrollHeight")}, 300);
  });
});