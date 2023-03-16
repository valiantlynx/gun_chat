#!/bin/bash

# remove old gun_chat
ls
sleep 2
docker stop gun_chat
sleep 1
docker system prune -af

sleep 2
ls
rm -rf gun_chat
docker ps -a
sleep 4
docker images -a
sleep 3

# install gun_chat
git clone https://github.com/valiantlynx/gun_chat.git
cd gun_chat
ls
sleep 5
docker build -t gun_chat .
docker run -d --name gun_chat -p 332:3000 gun_chat
