FROM nginx:alpine
RUN apk add git
WORKDIR /var/www/html/
COPY examples/ /var/www/html/examples

RUN git clone https://github.com/amark/gun.git


COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000

