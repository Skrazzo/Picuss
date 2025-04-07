# Base: Alpine Linux - small and tight
FROM alpine:3.19

# Install Nginx & PHP-FPM (using php82 here, adjust if needed)
RUN apk update && \
    apk add --no-cache nginx php82 php82-fpm

# Install bash and curl
RUN apk update && apk --no-cache add curl bash gcompat libstdc++ libgcc

# Install bun
RUN curl -fsSL https://bun.sh/install | bash

# Configure PHP-FPM: Use socket, run as nginx user
RUN sed -i 's/user = nobody/user = root/g' /etc/php82/php-fpm.d/www.conf && \
    sed -i 's/group = nobody/group = root/g' /etc/php82/php-fpm.d/www.conf && \
    sed -i 's|listen = 127.0.0.1:9000|listen = /run/php/php82-fpm.sock|g' /etc/php82/php-fpm.d/www.conf && \
    sed -i 's/;listen.owner = nobody/listen.owner = root/g' /etc/php82/php-fpm.d/www.conf && \
    sed -i 's/;listen.group = nobody/listen.group = root/g' /etc/php82/php-fpm.d/www.conf && \
    mkdir -p /run/php && \
    chown root:root /run/php

WORKDIR /app

# Install composer
RUN apk update && apk add --no-cache \
    php \
    php-phar \
    php-json \
    php-mbstring \
    php-zip \
    php-openssl \
    php82-session \
    php82-fileinfo \
    php82-tokenizer \
    php82-dom \
    php82-pdo \
    php82-pdo_sqlite \
    php82-bcmath \
    php82-pecl-imagick \
    php82-gd \
    # Add other php extensions your project requires here
    && rm -rf /var/cache/apk/*

# Download and install Composer globally
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy ya code
COPY . .

# Run bun and composer install
RUN /root/.bun/bin/bun install
RUN /root/.bun/bin/bun run build

# Install vendor and other shit
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Setup web root
RUN chown -R root:root /app && \
    chmod -R 775 /app

# Configure Nginx: Remove default, copy yours
RUN rm /etc/nginx/http.d/default.conf
COPY docker/nginx-site.conf /etc/nginx/http.d/default.conf

# Copy whole nginx config
RUN rm /etc/nginx/nginx.conf
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Latavel env
COPY docker/env_file ./.env

# PHP.ini
COPY docker/php.ini /etc/php82/php.ini

# allow fpm run as root
# RUN echo "allow_to_run_as_root = yes" >> /etc/php82/php-fpm.conf

# Nginx listens on 80
EXPOSE 80

# Script to start both services
COPY docker/start_server.sh /start.sh
RUN chmod +x /start.sh

# Run the startup script
CMD ["/start.sh"]
