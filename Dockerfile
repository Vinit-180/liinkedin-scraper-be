From node:lts-slim

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

EXPOSE 9000

CMD ["npm", "run" ,"dev"]


# https://github.com/actions/checkout