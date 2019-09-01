import $ from 'jquery';
import io from 'socket.io-client';
import './normalize.css';
import './style.css';

$(function () {
  const socket = io();
  const $recipientSelect = $('.recipient-select');
  const $usernameButton = $('.username-button');
  const $usersList = $('.users-list');
  const $messagesForm = $('.messages-form');
  const $messagesInput = $('.messages-input');
  const $messagesImageInput = $('.messages-image-input');
  const $messagesList = $('.messages-list');
  const $modal = $('.modal-section');
  const $modalImage = $('.modal-content');
  const $modalClose = $('.modal-close');

  let image = undefined;
  let typing = false;
  let timeout = undefined;

  $messagesList.on('click', '.messages-item-image', (e) => {
    console.log(e);
    $modal.css('display', 'block');
    $modalImage.attr('src', e.target.src);
  });
  $modalClose.on('click', () => {
    $modal.css('display', 'none');
  });
  $messagesImageInput.change(() => {
    const file = $messagesImageInput.get(0).files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      image = reader.result;
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  });
  $usernameButton.click(() => {
    const username = prompt('Enter username', socket.username ? socket.username : socket.id).trim();
    if (username) {
      socket.emit('set username', username);
    }
  });
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
  socket.on('set username', (msg) => {
    socket.username = msg.newUsername;
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
  socket.on(('chat image'), (msg) => {
    let textClass = '';
    if (msg.private) textClass = 'messages-item-private';
    if (typing) stopTyping();
    if ($(`.typing`).length) {
      $(`.typing`)
        .first()
        .before($(`<li class="messages-item">
          <b>${msg.username}:</b> <img class="messages-item-image" src="${msg.image}" /></li>`)
          .addClass(textClass));
    } else {
      $messagesList.append($(`<li class="messages-item">
        <b>${msg.username}:</b> <img class="messages-item-image" src="${msg.image}" /></li>`)
        .addClass(textClass));
    };
    chatScroll();
  });
  const submitForm = (socketEvent, e) => {
    e.preventDefault();
    switch (socketEvent) {
      // case 'set username':
      //   socket.emit('set username', $usernameInput.val());
      //   $usernameInput.val('');
      //   break;

      case 'chat message':
        socket.emit('chat message', 
        { 
          recipient: {
            id: $recipientSelect.val(),
            username: $('.recipient-option:selected').text()
          },
          message: $messagesInput.val(),
          image: image
        });
        image = undefined;
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