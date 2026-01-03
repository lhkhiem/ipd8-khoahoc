# 🔧 FIX: Next.js 16 useParams() Promise Issue

**Ngày fix:** 2025-01-XX  
**Lỗi:** Next.js 16 requires `React.use()` to unwrap `useParams()` Promise

---

## 🐛 LỖI

### Error Message:
```
The keys of 'searchParams' were accessed directly. 
'searchParams' is a Promise and must be unwrapped with 'React.use()' 
before accessing its properties.
```

### Nguyên nhân:
Trong **Next.js 16**, `useParams()` và `useSearchParams()` trả về **Promise** thay vì object trực tiếp. Cần phải unwrap bằng `React.use()`.

---

## ✅ GIẢI PHÁP

### Cách 1: Dùng `React.use()` với `useParams()` (Client Component)

**Trước (Lỗi):**
```typescript
import { useParams } from 'next/navigation';

export default function EditPage() {
  const params = useParams();
  const id = params.id as string; // ❌ Lỗi: params là Promise
}
```

**Sau (Đúng):**
```typescript
import { use, useParams } from 'next/navigation';

export default function EditPage() {
  const params = use(useParams()); // ✅ Unwrap Promise
  const id = params.id as string;
}
```

### Cách 2: Nhận params từ props (Server Component)

**Nếu là Server Component:**
```typescript
export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ✅ Unwrap Promise từ props
}
```

---

## 📁 FILES ĐÃ FIX

1. ✅ `Projects/cms-frontend/app/dashboard/courses/[id]/page.tsx`
   - Thêm `use` import
   - Đổi `useParams()` → `use(useParams())`

2. ✅ `Projects/cms-frontend/app/dashboard/posts/[id]/page.tsx`
   - Thêm `use` import
   - Đổi `useParams()` → `use(useParams())`

3. ✅ `Projects/cms-frontend/app/dashboard/education-resources/[id]/page.tsx`
   - Thêm `use` import
   - Đổi `useParams()` → `use(useParams())`

4. ✅ `Projects/cms-frontend/components/TinyMCEEditor.tsx`
   - **FIX QUAN TRỌNG**: Bỏ `editor` object khỏi `console.log()`
   - Nguyên nhân: Khi log toàn bộ `editor` object, Next.js 16 detect việc enumerate params/searchParams trong quá trình serialize
   - Fix: Chỉ log `editorId` thay vì log cả `editor` object

---

## 🔍 KIỂM TRA CÁC FILE KHÁC

### Files đã kiểm tra và OK:
- ✅ `app/dashboard/menus/[id]/page.tsx` - Đã dùng đúng cách với props
- ✅ `app/dashboard/newsletter/page.tsx` - Không dùng useParams
- ✅ `app/dashboard/media/page.tsx` - Không dùng useParams
- ✅ `app/dashboard/media-library/page.tsx` - Không dùng useParams

### Components:
- ✅ `components/courses/*` - Không dùng useParams (nhận courseId từ props)

---

## 📝 CHECKLIST ĐỂ TRÁNH LỖI TƯƠNG TỰ

Khi tạo/edit pages với dynamic routes `[id]`:

### ✅ DO:
```typescript
// Client Component
import { use } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = use(useParams()); // ✅ Unwrap Promise
  const id = params.id;
}
```

```typescript
// Server Component
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ✅ Unwrap từ props
}
```

### ❌ DON'T:
```typescript
// ❌ SAI - Trong Next.js 16
const params = useParams();
const id = params.id; // Lỗi: params là Promise
```

---

## 🧪 TEST SAU KHI FIX

1. ✅ Refresh browser
2. ✅ Kiểm tra Console không còn lỗi
3. ✅ Test navigate đến `/dashboard/courses/:id`
4. ✅ Test load course data
5. ✅ Test các tabs hoạt động bình thường

---

## 📚 TÀI LIỆU THAM KHẢO

- [Next.js 16 - Dynamic APIs](https://nextjs.org/docs/app/api-reference/functions/use-params)
- [React.use() Documentation](https://react.dev/reference/react/use)

---

**Status:** ✅ Fixed - All dynamic route pages updated

