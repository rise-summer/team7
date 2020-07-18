FROM node:12-buster

#RUN apt-get update && apt-get install git

RUN mkdir -p /src/node_modules && chown -R node:node /src

USER node

WORKDIR /src

COPY package*.json ./

COPY --chown=node:node .git /src/.git

RUN npm install

#COPY . ./
#RUN node node_modules/husky/bin/install.js

CMD ["npm", "start"]
