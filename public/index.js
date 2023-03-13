const gun = Gun({peers: ['http://localhost:8081/gun', 'https://prat.minfuel.com/gun']});
const ws = new WebSocket('ws://localhost:8081/gun');
let currentUser = null;
let chatNode = null;

function registerUser(event) {
  event.preventDefault();
  const username = document.getElementById('username-input').value.trim();
  const password = document.getElementById('password-input').value.trim();

  if (username === '' || password === '') {
    alert('Please enter a username and password');
    return;
  }

  gun.get('users').get(username).put({ username, password }, (ack) => {
    if (ack.err) {
      alert('Username already exists');
    } else {
      const user = gun.user();
      user.create(username, password, (ack) => {
        if (ack.err) {
          console.error('Failed to create user:', ack.err);
        } else {
          loginUser(username, password);
          console.log('User created successfully!');
        }
      });
    }
  });
}


function loginUser(username, password) {
  const user = gun.user();
  user.auth(username, password, (ack) => {
    if (ack.err) {
      console.log("login username:", username, "login pass:", password)
      console.log('Login failed:', ack.err);
    } else {
      console.log('User authenticated');
      gun.get('users').get(username).once((data, key) => {
        if (data && data.password === password) {
          currentUser = username;
          document.getElementById('login-form').style.display = 'none';
          document.getElementById('chat-form').style.display = 'flex';
          document.getElementById('chat-input').focus();

          // Cache the logged-in user
          localStorage.setItem('currentUser', currentUser);
          localStorage.setItem('currentPassword', password);

          // Load chat history
          gun.get('messages').map().once((data, key) => {
            addMessage(data);
            // Scroll to the bottom of the chat
            document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
          });
        } else {
          alert('Incorrect username or password');
        }
      });
    }

  });
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentPassword');
  gun.user().leave();
  document.getElementById('chat').innerHTML = '';
  document.getElementById('chat-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'flex';
  document.getElementById('username-input').value = '';
  document.getElementById('password-input').value = '';
  document.getElementById('username-input').focus();
}

function sendMessage(event) {
  event.preventDefault();
  const message = document.getElementById('chat-input').value.trim();
  if (message !== '') {
    const time = new Date().getTime();
    const id = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36)
    console.log("big ass id", id)
    const data = { username: currentUser, message, time, id };
    const messageString = JSON.stringify({ action: 'add', data });
    ws.send(messageString);
    gun.get('messages').set(data);
    document.getElementById('chat-input').value = '';
  }
}

gun.on('auth', () => {
  const user = gun.user();
  if (user.is) {
    currentUser = user.is.alias;
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('chat-form').style.display = 'flex';
    document.getElementById('chat-input').focus();
  }
});

function addMessage(data) {
  try {
    console.log("data", data);
    const { username, message, time, id } = data;
    console.log("message", message)
    console.log("username", username)
    console.log("time", time)
    console.log("text", message)
    console.log("id", id)


    if (username && message && time) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
      messageElement.setAttribute('id', id); // Add id attribute
      if (username === currentUser) {
        messageElement.classList.add('own-message');
      }

      const usernameElement = document.createElement('span');
      usernameElement.classList.add('username');
      usernameElement.textContent = username;

      const timeElement = document.createElement('span');
      timeElement.classList.add('time');
      timeElement.textContent = new Date(time).toLocaleTimeString();

      const textElement = document.createElement('span');
      textElement.textContent = message;

      const deleteButton = document.createElement('button');
      deleteButton.classList.add('delete-button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => deleteMessage(id, username));

      messageElement.appendChild(deleteButton);
      messageElement.appendChild(usernameElement);
      messageElement.appendChild(timeElement);
      messageElement.appendChild(textElement);

      document.getElementById('chat').appendChild(messageElement);
      document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
    }
  } catch (error) {
    console.log("error", error)
  }

}

function removeMessage(key) {
  try {
    console.log("key", key);
    const messageElement = document.getElementById(key);
    if (messageElement) {
      console.log(" to be removed messageElem", messageElement)
      messageElement.remove();
    }
  } catch (error) {
    console.log("error removing message", error)
  }

}

function deleteMessage(id, username) {
  //console.log("id", id)
  //console.log("username", username)

  if (username === currentUser) {

    gun.get('messages').map().once((data, key) => {
      if (data && data.id === id) {
        //console.log("loop data", data)
        //console.log("loop key", key)
        gun.get('messages').get(key).put(null, ack => {
          if (ack.err) {
            console.log("Error deleting message", ack.err);
          } else {
            const confirmed = confirm('Are you sure you want to delete this message?');
            if (confirmed) {
              const messageString = JSON.stringify({ action: 'delete', data: id });
              ws.send(messageString);
            }
            console.log(ack);
            console.log("Message deleted successfully");
            removeMessage(id);
          }
          //console.log(ack);
        });

      } else {
        console.log("Message not found in database");
      }

      // Scroll to the bottom of the chat
      document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
    });
  } else {
    alert('You can only delete your own messages');
  }
}

function deleteAllMessages() {
  // Assuming the data is stored under the path 'data'
  // and each relay is stored under the path 'relays/relay1', 'relays/relay2', etc.

  // const gun = Gun();

  // // Get all the relays
  // gun.get('relays').map().on(function (relayData, relayId) {
  //   // Get the data from each relay
  //   gun.get('relays').get(relayId).get('data').once(function (data) {
  //     // Delete the data from the relay
  //     gun.get('relays').get(relayId).put({ data: null });
  //   });
  // });

  // // Alternatively, if you just want to delete the data from the current relay
  // // you can use the following code:
  // gun.get('data').put(null);




  if (confirm('Are you sure you want to delete all messages? This action cannot be undone.')) {
    gun.get('messages').map().once((data, key) => {
      gun.get('messages').get(key).put(null, ack => {

        if (ack.err) {
          console.error('Error deleting messages', ack.err);
          alert('Error deleting messages');
        } else {
          console.log(ack);
          console.log("Message deleted successfully");
          window.location.reload();

        }
        //console.log(ack);
      });
    });


  }
}

document.getElementById('register-button').addEventListener('click', registerUser);
document.getElementById('login-button').addEventListener('click', (event) => {
  event.preventDefault();
  const username = document.getElementById('username-input').value.trim();
  const password = document.getElementById('password-input').value.trim();

  if (username === '' || password === '') {
    alert('Please enter a username and password');
    return;
  }

  loginUser(username, password);
});
document.getElementById('logout-button').addEventListener('click', logoutUser);
document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('chat-input').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessage(event);
  }
});

// Check for cached user
const cachedUser = localStorage.getItem('currentUser');
const cachedPassword = localStorage.getItem('currentPassword');
if (cachedUser && cachedPassword) {
  loginUser(cachedUser, cachedPassword);
}