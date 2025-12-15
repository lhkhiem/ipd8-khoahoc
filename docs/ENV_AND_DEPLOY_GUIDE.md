## HƯỚNG DẪN DÙNG `.env`, KEY QUAN TRỌNG VÀ DEPLOY NEXT.JS LÊN VPS (IPD8)

Tài liệu này tổng hợp cách sử dụng file `.env` và quy trình build/deploy cho dự án **public-frontend (Next.js)** trong hệ thống IPD8.

---

## 1. Khái niệm cơ bản về `.env`

- **`.env` là gì?**
  - Là file chứa **biến môi trường** (environment variables) như:
    - URL API, domain site
    - Thông tin kết nối database
    - Key bí mật (secret, token, password)
  - Mục đích:
    - Không hard-code giá trị nhạy cảm vào source.
    - Dễ thay đổi cấu hình theo môi trường: dev / staging / production.
    - Không commit các giá trị bí mật lên Git.

- **Cách truy cập trong code Next.js / Node.js**
  - Sử dụng `process.env.MY_VARIABLE`.
  - Các biến bắt đầu bằng `NEXT_PUBLIC_` sẽ được **public ra phía browser** (client-side).

- **Nguyên tắc bảo mật**
  - Biến nào chứa **bí mật** (password, token, secret, connection string, v.v.):
    - **Không dùng prefix `NEXT_PUBLIC_`**.
    - Chỉ được dùng ở server-side (API route, server component, backend).
  - Chỉ dùng `NEXT_PUBLIC_` cho các giá trị **không nhạy cảm** nhưng cần cho client (ví dụ: public API base URL, Google Analytics ID).

---

## 2. Các loại file `.env` trong Next.js

Next.js hỗ trợ nhiều file `.env` cho từng môi trường. Thứ tự ưu tiên (từ cao xuống thấp):

### 2.1. Khi chạy DEV (`npm run dev`)

Thứ tự load:

1. `.env.development.local`
2. `.env.local`
3. `.env.development`
4. `.env`

**Khuyến nghị:** dùng **`.env.local`** cho môi trường dev trên máy lập trình viên.

### 2.2. Khi BUILD / START PRODUCTION (`npm run build`, `npm run start`)

Mặc định `NODE_ENV=production`. Thứ tự load:

1. `.env.production.local`
2. `.env.local`
3. `.env.production`
4. `.env`

**Khuyến nghị:**

- Dùng **`.env.production`** (và/hoặc `.env.production.local`) cho môi trường production trên VPS.
- `.env.local` chủ yếu dành cho môi trường local, **không nên** dùng trên server production để tránh nhầm lẫn.

---

## 3. File `env.example` trong dự án IPD8

Đường dẫn: `Projects/public-frontend/deploy/env.example`

Một số biến quan trọng:

- **Node/Server**
  - `NODE_ENV=production`
  - `PORT=3100` (phải khớp với cấu hình reverse proxy, ví dụ Nginx)

- **Biến public (exposed ra client)**
  - `NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com`
  - `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`

- **Authentication (ví dụ NextAuth)**
  - `NEXTAUTH_SECRET` – chuỗi bí mật, **tuyệt đối không public**.
  - `NEXTAUTH_URL=https://yourdomain.com`

- **Database (nếu dùng)**
  - `DATABASE_URL=postgresql://user:password@localhost:5432/ipd8_db`

- **SMTP / Email, Analytics, Security**
  - `SMTP_SERVER`, `SMTP_USER`, `SMTP_PASSWORD`, `GOOGLE_ANALYTICS_ID`, …  
  → Đều là config nhạy cảm, chỉ nên để ở file env trên server.

**Cách dùng file mẫu:**

- Trên server:

  ```bash
  cp deploy/env.example .env.production
  # Sau đó chỉnh sửa các giá trị cho đúng môi trường production
  ```

- Trên máy dev:

  ```bash
  cp deploy/env.example .env.local
  # Sau đó chỉnh các giá trị phù hợp môi trường dev (API local, v.v.)
  ```

---

## 4. Môi trường DEV (local)

### 4.1. Mục tiêu

- Lập trình viên phát triển trên máy cá nhân.
- Sử dụng cấu hình env riêng, không ảnh hưởng production.

### 4.2. Các bước thiết lập

1. Tại thư mục `public-frontend`, tạo file **`.env.local`**:

   ```bash
   cp deploy/env.example .env.local
   ```

2. Sửa giá trị trong `.env.local`, ví dụ:
   - `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` (API local)
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
   - Database/SMTP nếu cần test local.

3. Chạy dev:

   ```bash
   npm install      # lần đầu
   npm run dev
   ```

4. **Không commit `.env.local`** (đã được ignore trong `.gitignore`).

---

## 5. Build và Deploy Production lên VPS

### 5.1. Sai lầm thường gặp (nên tránh)

- Build trên máy local (Windows/macOS) rồi upload thư mục `.next` lên VPS (Linux).
  - Có thể gây:
    - Lỗi do khác biệt HĐH/kiến trúc (đặc biệt với các package native).
    - Lỗi cross-domain/CORS vì env lúc build trên local khác với env thực tế trên VPS.
  - Khi thay đổi `.env` trên VPS mà **không build lại**, các biến `NEXT_PUBLIC_...` trên client **không được cập nhật** (vì đã được embed vào bundle lúc build).

**Kết luận:** Cách an toàn và chuẩn nhất là **build trực tiếp trên VPS**.

### 5.2. Quy trình CHUẨN: Upload source code, build trên VPS

Giả sử VPS chạy Linux (Ubuntu) và dự án ở thư mục `/var/www/ipd8/public-frontend`.

#### Bước 1: Upload source code

- Trên máy dev:
  - Chỉ cần upload **source code**:
    - Thư mục `public-frontend` (chứa `src`, `public`, `next.config.js`, `package.json`, v.v.)
  - **Không cần** upload:
    - `node_modules/`
    - `.next/`
    - `.git/`
    - `.env.local`

#### Bước 2: Cài đặt trên VPS

Trên VPS:

```bash
cd /var/www/ipd8/public-frontend

# Cài Node.js (nên dùng phiên bản LTS, trùng/khớp với dev)
# Cài dependencies
npm install
```

#### Bước 3: Tạo file `.env.production`

```bash
cp deploy/env.example .env.production
```

Sau đó chỉnh sửa `.env.production`:

- `NEXT_PUBLIC_API_BASE_URL=https://api.ipd8.vn` (ví dụ)
- `NEXT_PUBLIC_SITE_URL=https://ipd8.vn`
- `NEXTAUTH_SECRET=` chuỗi random bảo mật
- Thông tin DB, SMTP, Analytics thật của môi trường production.

#### Bước 4: Build và chạy app

```bash
npm run build
npm run start   # hoặc dùng PM2 / systemd để chạy nền
```

Khi đó:

- Build sử dụng đúng env của server (`.env.production`).
- Không bị lỗi khác biệt HĐH.
- Không bị lệch env giữa lúc build và lúc chạy.

---

## 6. Gợi ý cấu trúc deploy & cross-domain

Để hạn chế lỗi cross-domain/CORS:

- **Ưu tiên**:
  - Đặt frontend và backend cùng **domain chính**, khác **subpath** hoặc **subdomain**.
  - Ví dụ:
    - Frontend: `https://ipd8.vn`
    - API: `https://api.ipd8.vn`

- Trong `.env.production` của frontend:
  - `NEXT_PUBLIC_API_BASE_URL=https://api.ipd8.vn`
  - `NEXT_PUBLIC_SITE_URL=https://ipd8.vn`

- Trên Nginx (hoặc reverse proxy khác):
  - Cấu hình proxy từ `ipd8.vn` đến port chạy Next.js (ví dụ 3100).
  - Cấu hình proxy từ `api.ipd8.vn` đến backend API.

- Trên backend:
  - Cấu hình CORS cho phép origin là `https://ipd8.vn` (và các domain liên quan nếu cần).

---

## 7. Bộ key env quan trọng cho kiến trúc tách biệt CMS & Public

Hệ thống IPD8 có kiến trúc tách biệt:

- `cms-frontend` ↔ `cms-backend`
- `public-frontend` ↔ `public-backend`

Mỗi service có file `.env` riêng, không dùng chung. Dưới đây là bộ key **tối thiểu nên có** cho từng service.

### 7.1. `public-frontend` (Next.js – site public)

Chỉ bao gồm env **không nhạy cảm** (hoặc secret chỉ dùng server-side như `NEXTAUTH_SECRET`).

- **Thông tin site & API**
  - `NEXT_PUBLIC_SITE_URL`  
    - URL site public (ví dụ: `https://ipd8.vn`).
  - `NEXT_PUBLIC_API_BASE_URL`  
    - URL `public-backend` (ví dụ: `https://api.ipd8.vn`).

- **Auth (NextAuth hoặc tương tự)**
  - `NEXTAUTH_URL`  
    - URL base của public site, dùng cho callback auth.
  - `NEXTAUTH_SECRET`  
    - Chuỗi bí mật ký session/token (chỉ dùng server-side, **không NEXT_PUBLIC_**).

- **Analytics / Tracking (không bắt buộc nhưng nên có)**
  - `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`
  - (optional) `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`, các ID tracking khác.

**Nguyên tắc:**

- Mọi gọi API từ frontend đều dựa trên `NEXT_PUBLIC_API_BASE_URL`.
- Bất kỳ biến bắt đầu bằng `NEXT_PUBLIC_` coi như public, **không chứa mật khẩu, token bí mật**.

### 7.2. `cms-frontend` (Next.js – giao diện quản trị)

Tương tự public-frontend, nhưng kết nối tới `cms-backend`.

- **Thông tin site & API**
  - `NEXT_PUBLIC_CMS_SITE_URL` (hoặc tái sử dụng `NEXT_PUBLIC_SITE_URL` nhưng nên phân biệt rõ)  
    - URL của trang CMS (ví dụ: `https://cms.ipd8.vn`).
  - `NEXT_PUBLIC_CMS_API_BASE_URL`  
    - URL `cms-backend` (ví dụ: `https://cms-api.ipd8.vn` hoặc `https://api.ipd8.vn/admin`).

- **Auth**
  - `NEXTAUTH_URL`  
    - URL base của CMS site.
  - `NEXTAUTH_SECRET`  
    - Secret cho hệ thống auth của CMS (server-side).

- **Error tracking (optional)**
  - `NEXT_PUBLIC_SENTRY_DSN` hoặc các key tracking khác.

**Nguyên tắc:**

- CMS-frontend chỉ call tới `cms-backend` qua `NEXT_PUBLIC_CMS_API_BASE_URL`, không hard-code domain.
- Nếu backend chung cho cả public & cms, vẫn nên có env riêng cho base path (`/admin` vs `/public`) để code rõ ràng.

### 7.3. `public-backend` (API cho người dùng cuối)

Chứa toàn bộ secret và logic bảo mật dành cho học viên/khách truy cập public site.

- **Cấu hình server**
  - `NODE_ENV`
  - `PORT`
  - `PUBLIC_BASE_URL`  
    - URL frontend public, dùng để generate link (reset password, email, redirect).

- **Database**
  - `DATABASE_URL`  
    - Kết nối DB chính cho public (Postgres/MySQL/...).

- **Auth / JWT / Session**
  - `JWT_SECRET` (hoặc các key tương tự).
  - `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN` (nếu dùng refresh token).
  - (optional) OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_ID`, v.v.

- **CORS / Security**
  - `CORS_ALLOWED_ORIGINS`  
    - Danh sách origin được phép (ví dụ: `https://ipd8.vn,https://www.ipd8.vn`).

- **SMTP / Email**
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASSWORD`
  - `SMTP_FROM` (email hiển thị “From:”).

- **Storage / Media (nếu dùng cloud storage)**
  - `STORAGE_PROVIDER` (`local` / `s3` / `gcs` / ...).
  - Nếu dùng S3:
    - `AWS_ACCESS_KEY_ID`
    - `AWS_SECRET_ACCESS_KEY`
    - `AWS_S3_BUCKET`
    - `AWS_S3_REGION`

- **Logging / Monitoring (optional)**
  - `SENTRY_DSN`
  - `LOG_LEVEL`

### 7.4. `cms-backend` (API cho quản trị nội dung)

Chứa secret phục vụ quản trị, thường nhạy cảm hơn vì điều khiển nội dung, khoá học, quyền user.

- **Cấu hình server**
  - `NODE_ENV`
  - `PORT`
  - `CMS_BASE_URL`  
    - URL frontend CMS, dùng cho link trong email/quy trình admin.

- **Database**
  - `DATABASE_URL`  
    - Có thể dùng cùng DB với public hoặc DB/schema riêng cho CMS, tuỳ thiết kế.

- **Auth / Role / Admin**
  - `JWT_SECRET`  
    - Có thể tách riêng với public để phân vùng token admin.
  - Các config mặc định:
    - `ADMIN_DEFAULT_EMAIL`
    - `ADMIN_DEFAULT_PASSWORD`  
      (chỉ dùng lần đầu khởi tạo, sau đó nên đổi và/hoặc vô hiệu hoá).

- **CORS**
  - `CORS_ALLOWED_ORIGINS`  
    - Origin cho phép, ví dụ: `https://cms.ipd8.vn`.

- **SMTP / Email**
  - Có thể dùng chung với public-backend:
    - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
  - Hoặc config riêng nếu CMS gửi email khác biệt (email hệ thống nội bộ).

- **Storage / Media**
  - Dùng chung hoặc riêng với public cho việc upload media:
    - `STORAGE_PROVIDER`, `AWS_*`, v.v.

- **Tích hợp khác**
  - Webhook secret
  - Key truy cập các dịch vụ ngoài (payment gateway, video provider, v.v.).

---

## 8. Tóm tắt nhanh

- **DEV (local)**:
  - Dùng **`.env.local`**, chạy `npm run dev`.
  - Không commit `.env.local`.

- **BUILD / PROD trên VPS**:
  - Upload **source code**, không upload `.next` / `node_modules`.
  - Trên VPS:
    - Tạo **`.env.production`** từ `deploy/env.example`.
    - `npm install`
    - `npm run build`
    - `npm run start`

- **Lý do không build trên local rồi upload**:
  - Tránh lỗi khác biệt HĐH.
  - Tránh lệch env (đặc biệt các biến `NEXT_PUBLIC_...` gây cross-domain/CORS).

- **Mỗi service có bộ env riêng**:
  - `public-frontend`, `public-backend`, `cms-frontend`, `cms-backend` đều có file `.env` riêng, với các key tối thiểu đã liệt kê ở mục 7.

Tài liệu này dùng làm chuẩn nội bộ cho việc cấu hình `.env` và deploy dự án **public-frontend (Next.js)** cũng như định nghĩa **bộ env tối thiểu cho toàn kiến trúc IPD8**. Khi có thay đổi kiến trúc (CI/CD, Docker, Kubernetes, v.v.), cần cập nhật lại cho phù hợp.
