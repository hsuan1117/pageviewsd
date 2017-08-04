FROM node:8-alpine

ENV TZ=Europe/Kiev
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN mkdir /src && npm install nodemon -g

WORKDIR /src

ADD package.json package.json
ADD nodemon.json nodemon.json

RUN npm install


CMD npm start