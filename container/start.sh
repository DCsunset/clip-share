#!/usr/bin/env sh
set -e

cd /app/server
node dist/server.js &

cd /app/container
caddy run
