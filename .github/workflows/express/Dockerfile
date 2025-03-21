# express/Dockerfile
FROM node:18

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY server.js ./

# HEALTHCHECK：定期檢查 Express 是否存活
HEALTHCHECK --interval=30s --timeout=10s CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["npm", "start"]
