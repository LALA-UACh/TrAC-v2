FROM node:13-alpine

WORKDIR /home/trac

COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile

EXPOSE 3000 4000

COPY . .

RUN yarn build

CMD ["yarn", "start"]
