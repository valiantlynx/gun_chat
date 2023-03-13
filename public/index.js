const gun = Gun(['http://localhost:8080/gun']);
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

function addMessage(data) {

  try {
    console.log("data", data);
    const { username, message, time } = data;
    console.log("message", message)
    console.log("username", username)
    console.log("time", time)
    console.log("text", message)


    if (username && message && time) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
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