#!/bin/bash

# remove old gun
ls
docker stop gun
docker system prune -af

ls
rm -rf gun
docker ps -a
docker images -a

# install gun
git clone https://github.com/amark/gun.git
cd gun
docker build -t gun .
docker run -d --name gun -p 8765:8765 gun
