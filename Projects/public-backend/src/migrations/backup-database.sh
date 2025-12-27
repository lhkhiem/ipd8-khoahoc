#!/bin/bash
# Backup Database Script for IPD8 Migration
# Usage: ./backup-database.sh

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-ipd8_db}
DB_USER=${DB_USER:-postgres}

# Backup directory
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "==========================================="
echo "IPD8 Database Backup"
echo "==========================================="
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Timestamp: $TIMESTAMP"
echo "==========================================="
echo ""

# Backup full database
echo "Creating full database backup..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    > "$BACKUP_DIR/backup_full_${TIMESTAMP}.sql"

if [ $? -eq 0 ]; then
    echo "✓ Full backup created: backup_full_${TIMESTAMP}.sql"
else
    echo "✗ Full backup failed!"
    exit 1
fi

# Backup schema only
echo "Creating schema-only backup..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --schema-only \
    > "$BACKUP_DIR/backup_schema_${TIMESTAMP}.sql"

if [ $? -eq 0 ]; then
    echo "✓ Schema backup created: backup_schema_${TIMESTAMP}.sql"
else
    echo "✗ Schema backup failed!"
    exit 1
fi

# Backup data only
echo "Creating data-only backup..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --data-only \
    > "$BACKUP_DIR/backup_data_${TIMESTAMP}.sql"

if [ $? -eq 0 ]; then
    echo "✓ Data backup created: backup_data_${TIMESTAMP}.sql"
else
    echo "✗ Data backup failed!"
    exit 1
fi

echo ""
echo "==========================================="
echo "✓ All backups completed successfully!"
echo "Backup location: $BACKUP_DIR"
echo "==========================================="



















