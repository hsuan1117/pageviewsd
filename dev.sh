docker build -t pageviewd .
docker run -it --rm -v "$PWD/src":/usr/src/app -w /usr/src/app pageviewd node src/app.js
