#!/bin/sh

# Start crontabd
crond

# Migration
cd /app && php artisan migrate

# Start PHP-FPM (daemonized)
php-fpm82 -D --allow-to-run-as-root

# Start Nginx (foreground)
nginx -g 'daemon off;'
