# Simple pageviews counter for select most viewed ids by last N days

Store counts in redis as sorted sets

Used:
- nodejs (expressjs)
- redis
- docker

## Install

### Run on dev:

```sh
git clone https://github.com/nechehin/pageviewsd.git
cd pageviewsd
cp app/config-example.json app/config.json
docker-compose -f docker-compose.yml -f dev.yml up
```
and set config vars in app/config.json

### Run on production:

```sh
git clone https://github.com/nechehin/pageviewsd.git
cd pageviewsd
cp app/config-example.json app/config.json
docker-compose up -d
```
and set config vars in app/config.json, include redis connection url. 
Also you can change application port in docker-compose.yml

## API 

- http://localhost:8080/hit?p={project}&i={ID} - Hit view, return GIF zeropixel
- http://localhost:8080/get/{project} - Get most viewed IDs, return JSON

where 
- http://localhost:8080 - host and port where application running
- {project} - project name from config.json


## Use in Wordpress

Paste to single.php of your theme

```html
<script>
    (new Image()).src="http://localhost:8080/hit/?p={project}&i=<?php echo (int)$post->ID ?>&r" + Math.random();
</script>
```

where 
- http://localhost:8080 - host and port where application running
- {project} - project name from config.json
