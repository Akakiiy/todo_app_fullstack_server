FROM node:18.19.0-alpine3.18
WORKDIR /usr/app
COPY package.json .
RUN yarn install
