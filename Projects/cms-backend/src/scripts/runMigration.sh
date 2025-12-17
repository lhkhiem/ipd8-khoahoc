#!/bin/bash
# Script to run page_metadata migration

echo "🚀 Running page_metadata migration..."

# Get database connection details from .env or use defaults
DB_NAME="${DB_NAME:-spa_db}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"

# Run SQL migration
echo "📝 Creating page_metadata table..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f src/migrations/021_create_page_metadata.sql

if [ $? -eq 0 ]; then
    echo "✅ Table created successfully"
else
    echo "⚠️  Table may already exist or connection issue"
fi

# Run data migration script
echo "📦 Migrating data from settings to page_metadata table..."
npx ts-node src/scripts/migratePageMetadata.ts

echo "✅ Migration complete!"








