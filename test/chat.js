const gun = Gun(['http://localhost:3000/gun']);

const messages = gun.get('messages');
const messageBox = document.getElementById('messages');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');
document.getElementById('send').onclick = () => {
  const username = usernameInput.value;
  const message = messageInput.value;
  messages.set({username, message, when: Gun.state()});
  messageInput.value = '';
};

messages.map().on((message, id) => {
  const div = document.createElement('div');
  div.innerHTML = `${message.username}: ${message.message}`;
  messageBox.appendChild(div);
});
