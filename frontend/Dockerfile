# frontend/Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# 用 serve 提供靜態檔案
RUN npm install -g serve

EXPOSE 3001
CMD ["serve", "-s", "build", "-l", "3001"]
