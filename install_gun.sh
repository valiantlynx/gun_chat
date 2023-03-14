#!/bin/bash

# remove old gun
ls
docker stop gun_chat_server
docker system prune -a
ls
rm -rf gun
docker ps -a
docker images -a

# install gun
git clone https://github.com/amark/gun.git
cd gun
docker build -t gun .
docker run -d --name gun -p 8765:8765 gun
