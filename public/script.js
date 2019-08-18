$(function () {
  var socket = io();
  $('form').submit(function(e){
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