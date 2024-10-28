# Picuss [![wakatime](https://wakatime.com/badge/user/e4aa98a2-74f7-4262-9148-ce908ef17a57/project/6452b655-83e2-4d8d-ac67-6fa1388dd244.svg)](https://wakatime.com/badge/user/e4aa98a2-74f7-4262-9148-ce908ef17a57/project/6452b655-83e2-4d8d-ac67-6fa1388dd244) ![Static Badge](https://img.shields.io/badge/Krigga-approved-blue)

Picuss is a tag based photo gallery, made with **Laravel** and **React**

# Main focus for the project

-   Client side image compression and convertion
-   Low bandwidth usage
-   Fast image loading
-   Image tag system to easily find pictues by tags
-   Share images and tags

## Features

-   Loads fast with low bandwidth usage
    -   Client side image compression (fast image upload)
    -   Lazy loading (thumbnails, and scaled down images)

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
