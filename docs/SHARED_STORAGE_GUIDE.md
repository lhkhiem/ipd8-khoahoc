# SHARED STORAGE GUIDE - IPD8

**Mục đích:** Hướng dẫn sử dụng shared-storage cho CMS và Public website

---

## 📋 TỔNG QUAN

### Cấu Trúc

```
IPD8/
├── Projects/
│   ├── cms-backend/
│   ├── cms-frontend/
│   ├── public-backend/
│   └── public-frontend/
└── shared-storage/              # ⚠️ Ở root project
    ├── uploads/                 # Files đã upload (dùng chung)
    │   ├── images/              # Images
    │   ├── videos/              # Videos
    │   ├── documents/           # PDFs, documents
    │   └── avatars/             # User avatars
    └── temp/                    # Files tạm thời (có thể xóa)
```

### Nguyên Tắc

1. **Shared storage ở root project**, không nằm trong bất kỳ project nào
2. **Dùng chung** cho cả CMS Backend và Public Backend
3. **Path từ backend:** `../../shared-storage/` (relative) hoặc dùng environment variable
4. **Permissions:** Read/Write cho cả 2 backends

---

## 1. SETUP SHARED STORAGE

### 1.1. Tạo Thư Mục

```bash
# Từ root project
mkdir -p shared-storage/uploads/images
mkdir -p shared-storage/uploads/videos
mkdir -p shared-storage/uploads/documents
mkdir -p shared-storage/uploads/avatars
mkdir -p shared-storage/temp

# Set permissions
chmod 755 shared-storage
chmod 755 shared-storage/uploads
chmod 755 shared-storage/temp
```

### 1.2. Environment Variables

**CMS Backend** (`.env`):
```env
# Shared Storage Path
SHARED_STORAGE_PATH=../../shared-storage
STORAGE_UPLOADS_PATH=${SHARED_STORAGE_PATH}/uploads
STORAGE_TEMP_PATH=${SHARED_STORAGE_PATH}/temp

# Storage Provider
STORAGE_PROVIDER=local  # 'local' hoặc 's3'
```

**Public Backend** (`.env`):
```env
# Shared Storage Path (giống CMS Backend)
SHARED_STORAGE_PATH=../../shared-storage
STORAGE_UPLOADS_PATH=${SHARED_STORAGE_PATH}/uploads
STORAGE_TEMP_PATH=${SHARED_STORAGE_PATH}/temp

# Storage Provider
STORAGE_PROVIDER=local  # 'local' hoặc 's3'
```

**Production** (absolute path):
```env
SHARED_STORAGE_PATH=/var/www/ipd8/shared-storage
STORAGE_UPLOADS_PATH=/var/www/ipd8/shared-storage/uploads
STORAGE_TEMP_PATH=/var/www/ipd8/shared-storage/temp
```

---

## 2. SỬ DỤNG TRONG CODE

### 2.1. CMS Backend

**File:** `cms-backend/src/utils/storage.ts`

```typescript
import path from 'path';
import fs from 'fs';

const SHARED_STORAGE_PATH = process.env.SHARED_STORAGE_PATH || '../../shared-storage';
const UPLOADS_PATH = path.join(SHARED_STORAGE_PATH, 'uploads');
const TEMP_PATH = path.join(SHARED_STORAGE_PATH, 'temp');

export const storagePaths = {
  uploads: UPLOADS_PATH,
  temp: TEMP_PATH,
  images: path.join(UPLOADS_PATH, 'images'),
  videos: path.join(UPLOADS_PATH, 'videos'),
  documents: path.join(UPLOADS_PATH, 'documents'),
  avatars: path.join(UPLOADS_PATH, 'avatars'),
};

// Ensure directories exist
export function ensureStorageDirs() {
  Object.values(storagePaths).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Save file to shared storage
export function saveToSharedStorage(file: Buffer, filename: string, subfolder: 'images' | 'videos' | 'documents' | 'avatars'): string {
  const targetDir = storagePaths[subfolder];
  const filePath = path.join(targetDir, filename);
  
  fs.writeFileSync(filePath, file);
  return filePath;
}
```

### 2.2. Public Backend

**File:** `public-backend/src/utils/storage.ts`

```typescript
// Tương tự CMS Backend, sử dụng cùng shared-storage path
import path from 'path';
import fs from 'fs';

const SHARED_STORAGE_PATH = process.env.SHARED_STORAGE_PATH || '../../shared-storage';
// ... (giống CMS Backend)
```

---

## 3. FILE ORGANIZATION

### 3.1. Cấu Trúc Thư Mục

```
shared-storage/
├── uploads/
│   ├── images/
│   │   ├── courses/          # Course thumbnails
│   │   ├── posts/            # Post images
│   │   └── general/          # General images
│   ├── videos/
│   │   ├── courses/          # Course videos
│   │   └── previews/         # Video previews
│   ├── documents/
│   │   ├── materials/        # Course materials (PDFs)
│   │   └── general/          # General documents
│   └── avatars/
│       ├── users/            # User avatars
│       └── instructors/      # Instructor avatars
└── temp/
    └── [temporary files]    # Files tạm thời, có thể xóa
```

### 3.2. Naming Convention

**Images:**
- Format: `{type}-{id}-{timestamp}.{ext}`
- Example: `course-abc123-20250101120000.jpg`

**Videos:**
- Format: `{type}-{id}-{timestamp}.{ext}`
- Example: `course-abc123-20250101120000.mp4`

**Documents:**
- Format: `{type}-{id}-{timestamp}.{ext}`
- Example: `material-xyz789-20250101120000.pdf`

**Avatars:**
- Format: `{user|instructor}-{id}-{timestamp}.{ext}`
- Example: `user-123-20250101120000.jpg`

---

## 4. ACCESS CONTROL

### 4.1. File Access

**Public Files:**
- Images: `/uploads/images/**` - Public access
- Videos: `/uploads/videos/**` - Authenticated access (enrolled users only)

**Private Files:**
- Documents: `/uploads/documents/**` - Authenticated access (enrolled users only)
- Avatars: `/uploads/avatars/**` - Authenticated access (own only)

### 4.2. URL Generation

**CMS Backend:**
```typescript
// Generate public URL
const publicUrl = `/storage/uploads/images/${filename}`;

// Generate signed URL (for private files)
const signedUrl = generateSignedUrl(`/uploads/documents/${filename}`, userId);
```

**Public Backend:**
```typescript
// Generate public URL (same as CMS)
const publicUrl = `/storage/uploads/images/${filename}`;
```

---

## 5. CLEANUP & MAINTENANCE

### 5.1. Temp Files Cleanup

**Cron Job** (daily):
```bash
# Clean temp files older than 24 hours
find /var/www/ipd8/shared-storage/temp -type f -mtime +1 -delete
```

### 5.2. Orphaned Files Cleanup

**Script:** `scripts/cleanup-orphaned-files.ts`

```typescript
// Find files in shared-storage that are not referenced in database
// Delete orphaned files older than 30 days
```

### 5.3. Storage Monitoring

**Metrics:**
- Total storage size
- Files count by type
- Oldest files
- Largest files

---

## 6. DEPLOYMENT

### 6.1. Production Setup

```bash
# Create shared-storage on server
mkdir -p /var/www/ipd8/shared-storage/uploads/{images,videos,documents,avatars}
mkdir -p /var/www/ipd8/shared-storage/temp

# Set permissions
chown -R www-data:www-data /var/www/ipd8/shared-storage
chmod -R 755 /var/www/ipd8/shared-storage
```

### 6.2. Nginx Configuration

```nginx
# Serve static files from shared-storage
location /storage/ {
    alias /var/www/ipd8/shared-storage/;
    expires 30d;
    add_header Cache-Control "public, immutable";
    
    # Security headers
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
}
```

---

## 7. BACKUP

### 7.1. Backup Strategy

**Daily Backup:**
```bash
# Backup shared-storage/uploads (không backup temp)
tar -czf backup-storage-$(date +%Y%m%d).tar.gz /var/www/ipd8/shared-storage/uploads

# Upload to S3 (optional)
aws s3 cp backup-storage-$(date +%Y%m%d).tar.gz s3://backup-bucket/
```

### 7.2. Restore

```bash
# Restore from backup
tar -xzf backup-storage-YYYYMMDD.tar.gz -C /var/www/ipd8/
```

---

## 8. TROUBLESHOOTING

### 8.1. Permission Issues

**Error:** `EACCES: permission denied`

**Solution:**
```bash
chmod -R 755 /var/www/ipd8/shared-storage
chown -R www-data:www-data /var/www/ipd8/shared-storage
```

### 8.2. Path Issues

**Error:** `ENOENT: no such file or directory`

**Solution:**
- Check environment variable `SHARED_STORAGE_PATH`
- Ensure path is absolute in production
- Check directory exists

### 8.3. Disk Space

**Monitor:**
```bash
# Check disk usage
du -sh /var/www/ipd8/shared-storage/

# Find largest files
find /var/www/ipd8/shared-storage/uploads -type f -exec ls -lh {} \; | sort -k5 -hr | head -20
```

---

## TÓM TẮT

**Shared Storage:**
- ✅ Nằm ở root project (`shared-storage/`)
- ✅ Dùng chung cho CMS Backend và Public Backend
- ✅ Cấu trúc: `uploads/` và `temp/`
- ✅ Environment variable: `SHARED_STORAGE_PATH`
- ✅ Backup: Chỉ backup `uploads/`, không backup `temp/`

**Lưu ý:** Không đặt storage trong `cms-backend/` hay `public-backend/`, phải ở root project.























