# Simple pageviews counter for select most viewed ids by last N days

Store counts in redis as sorted sets

Used:
- nodejs (expressjs)
- redis
- docker

## Install

### Run in development mode:

```sh
git clone https://github.com/nechehin/pageviewsd.git
cd pageviewsd
cp app/config-example.json app/config.json
```
and set config vars in app/config.json. Run application by:

```sh
docker-compose -f docker-compose.yml -f dev.yml up
```

### Run in production:

```sh
git clone https://github.com/nechehin/pageviewsd.git
cd pageviewsd
cp app/config-example.json app/config.json
```
and set config vars in app/config.json, include redis connection url. 
Also you can change application port in docker-compose.yml

Run application by:

```sh
docker-compose up -d
```

### Redis connection configuration (example)

Set in app/config.json:

```json
"redis": {
    "url": "redis://127.0.0.1:6379?db=0&password=redispass"
},
```
where:
- 127.0.0.1:6379 - redis host and port
- db=0 - redis DB number
- password=redispass - redis auth password


## API 

- http://localhost:8080/hit/{label}/{ID} - Hit view, return GIF zeropixel
- http://localhost:8080/get/{label} - Get most viewed IDs, return JSON

where 
- http://localhost:8080 - host and port where application running
- {label} - counter label from config.json


## Use in Wordpress

Paste to single.php of your theme

```html
<script>
    (new Image()).src="http://localhost:8080/hit/{label}/<?php echo (int)$post->ID ?>?r"+Math.random();
</script>
```

where 
- http://localhost:8080 - host and port where application running
- {label} - counter label name from config.json
