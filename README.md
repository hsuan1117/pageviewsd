# Simple pageviews counter for select most viewed ids by last N days

Store counts in redis as sorted sets

Used:
- nodejs (expressjs)
- redis
- docker

## before start

Run:

```sh
cp app/config-example.json app/config.json
```
and set config vars


## API 

- http://localhost:8080/hit?p={project}&i={ID} - Hit view, return GIF zeropixel
- http://localhost:8080/get/{project} - Get most viewed IDs, return JSON

where {project} - project name from config.json


## Use in Wordpress

Paste to single.php of your theme

```html
<script>
    (new Image()).src="http://localhost:8080/hit/?p={project}&i=<?php echo (int)$post->ID ?>&r" + Math.random();
</script>
```

where {project} - project name from config.json
