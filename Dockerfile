FROM node:13-alpine

WORKDIR /home/trac

RUN npm add -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prefer-frozen-lockfile

EXPOSE 3000 4000

COPY . .

RUN pnpm run build

CMD ["pnpm", "start"]
