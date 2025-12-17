#!/bin/bash
# Manual migration runner - prompts for password if needed

echo "🚀 Running about_sections migration (differences & timeline)..."
echo ""

# Try to read from .env
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

DB_NAME="${DB_NAME:-spa_cms_db}"
DB_USER="${DB_USER:-spa_cms_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST:$DB_PORT"
echo ""

# If password is not set, try to use postgres user as fallback
if [ -z "$DB_PASSWORD" ]; then
    echo "⚠️  DB_PASSWORD not found in .env"
    echo "💡 Trying with user 'postgres' (you may need to enter password)..."
    echo ""
    psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -d "$DB_NAME" -f src/migrations/042_add_differences_timeline_sections.sql
else
    export PGPASSWORD="$DB_PASSWORD"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f src/migrations/042_add_differences_timeline_sections.sql
    unset PGPASSWORD
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
else
    echo ""
    echo "❌ Migration failed."
fi


