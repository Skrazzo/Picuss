# Picuss [![wakatime](https://wakatime.com/badge/user/e4aa98a2-74f7-4262-9148-ce908ef17a57/project/6452b655-83e2-4d8d-ac67-6fa1388dd244.svg)](https://wakatime.com/badge/user/e4aa98a2-74f7-4262-9148-ce908ef17a57/project/6452b655-83e2-4d8d-ac67-6fa1388dd244) ![Static Badge](https://img.shields.io/badge/Krigga-approved-blue)

Picuss is a tag based photo gallery, made with **Laravel** and **React**

# Main focus for the project

- Client side image compression and convertion
- Low bandwidth usage
- Fast image loading
- Image tag system to easily find pictues by tags
- Share images and tags

## Features

- Loads fast with low bandwidth usage
  - Client side image compression (fast image upload)
  - Lazy loading (thumbnails, and scaled down images)

## Docker installation

Before installing via compose, create `picuss-data/database.sqlite`

```sh
mkdir picuss-data
touch database.sqlite
```

This will install everything

```sh
docker compose up -d
```

For ai object recognition, you can set crontab when you want it to scan for new images. In `Yolo/yolo-contab`
For picuss crontab thumbnail generation you can set when you want it in `docker/crontab`
They're 2 different containers because I couldn't add AI into picuss docker image sadly.

To change any php limitation you can change `docker/php.ini`
For nginx setup see `docker/nginx.conf` and `docker/nginx-site.conf`

For picuss env see `docker/env_file`
For AI see `Yolo/tags.env` but its already set for docker. Only thing you should be touching is confidence in object recognition.

### Database setup (**important before first run**)

Currently docker will use sqlite database, and default location is `picuss-data/database.sqlite` for it to work nicely, we need to run `mkdir picuss-data && touch picuss-data/database.sqlite`. Which will create picuss-data folder, and create empty database file. It is important for proper mount in docker. If you want to change the path to the database, do the same steps accordingly to the changed directory.

### Https errors

When I was setting it up, I tried to proxy it via caddy, and I had issue where laravel would set urls to http, and it would get blocked because I was on https.

To solve that add this line in `AppServiceProvider::boot() method`

```
\Illuminate\Support\Facades\URL::forceScheme('https');
```

And then build app again and see if it has solved the issue

```sh
docker compose up -d --build
```

## Crontab installation

### Here we will look at automatic tasks for Picuss

Automatic thumbnail generation, usually thumbnails are generated when user visits the page with images, but it slows down the process of viewing each page, and generating when uploaded slows down the upload process. That's why I made a Laravel script that generates thumbnails for all pictures except hidden pictures, because they're encrypted. You can call the script using crontab, and specify when to call it.

1. Open crontab (admin, because script requires to change generated image permissions)

```sh
sudo crontab -e
```

2. This is my setup, you need change the path to match your artisan file path. My script is running every 3 hours

```sh
0 */3 * * * sudo php /var/www/Picuss/artisan app:generate-all-pictures #Root is needed for file ownership changing
```
