#!/usr/bin/env bash
set -euo pipefail

# ─── CONFIG ────────────────────────────────────────────────────────────────────
# Replace with your actual Git URL and desired clone directory
REPO_URL="git@github.com:your-user/contracker.git"
APP_DIR="contracker"

# ─── 1) SYSTEM PACKAGES ─────────────────────────────────────────────────────────
sudo apt update
sudo apt install -y \
    software-properties-common \
    curl \
    git \
    unzip \
    mysql-server \
    mysql-client

# ─── 2) PHP 8.4 + EXTENSIONS ───────────────────────────────────────────────────
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y \
    php8.4-cli \
    php8.4-common \
    php8.4-mbstring \
    php8.4-xml \
    php8.4-zip \
    php8.4-curl \
    php8.4-mysql

# ─── 3) COMPOSER ─────────────────────────────────────────────────────────────────
if ! command -v composer >/dev/null; then
  curl -sS https://getcomposer.org/installer | php
  sudo mv composer.phar /usr/local/bin/composer
fi

# ─── 4) NODE & NPM ──────────────────────────────────────────────────────────────
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt install -y nodejs
fi

# ─── 5) CLONE & PREPARE APP ──────────────────────────────────────────────────────
if [ ! -d "$APP_DIR" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

# Copy your .env (or use example)
if [ ! -f .env ]; then
  cp .env.example .env
fi

# ─── 6) DATABASE SETUP ──────────────────────────────────────────────────────────
sudo service mysql start
# from .env: DB_DATABASE=contracker, DB_USERNAME=root, DB_PASSWORD= (no password) :contentReference[oaicite:0]{index=0}
mysql -u root -e "CREATE DATABASE IF NOT EXISTS \`${DB_DATABASE:-contracker}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# ─── 7) INSTALL PHP DEPENDENCIES ────────────────────────────────────────────────
composer install --prefer-dist --no-interaction

# generate app key, run migrations :contentReference[oaicite:1]{index=1}
php artisan key:generate --ansi
php artisan migrate --force

# ─── 8) INSTALL JS DEPENDENCIES ─────────────────────────────────────────────────
npm ci

# ─── 9) RUN YOUR TEST SUITE ─────────────────────────────────────────────────────
./vendor/bin/phpunit --colors=always

echo
echo "✅  Setup complete — your environment is ready and PHPUnit has run."
