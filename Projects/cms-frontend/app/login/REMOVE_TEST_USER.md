# Hướng dẫn xóa thông tin Test User

## ⚠️ File này cần xóa khi hoàn thành dự án

Khi hoàn thành dự án, cần xóa thông tin test user khỏi login page.

## 📝 Các bước xóa:

### 1. Xóa code trong `app/login/page.tsx`

Tìm và xóa đoạn code sau (từ dòng có comment `TEST USER INFO` đến `END TEST USER INFO`):

```tsx
{/* ============================================
    TEST USER INFO - XÓA KHI HOÀN THÀNH DỰ ÁN
    ============================================ */}
<div className="mt-4 pt-4 border-t border-border dark:border-slate-700">
  <p className="text-center text-sm text-muted-foreground dark:text-slate-400">
    Thông tin đăng nhập test:
  </p>
  <div className="mt-3 space-y-1.5 text-center">
    <p className="text-xs text-muted-foreground dark:text-slate-400">
      Email: <span className="text-foreground dark:text-slate-200 font-mono">test1766026824022@example.com</span>
    </p>
    <p className="text-xs text-muted-foreground dark:text-slate-400">
      Mật khẩu: <span className="text-foreground dark:text-slate-200 font-mono">Test123!</span>
    </p>
    <p className="text-xs text-red-500 dark:text-red-400 mt-2">
      ⚠️ Chỉ dùng cho môi trường test/development
    </p>
  </div>
</div>
{/* ============================================
    END TEST USER INFO
    ============================================ */}
```

### 2. Xóa file này

Xóa file `REMOVE_TEST_USER.md` sau khi đã xóa code.

### 3. (Tùy chọn) Xóa test user khỏi database

Nếu muốn xóa hoàn toàn test user khỏi database:

```sql
DELETE FROM users WHERE email = 'test1766026824022@example.com';
```

---

**Lưu ý:** Đảm bảo đã test kỹ trước khi xóa để không ảnh hưởng đến quá trình development.






















