# Backup Database Script for IPD8 Migration (PowerShell)
# Usage: .\backup-database.ps1

# Load environment variables from .env.local
$envFile = ".env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Database connection details
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "ipd8_db_staging" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_PASSWORD = $env:DB_PASSWORD

# Backup directory
$BACKUP_DIR = ".\backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"

# Create backup directory if it doesn't exist
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

Write-Host "==========================================="
Write-Host "IPD8 Database Backup"
Write-Host "==========================================="
Write-Host "Database: $DB_NAME"
Write-Host "Host: ${DB_HOST}:${DB_PORT}"
Write-Host "Timestamp: $TIMESTAMP"
Write-Host "==========================================="
Write-Host ""

# Set PGPASSWORD environment variable for pg_dump
$env:PGPASSWORD = $DB_PASSWORD

# Backup full database
Write-Host "Creating full database backup..."
$fullBackup = "$BACKUP_DIR\backup_full_${TIMESTAMP}.sql"
& pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $fullBackup

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Full backup created: backup_full_${TIMESTAMP}.sql" -ForegroundColor Green
} else {
    Write-Host "✗ Full backup failed!" -ForegroundColor Red
    exit 1
}

# Backup schema only
Write-Host "Creating schema-only backup..."
$schemaBackup = "$BACKUP_DIR\backup_schema_${TIMESTAMP}.sql"
& pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --schema-only -f $schemaBackup

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Schema backup created: backup_schema_${TIMESTAMP}.sql" -ForegroundColor Green
} else {
    Write-Host "✗ Schema backup failed!" -ForegroundColor Red
    exit 1
}

# Backup data only
Write-Host "Creating data-only backup..."
$dataBackup = "$BACKUP_DIR\backup_data_${TIMESTAMP}.sql"
& pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --data-only -f $dataBackup

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Data backup created: backup_data_${TIMESTAMP}.sql" -ForegroundColor Green
} else {
    Write-Host "✗ Data backup failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================="
Write-Host "✓ All backups completed successfully!" -ForegroundColor Green
Write-Host "Backup location: $BACKUP_DIR"
Write-Host "==========================================="

# Clear password from environment
Remove-Item Env:\PGPASSWORD


