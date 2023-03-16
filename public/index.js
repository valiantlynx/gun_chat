const gun = Gun(
  //{ peers: ['http://localhost:8765/gun']}
  { peers: ['https://chat.valiantlynx.com/gun'] }
);

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
      alert(ack.err);
    } else {
      const user = gun.user();
      user.create(username, password, (ack) => {
        if (ack.err) {
          alert(ack.err);
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
      alert('Something went wrong. Please try again. are you sure you have an account?');
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
            // Scroll to the searchTermtom of the chat
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
  const imageInput = document.getElementById('image-input');
  const images = imageInput.files;

  if (message === '' && images.length === 0) {
    return;
  }

  // Add this line to the sendMessage function
  processMessage(message); // Process the user's message and respond if necessary


  const time = new Date().getTime();
  const id = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36)

  const data = { username: currentUser, message, time, id };
  const messageString = JSON.stringify({ action: 'add', data });

  if (images.length > 0) {
    const reader = new FileReader();
    reader.onload = function () {
      const imageString = reader.result.split(',')[1];
      data.image = imageString;
      gun.get('messages').set(data);
    };
    reader.readAsDataURL(images[0]);
  } else {
    gun.get('messages').set(data);
  }

  document.getElementById('chat-input').value = '';
  imageInput.value = '';
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
    const { username, message, time, id, image } = data;

    if (username && (message || image) && time) {
      const messageElement = document.createElement('div');
      const contentElement = document.createElement('div');
      messageElement.classList.add('message');
      contentElement.classList.add('content-message');
      contentElement.setAttribute('id', id); // Add id attribute
      if (username === currentUser || username === 'bot') {
        contentElement.classList.add('own-message');
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteMessage(id, username));

        contentElement.appendChild(deleteButton);
      }

      const usernameElement = document.createElement('span');
      usernameElement.classList.add('username');
      usernameElement.textContent = username;

      const timeElement = document.createElement('span');
      timeElement.classList.add('time');
      timeElement.textContent = new Date(time).toLocaleTimeString();

      const textElement = document.createElement('span');
      textElement.classList.add('text');
      textElement.textContent = message;

      const imageElement = document.createElement('img');
      imageElement.classList.add('image');
      imageElement.src = `data:image/png;base64,${image}`;

      const profileImageElement = document.createElement('img');
      profileImageElement.classList.add('profile-image');
      profileImageElement.src = `https://avatars.dicebear.com/api/human/${username}.svg`;

      messageElement.appendChild(profileImageElement);
      messageElement.appendChild(usernameElement);
      messageElement.appendChild(timeElement);

      messageElement.appendChild(contentElement);
      if (message) {
        contentElement.appendChild(textElement);
      }
      if (image) {
        contentElement.appendChild(imageElement);
      }
      // Add this line to the addMessage function
      if (username !== 'searchTerm') processMessage(message); // Process the incoming message and respond if necessary

      document.getElementById('chat').appendChild(messageElement);
      document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
    }
  } catch (error) {
    return;
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

  if (username === currentUser || username === 'bot') {

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

            }
            console.log(ack);
            console.log("Message deleted successfully");
            removeMessage(id);
          }
          //console.log(ack);
        });

      } else {
        return;
        console.log("Message already deleted");
      }

      // Scroll to the searchTermtom of the chat
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

function processMessage(message) {
  if (message.includes('@help')) {
    console.log('help');
    addsearchTermMessage('I can help with that! Here are some commands you can try:`\n-` @weather [city]: Get the current weather for a city\n- @news: Get the latest news headlines\n- @wiki [search term]: Search Wikipedia for an article');
  } else if (message.includes('@weather')) {
    weather(message);
  } else if (message.includes(`@news`)) {
    newsapi(message);
  } else if (message.includes('@wiki')) {
    wikipedia(message);
  }
  else if (message.includes('@ai')) {
    ai(message);
  }
}

function wikipedia(message) {
  const searchTerm = message.split('@wiki ')[1];
  console.log(searchTerm);
  fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchTerm}&utf8=&format=json&origin=*`)
    .then(response => response.json())
    .then(data => {
      const pages = data.query.search;
      //console.log(pages);
      const pageTitles = pages.map(page => page.title);
      //console.log(pageTitles);
      addsearchTermMessage(`Here are some Wikipedia articles that match your search:\n${pageTitles.join('\n')}`);
    })
    .catch(() => {
      addsearchTermMessage(`Sorry, I couldnt find any Wikipedia articles for ${searchTerm}.`);
    });
}

function newsapi(message) {
  const emne = message.split('@news ')[1];
  console.log(emne);
  fetch(`https://newsapi.org/v2/top-headlines?country=no&apiKey=838674747d4742299653d7e6d252ae35&q=${emne}`)
    .then(response => response.json())
    .then(data => {

      const articles = data.articles;
      //console.log(articles);
      const headlines = articles.map(article => article.title);
      console.log(headlines);
      addsearchTermMessage(`Here are the latest news headlines:\n${headlines.join('\n')}`);
    })
    .catch(() => {
      addsearchTermMessage('Sorry, I couldnt get the latest news.');
    });
}

function weather(message) {
  const city = message.split('@weather ')[1];
  console.log(city);
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=ba5cd6df97458072af2feb17bcfdf75c`)
    .then(response => response.json())
    .then(data => {
      const { main, weather } = data;
      const temp = Math.round(main.temp - 273.15);
      console.log(temp);
      const description = weather[0].description;
      console.log(description);
      addsearchTermMessage(`The current weather in ${city} is ${temp}°C with ${description}.`);
    })
    .catch(() => {
      addsearchTermMessage(`Sorry, I couldnt get the weather for ${city}.`);
    });
}

async function ai(message) {
  console.log('ai');
  const searchTerm = message.split('@ai ')[1];
  // addsearchTermMessage(`Hello! How can I assist you today?${searchTerm}`);
  // async function generateText(searchTerm) {
  //   const response = await fetch('http://localhost:5000/generate', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({ input_text: searchTerm })
  //   });

  //   const data = await response.json();
  //   return data.generated_text;
  // }

  async function generateText(searchTerm) {

    let pyodide = await loadPyodide();
    var data = {
      'message': ['Hello', 'How are you?', 'Goodbye', 'Nice to meet you'],
      'label': ['greeting', 'question', 'farewell', 'introduction']
    }

    await pyodide.loadPackage("micropip");

    const micropip = pyodide.pyimport("micropip");
    await micropip.install("numpy")
    await micropip.install(" scikit-learn")
    await micropip.install("pandas")
    console.log("Installed packages");
    await pyodide.runPython(`
      import pandas as pd

      from sklearn.feature_extraction.text import CountVectorizer
      from sklearn.naive_bayes import MultinomialNB

      # Step 1: Collect chat data
      df = pd.DataFrame(${JSON.stringify(data)})
      print(df)

      # Step 2: Preprocess the data
      vectorizer = CountVectorizer(stop_words='english')
      X = vectorizer.fit_transform(df['message'])
      y = df['label']

      # Step 3: Build the chatsearchTerm model
      model = MultinomialNB()

      # Step 4: Train the model
      model.fit(X, y)

      # Step 5: Test and refine the chatsearchTerm
      message = "${searchTerm}"
      X_test = vectorizer.transform([message])
      prediction = model.predict(X_test)

      print(prediction)
      

    `);


    const prediction_string = pyodide.globals.get("prediction").toString();
    const prediction_array = prediction_string.split("'"); // ['[', 'greeting', ']']
    const prediction = prediction_array[1]; // greeting

    console.log("prediction_string", prediction_string);
    console.log("prediction_array", prediction_array);


    return prediction;

  }

  // Example usage
  const generatedText = await generateText(searchTerm);
  addsearchTermMessage(generatedText);
  console.log("generatedText", generatedText);

}

function addsearchTermMessage(message) {
  const time = new Date().getTime();
  const id = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36)
  const data = { username: 'bot', message, time, id };
  gun.get('messages').set(data);
}


