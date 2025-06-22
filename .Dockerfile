# Dockerfile.dev

FROM node:22.16-alpine

# Install FFmpeg
RUN apk update && apk add --no-cache ffmpeg\
  && npm install -g typescript

# Set working directory
WORKDIR /app

COPY package* .

RUN npm install

COPY . .

RUN tsc -b

# Expose app port
EXPOSE 3000

CMD [ "node" , "dist/index.js" ]