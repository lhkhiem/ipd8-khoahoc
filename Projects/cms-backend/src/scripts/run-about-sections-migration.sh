#!/bin/bash
# Script to run about_sections migration (differences and timeline)

echo "🚀 Running about_sections migration (differences & timeline)..."

# Get database connection details from .env or use defaults
# Try to read from .env file if it exists
if [ -f .env ]; then
    # Source .env file properly (handle spaces and special chars)
    set -a
    source .env
    set +a
fi

DB_NAME="${DB_NAME:-spa_cms_db}"
DB_USER="${DB_USER:-spa_cms_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_PASSWORD="${DB_PASSWORD:-}"

echo "📝 Connecting to database: $DB_NAME on $DB_HOST:$DB_PORT as $DB_USER"
echo "📝 Running migration: 042_add_differences_timeline_sections.sql"

# Set PGPASSWORD to avoid password prompt
if [ -n "$DB_PASSWORD" ]; then
    export PGPASSWORD="$DB_PASSWORD"
fi

# Run SQL migration
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f src/migrations/042_add_differences_timeline_sections.sql

MIGRATION_EXIT_CODE=$?

# Clear password from environment
unset PGPASSWORD

if [ $MIGRATION_EXIT_CODE -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo "✅ Added 'differences' and 'timeline' sections to about_sections table"
else
    echo "❌ Migration failed. Please check:"
    echo "   - Database connection settings in .env file"
    echo "   - User permissions (user: $DB_USER)"
    echo "   - Password is correct (DB_PASSWORD in .env)"
    echo "   - File path: src/migrations/042_add_differences_timeline_sections.sql"
    echo ""
    echo "💡 Tip: You can also try running manually:"
    echo "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f src/migrations/042_add_differences_timeline_sections.sql"
    exit 1
fi


