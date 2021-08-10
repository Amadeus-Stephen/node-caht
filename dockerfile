FROM node:16-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
RUN npm install

COPY . /app
EXPOSE 5000


# ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
# RUN chmod +x /wait



# RUN ["npm", "start"]

CMD ["npm", "start"]