# Node image to build the Express app
FROM node:alpine as builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./

# Nginx image to serve both static files and reverse proxy to Express
FROM nginx:alpine
RUN apk add git
WORKDIR /var/www/html/
COPY --from=builder /app /var/www/html/
COPY examples/ /var/www/html/examples

RUN git clone https://github.com/amark/gun.git


COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

