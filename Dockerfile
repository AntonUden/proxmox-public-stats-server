FROM node:20-alpine3.16

WORKDIR /app

COPY . .

RUN npm install
RUN npm install -g typescript
RUN npm install -g ts-node

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]