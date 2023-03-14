git clone https://github.com/amark/gun.git
cd gun
docker build -t gun .
docker run -d --name  gun_chat_server -p 8765:8765 gun
