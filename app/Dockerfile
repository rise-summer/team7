FROM node:13

USER node

WORKDIR /src

#COPY package*.json ./

RUN npm install

#COPY . .
ENV NODE_ENV=development
CMD ["npm", "start"]
