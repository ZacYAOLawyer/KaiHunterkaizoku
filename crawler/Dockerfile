# crawler/Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY index.js ./

# Puppeteer 依賴：安裝 chromium
RUN apt-get update && apt-get install -y wget gnupg ca-certificates chromium

EXPOSE 8081
CMD ["node", "index.js"]
