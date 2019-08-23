$(function () {
  const socket = io();
  const $usernameForm = $('.username-form');
  const $usernameInput = $('.username-input');
  const $usersList = $('.users-list');
  const $messagesForm = $('.messages-form');
  const $messagesInput = $('.messages-input');
  const $messagesList = $('.messages-list');

  let typing = false;
  let timeout = undefined;
  
  /*
  Нажимаем кнопку
  Отправляется ивент
  Добавляется тайпинг
  Запускается таймер обновляемый после каждого тайпа
  По прошествию таймера или отправке сообщения убираем тайпинг
  */

  $messagesInput.keydown(() => {
    if (typing === false) {
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
    users.forEach(user => {
      $usersList.append($('<li class="users-item">').text(user));
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
    if (typing) stopTyping();
    if ($(`.typing`).length) {
      $(`.typing`)
        .first()
        .before($(`<li class="messages-item"><b>${msg.username}:</b> ${msg.message}</li>`));
    } else {
      $messagesList.append($(`<li class="messages-item"><b>${msg.username}:</b> ${msg.message}</li>`));
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
        socket.emit('chat message', $messagesInput.val());
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