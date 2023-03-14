#!/bin/bash

# remove old gun
ls
sudo docker stop gun_chat_server
sudo docker system prune -a
ls
sudo rm -rf gun
sudo docker ps -a
sudo docker images -a

# install gun
git clone https://github.com/amark/gun.git
cd gun
docker build -t gun .
docker run -d --name gun -p 8765:8765 gun
