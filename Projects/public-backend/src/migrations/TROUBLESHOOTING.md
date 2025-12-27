# Troubleshooting Migration

## 🔐 Lỗi Authentication

### Lỗi: `password authentication failed for user "postgres"`

**Nguyên nhân:**
- Password trong `.env.local` không đúng
- User `postgres` không tồn tại hoặc không có quyền
- PostgreSQL không chấp nhận password authentication

**Giải pháp:**

#### 1. Kiểm tra password PostgreSQL

```bash
# Windows - Kiểm tra PostgreSQL service
# Mở pgAdmin hoặc psql để test connection

# Test connection với psql
psql -U postgres -h localhost -d postgres
# Nhập password khi được hỏi
```

#### 2. Cập nhật password trong `.env.local`

File: `Projects/public-backend/.env.local`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db_staging
DB_USER=postgres
DB_PASSWORD=your_actual_password_here  # ← Cập nhật password đúng
```

#### 3. Nếu dùng user khác (không phải postgres)

```env
DB_USER=your_username  # User có quyền CREATEDB
DB_PASSWORD=your_password
```

#### 4. Kiểm tra PostgreSQL authentication method

File: `postgresql.conf` hoặc `pg_hba.conf`

Đảm bảo có dòng:
```
host    all             all             127.0.0.1/32            md5
# hoặc
host    all             all             127.0.0.1/32            password
```

#### 5. Reset password PostgreSQL (nếu cần)

```sql
-- Connect với superuser
ALTER USER postgres WITH PASSWORD 'new_password';
```

## 🗄️ Lỗi Database không tồn tại

### Lỗi: `database "ipd8_db_staging" does not exist`

**Giải pháp:**

1. **Tự động tạo database:**
   ```bash
   npm run migrate:setup
   ```

2. **Hoặc tạo thủ công:**
   ```bash
   # Windows PowerShell
   psql -U postgres -c "CREATE DATABASE ipd8_db_staging;"
   
   # Hoặc dùng pgAdmin
   ```

## 🔑 Lỗi Permission

### Lỗi: `permission denied to create database`

**Giải pháp:**

1. **Grant quyền CREATEDB:**
   ```sql
   ALTER USER your_user WITH CREATEDB;
   ```

2. **Hoặc dùng user postgres (superuser):**
   ```env
   DB_USER=postgres
   ```

## 📝 Checklist trước khi test migration

- [ ] PostgreSQL đang chạy
- [ ] Password trong `.env.local` đúng
- [ ] User có quyền CREATEDB (hoặc dùng postgres)
- [ ] Database staging đã được tạo (hoặc chạy `npm run migrate:setup`)
- [ ] Connection test thành công

## 🧪 Test Connection

Tạo file test: `test-connection.ts`

```typescript
import '../utils/loadEnv';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: 'postgres', // Test với default database
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

pool.query('SELECT version()')
  .then(result => {
    console.log('✅ Connection successful!');
    console.log('PostgreSQL version:', result.rows[0].version);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Connection failed:', error.message);
    console.error('\n💡 Check:');
    console.error('  1. PostgreSQL is running');
    console.error('  2. Password in .env.local is correct');
    console.error('  3. User has permission');
    process.exit(1);
  })
  .finally(() => pool.end());
```

Chạy:
```bash
ts-node test-connection.ts
```

## 📞 Cần hỗ trợ?

Nếu vẫn gặp vấn đề:
1. Kiểm tra PostgreSQL logs
2. Verify `.env.local` có đúng format
3. Test connection với psql/pgAdmin
4. Check firewall/network settings


















