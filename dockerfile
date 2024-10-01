FROM node:22

WORKDIR /usr/src/worker

COPY . .

RUN apt-get update && apt-get install -y ffmpeg

RUN yarn install

EXPOSE 4000

CMD bash -c "yarn start:dev"