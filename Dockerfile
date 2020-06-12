# cyolo custom image, using docker inside docker
FROM node:13-alpine as node-builder

COPY package.json .

COPY yarn.lock .

RUN yarn install

COPY . .

RUN yarn build

WORKDIR /build

CMD [ "node", "index.js" ]

