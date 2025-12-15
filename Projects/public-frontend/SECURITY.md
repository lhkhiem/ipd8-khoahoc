# Security Documentation - IPD8 Frontend

## Tổng quan

Tài liệu này mô tả các biện pháp bảo mật đã được triển khai trong ứng dụng IPD8 Frontend để bảo vệ khỏi các lỗ hổng bảo mật phổ biến, đặc biệt là React2Shell (CVE-2025-55182) và các lỗ hổng Next.js khác.

## Các lỗ hổng đã được khắc phục

### 1. React2Shell (CVE-2025-55182)
**Mô tả:** Lỗ hổng cho phép kẻ tấn công thực thi lệnh shell thông qua React Server Components.

**Giải pháp:**
- Tất cả user input được validate và sanitize trước khi render
- Không có server-side command execution
- Sử dụng TypeScript để type-check tất cả inputs
- Validation nghiêm ngặt cho route parameters

### 2. Cross-Site Scripting (XSS)
**Mô tả:** Lỗ hổng cho phép kẻ tấn công inject mã JavaScript độc hại.

**Giải pháp:**
- Tất cả user input được sanitize bằng `sanitizeText()` trước khi render
- URL validation nghiêm ngặt cho `window.open()` và iframe `src`
- Content Security Policy (CSP) headers được cấu hình
- Không sử dụng `dangerouslySetInnerHTML` hoặc `innerHTML` với user input

### 3. Open Redirect
**Mô tả:** Lỗ hổng cho phép kẻ tấn công redirect người dùng đến trang web độc hại.

**Giải pháp:**
- Tất cả URLs được validate bằng `sanitizeUrl()` trước khi sử dụng
- Chỉ cho phép các domain được whitelist
- `window.open()` được wrap trong `safeWindowOpen()` với validation

### 4. Path Traversal
**Mô tả:** Lỗ hổng cho phép truy cập file ngoài thư mục được phép.

**Giải pháp:**
- File names được sanitize bằng `sanitizeFileName()`
- Route parameters được validate bằng `validateId()` và `validateSlug()`

### 5. Input Validation
**Mô tả:** Thiếu validation cho user input dẫn đến các lỗ hổng khác.

**Giải pháp:**
- Sử dụng Zod schema validation cho tất cả forms
- Regex validation cho email, phone, và các input đặc biệt
- Giới hạn độ dài input để tránh DoS
- Type checking với TypeScript

## Security Headers

Các security headers sau đã được cấu hình trong `next.config.js`:

- **Strict-Transport-Security (HSTS):** Bắt buộc HTTPS
- **X-Frame-Options:** Ngăn chặn clickjacking
- **X-Content-Type-Options:** Ngăn chặn MIME type sniffing
- **X-XSS-Protection:** Bảo vệ khỏi XSS cơ bản
- **Referrer-Policy:** Kiểm soát thông tin referrer
- **Permissions-Policy:** Giới hạn các tính năng trình duyệt
- **Content-Security-Policy (CSP):** Kiểm soát nghiêm ngặt các resource được load

## Security Utilities

File `src/lib/security.ts` cung cấp các utility functions:

### `sanitizeUrl(url, allowedDomains?)`
- Validate và sanitize URLs
- Chỉ cho phép HTTPS/HTTP protocols
- Whitelist domains
- Ngăn chặn javascript:, data:, vbscript: protocols

### `sanitizeIframeUrl(url)`
- Validate URLs cho iframe embedding
- Chỉ cho phép YouTube, Google Meet, Zoom

### `sanitizeText(text)`
- Escape HTML special characters
- Ngăn chặn XSS qua text content

### `validateId(id)`
- Validate route ID parameters
- Chỉ cho phép alphanumeric, dash, underscore
- Giới hạn độ dài 100 ký tự

### `validateSlug(slug)`
- Validate slug parameters
- Chỉ cho phép lowercase, numbers, hyphens
- Giới hạn độ dài 200 ký tự

### `safeWindowOpen(url, target?)`
- Mở URL an toàn trong window mới
- Validate URL trước khi mở
- Thêm `noopener,noreferrer` để bảo vệ

### `sanitizeFileName(filename)`
- Sanitize file names
- Ngăn chặn path traversal
- Loại bỏ ký tự nguy hiểm

## Form Validation

Tất cả forms sử dụng Zod schema validation với các rules:

- **Email:** Format validation, max length 255
- **Phone:** Regex validation cho số Việt Nam, max length 15
- **Name:** Chỉ cho phép chữ cái và khoảng trắng, max length 100
- **Message:** Min 10 ký tự, max 2000 ký tự
- **Address:** Max length 500 ký tự

## Authentication Security

### Hiện tại (Development)
- User data lưu trong localStorage (chỉ cho development)
- Email được sanitize trước khi lưu
- JSON parsing có error handling

### Khuyến nghị cho Production
- **KHÔNG** lưu sensitive data trong localStorage
- Sử dụng httpOnly cookies cho authentication tokens
- Implement proper session management
- Sử dụng JWT với expiration
- Implement CSRF protection
- Rate limiting cho login attempts

## API Security (Khi tích hợp Backend)

Khi tích hợp với backend API, cần đảm bảo:

1. **HTTPS Only:** Tất cả API calls phải qua HTTPS
2. **Authentication:** Sử dụng Bearer tokens hoặc cookies
3. **Input Validation:** Validate tất cả inputs ở cả client và server
4. **Rate Limiting:** Implement rate limiting cho API endpoints
5. **CORS:** Cấu hình CORS đúng cách, chỉ cho phép trusted origins
6. **Error Handling:** Không expose sensitive error messages
7. **SQL Injection:** Sử dụng parameterized queries (nếu có database)

## Best Practices

1. **Không bao giờ:**
   - Render user input trực tiếp mà không sanitize
   - Sử dụng `eval()`, `Function()`, hoặc `innerHTML` với user input
   - Trust client-side validation - luôn validate ở server
   - Lưu sensitive data trong localStorage
   - Hardcode credentials hoặc API keys

2. **Luôn luôn:**
   - Validate và sanitize tất cả user input
   - Sử dụng TypeScript cho type safety
   - Cập nhật dependencies thường xuyên
   - Review code trước khi merge
   - Sử dụng security headers
   - Implement proper error handling

## Dependency Security

### Kiểm tra lỗ hổng
```bash
npm audit
```

### Cập nhật dependencies
```bash
npm update
```

### Kiểm tra lỗ hổng nghiêm trọng
```bash
npm audit --audit-level=high
```

## Security Checklist

Trước khi deploy production:

- [ ] Tất cả security headers đã được cấu hình
- [ ] Tất cả user inputs đã được validate và sanitize
- [ ] Không có hardcoded credentials
- [ ] Environment variables được bảo vệ
- [ ] HTTPS được enable
- [ ] Dependencies đã được audit
- [ ] Error messages không expose sensitive information
- [ ] Rate limiting đã được implement
- [ ] Authentication sử dụng secure methods
- [ ] CORS được cấu hình đúng
- [ ] Logging không chứa sensitive data

## Reporting Security Issues

Nếu phát hiện lỗ hổng bảo mật, vui lòng:

1. **KHÔNG** tạo public issue
2. Liên hệ trực tiếp với team security
3. Cung cấp thông tin chi tiết về lỗ hổng
4. Cho phép thời gian để fix trước khi disclose

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Changelog

### 2025-01-XX
- Thêm security headers vào Next.js config
- Tạo security utility functions
- Fix XSS vulnerabilities trong window.open() và iframe
- Thêm input validation cho forms
- Validate route parameters
- Cải thiện authentication security

