#!/bin/sh
set -e

echo "Waiting for database migrations..."
until npx prisma migrate deploy; do
  echo "Database not ready, retrying in 2s..."
  sleep 2
done

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
fi

echo "Starting API..."
exec node dist/index.js
