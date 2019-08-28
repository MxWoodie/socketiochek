$(function () {
  const socket = io();
  const $usernameForm = $('.username-form');
  const $usernameInput = $('.username-input');
  const $recipientSelect = $('.recipient-select');
  const $usersList = $('.users-list');
  const $messagesForm = $('.messages-form');
  const $messagesInput = $('.messages-input');
  const $messagesList = $('.messages-list');

  let typing = false;
  let timeout = undefined;

  $messagesInput.keydown(() => {
    if (typing === false && $recipientSelect.val() === '/') {
      typing = true;
      socket.emit('start typing');
      timeout = setTimeout(stopTyping, 5000);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(stopTyping, 5000);
    }
  });
  socket.on('start typing', (user) => {
    $messagesList
      .append($(`<li class="messages-item typing ${user.id}">`)
        .append(`<i>${user.username} is typing a message...</i>`));
    chatScroll();
  });
  const stopTyping = () => {
    typing = false;
    socket.emit('stop typing');
  };
  socket.on('stop typing', (user) => {
    $(`.typing.${user.id}`).remove();
  });
  socket.on('set username placeholder', (username) => {
    $usernameInput.attr('placeholder', username);
  });
  socket.on('update list of users', (users) => {
    $usersList.empty();
    $recipientSelect.empty();
    $recipientSelect.append($(`<option class="recipient-option" value="/">`).text('General chat'));
    users.forEach(user => {
      $usersList.append($('<li class="users-item">').text(user.username));
      if (user.id === socket.id){
        return;
      } else {
        $recipientSelect.append($(`<option class="recipient-option" value="${user.id}">`).text(user.username));
      }
    });
  });
  $usernameForm.submit((e) => {
    submitForm('set username', e);
    return false;
  });
  socket.on('set username', (msg) => {
    if ($(`.typing`).length) {
      $(`.typing`)
        .first()
        .before($('<li class="messages-item">')
          .append(`<b>'${msg.username}' is now '${msg.newUsername}'</b>`));
    } else {
      $messagesList
        .append($('<li class="messages-item">')
          .append(`<b>'${msg.username}' is now '${msg.newUsername}'</b>`));
    };
    chatScroll();
  });
  $messagesForm.submit((e) => {
    submitForm('chat message', e);
    return false;
  });
  socket.on('chat message', (msg) => {
    let textClass = '';
    if (msg.private) textClass = 'messages-item-private';
    if (typing) stopTyping();
    if ($(`.typing`).length) {
      $(`.typing`)
        .first()
        .before($(`<li class="messages-item"><b>${msg.username}:</b> ${msg.message}</li>`).addClass(textClass));
    } else {
      $messagesList.append($(`<li class="messages-item"><b>${msg.username}:</b> ${msg.message}</li>`).addClass(textClass));
    };
    chatScroll();
  });
  socket.on(('user status'), (msg) => {
    if ($(`.typing`).length) {
      $(`.typing`)
        .first()
        .before($('<li class="messages-item">').append(`<b>${msg.username} ${msg.status}!</b>`));
    } else {
      $messagesList.append($('<li class="messages-item">').append(`<b>${msg.username} ${msg.status}!</b>`));
    };
    chatScroll();
  });
  const submitForm = (socketEvent, e) => {
    e.preventDefault();
    switch (socketEvent) {
      case 'set username':
        socket.emit('set username', $usernameInput.val());
        $usernameInput.val('');
        break;

      case 'chat message':
        console.log($('.recipient-option:selected').text());
        socket.emit('chat message', 
        { 
          recipient: {
            id: $recipientSelect.val(),
            username: $('.recipient-option:selected').text()
          },
          message: $messagesInput.val() 
        });
        $messagesInput.val('');
        break;

      default:
        throw new Error('Submit error');
    };
  };
  const chatScroll = () => {
    $messagesList.animate({scrollTop: $messagesList.prop("scrollHeight")}, 300);
  };
});