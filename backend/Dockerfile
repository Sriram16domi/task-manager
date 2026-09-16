FROM node:22-bookworm

WORKDIR /app

COPY package*.json ./

RUN npm ci --no-audit --no-fund

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
