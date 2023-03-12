const gun = Gun(['http://localhost:3000/gun']);
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
      loginUser(username, password);
    }
  });
}

function loginUser(username, password) {
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
      gun.get('messages').once((data, key) => {
        Object.values(data).forEach((message) => {
          addMessage(message);
        });

        // Scroll to the bottom of the chat
        document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
      });
    } else {
      alert('Incorrect username or password');
    }
  });
}


function logoutUser() {
  currentUser = null;
  gun.user().leave();
  document.getElementById('chat').innerHTML = '';
  document.getElementById('chat-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'flex';
}

function sendMessage(event) {
  event.preventDefault();
  const message = document.getElementById('chat-input').value.trim();
  if (message !== '') {
    const time = new Date().getTime();
    gun.get('messages').set({ username: currentUser, message, time });
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

gun.get('messages').map().on((data, key) => {
  if (data.username && data.message && data.time) {
    const message = document.createElement('div');
    message.classList.add('message');
    if (data.username === currentUser) {
      message.classList.add('own-message');
    }

    const username = document.createElement('span');
    username.classList.add('username');
    username.textContent = data.username;

    const time = document.createElement('span');
    time.classList.add('time');
    time.textContent = new Date(data.time).toLocaleTimeString();

    const text = document.createElement('span');
    text.textContent = data.message;

    message.appendChild(username);
    message.appendChild(time);
    message.appendChild(text);

    document.getElementById('chat').appendChild(message);
    document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
  }
});

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