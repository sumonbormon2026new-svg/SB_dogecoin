FROM node:22
WORKDIR /app
COPY package.json ./
RUN npm install
EXPOSE 3000
CMD ["npx", "nodemon", "--watch", "server.js", "server.js"]
