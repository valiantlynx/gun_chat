git clone https://github.com/amark/gun.git
cd gun
docker build -t myrepo/gundb:v1 .
docker run -d --name  gun_chat_server -p 8765:8765 myrepo/gundb:v1
