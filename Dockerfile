# Dockerfile.dev

FROM node:22.16-alpine

# Install FFmpeg
RUN apk update && apk add --no-cache ffmpeg\
  && npm install -g typescript pm2

# Set working directory
WORKDIR /app

COPY package* .

RUN npm install

COPY . .

RUN tsc -b

# Expose app port
EXPOSE 3000

CMD [ "pm2-runtime" , "dist/index.js" ]