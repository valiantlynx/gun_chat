git clone https://github.com/amark/gun.git
cd gun
docker build -t gun .
docker run -d --name gun -p 8765:8765 gun
