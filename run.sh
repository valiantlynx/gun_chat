#!/bin/bash

# remove old gun_chat
ls
docker stop gun_chat
docker system prune -af

ls
rm -rf gun_chat
docker ps -a
docker images -a

# install gun_chat
git clone https://github.com/valiantlynx/gun_chat.git
cd gun_chat
docker build -t gun_chat .
docker run -d --name gun_chat -p 332:3000 gun_chat
