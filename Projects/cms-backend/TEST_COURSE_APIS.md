# 🧪 QUICK START - TEST COURSE APIs

## ⚡ Quick Test (3 bước)

### 1. Cài đặt dependencies

```bash
cd Projects/cms-backend
npm install
```

### 2. Start server

```bash
npm run dev
```

Server chạy trên: `http://localhost:3103`

### 3. Chạy test

Mở terminal mới:

```bash
cd Projects/cms-backend
npm run test:course
```

---

## ✅ Expected Results

Test script sẽ tự động:
1. ✅ Login với admin account
2. ✅ Tạo test course
3. ✅ Test Modules APIs (Add, Update, Delete, Reorder)
4. ✅ Test Sessions APIs (Add, Update, Delete, Update Status)
5. ✅ Test Materials APIs (Upload, Update, Delete)
6. ✅ Cleanup (xóa test course)

**Expected Output:**
```
🚀 Starting Course APIs Tests...

🔐 Authenticating...
  ✓ Login as Admin

📚 Setting up test course...
  ✓ Create test course

📦 Testing Modules APIs...
  ✓ Get course modules (empty)
  ✓ Add module to course
  ✓ Update module
  ✓ Reorder modules
  ✓ Delete module

📅 Testing Sessions APIs...
  ✓ Get course sessions (empty)
  ✓ Add session to course
  ✓ Update session
  ✓ Update session status
  ✓ Delete session

📄 Testing Materials APIs...
  ✓ Get course materials (empty)
  ✓ Add material (create test file)
  ✓ Update material (title only)
  ✓ Delete material

🧹 Cleaning up test data...
  ✓ Delete test course

============================================================
📊 TEST SUMMARY
============================================================

Total Tests: 15
Passed: 15
Failed: 0

✅ All tests passed!
```

---

## 🔧 Troubleshooting

### Issue: Authentication Failed

**Error:** `Login failed: 401`

**Solution:**
1. Kiểm tra admin user có tồn tại không
2. Kiểm tra email/password trong `.env.local`:
   ```
   ADMIN_EMAIL=admin@ipd8.com
   ADMIN_PASSWORD=admin123
   ```

### Issue: Cannot connect to server

**Error:** `ECONNREFUSED` hoặc `timeout`

**Solution:**
1. Đảm bảo server đang chạy: `npm run dev`
2. Kiểm tra port 3103 có bị chiếm không
3. Kiểm tra `API_BASE_URL` trong `.env.local`

### Issue: File upload failed

**Error:** `Failed to add material`

**Solution:**
1. Kiểm tra `shared-storage/uploads/materials/` directory tồn tại
2. Kiểm tra permissions của directory
3. Kiểm tra form-data package đã được cài: `npm install form-data`

---

## 📚 More Information

- [Full Testing Guide](../../docs/COURSE_APIS_TESTING_GUIDE.md)
- [API Documentation](../../docs/CMS_COURSE_APIS_COMPLETE.md)

---

**Happy Testing! 🎉**

