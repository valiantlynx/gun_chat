#!/bin/bash
# install gun
git clone https://github.com/amark/gun.git
rm -rf gun/.git
docker-compose up -d
