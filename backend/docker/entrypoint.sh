#!/bin/sh
set -e

echo "Waiting for database migrations..."
until npx prisma migrate deploy; do
  echo "Database not ready, retrying in 2s..."
  sleep 2
done

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  echo "Seeding database..."
<<<<<<< HEAD
  if ! npx tsx prisma/seed.ts; then
    echo "Seed failed — continuing so API can still start."
  fi
=======
  npx tsx prisma/seed.ts
>>>>>>> origin/main
fi

echo "Starting API..."
exec node dist/index.js
