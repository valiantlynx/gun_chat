# Node image to build the Express app
FROM node:alpine as builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./

# Nginx image to serve both static files and reverse proxy to Express
FROM nginx:alpine
COPY --from=builder /app /var/www/html/
COPY examples/ /var/www/html/examples
COPY gun/ /var/www/html/gun
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
