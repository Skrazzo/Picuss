#!/bin/sh

# Start PHP-FPM (daemonized)
php-fpm82 -D

# Start Nginx (foreground)
nginx -g 'daemon off;'
