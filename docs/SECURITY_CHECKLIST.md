# SECURITY CHECKLIST - IPD8 PROJECT

Checklist nhanh để đảm bảo bảo mật trước khi deploy production.

---

## 🔴 CRITICAL (Phải có trước khi deploy)

### Authentication & Authorization
- [ ] JWT tokens sử dụng httpOnly cookies
- [ ] Passwords được hash với bcrypt (salt rounds >= 10)
- [ ] JWT secret đủ mạnh (>= 32 characters)
- [ ] Token expiration được set hợp lý
- [ ] Role-based access control (RBAC) được implement
- [ ] Auth middleware bảo vệ tất cả protected routes

### CSRF Protection
- [ ] CSRF tokens được generate và validate
- [ ] CSRF protection áp dụng cho tất cả state-changing requests (POST/PUT/DELETE/PATCH)
- [ ] CSRF token endpoint được expose

### Input Validation & Sanitization
- [ ] Tất cả user input được validate
- [ ] Input được sanitize trước khi lưu database
- [ ] XSS protection: HTML được escape khi render
- [ ] SQL injection: Sử dụng parameterized queries
- [ ] Path traversal: Filenames được sanitize
- [ ] Command injection: Không có shell command execution với user input

### Security Headers
- [ ] Helmet.js được cài đặt và cấu hình
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Strict-Transport-Security (HSTS) enabled
- [ ] Content-Security-Policy (CSP) được cấu hình đúng
- [ ] Referrer-Policy được set

### File Upload Security
- [ ] File type validation (MIME type + extension)
- [ ] File size limits được set
- [ ] Filenames được sanitize
- [ ] Uploaded files được scan (malware detection)
- [ ] File content được verify (không chỉ dựa vào extension)
- [ ] Upload directory không thể execute scripts
- [ ] Path traversal protection

### Environment Variables
- [ ] Tất cả secrets được lưu trong environment variables
- [ ] .env file không được commit vào git
- [ ] .env.example được tạo và commit
- [ ] Environment variables được validate khi app start
- [ ] JWT_SECRET đủ mạnh (>= 32 characters)
- [ ] Database credentials không hardcode

### HTTPS & SSL
- [ ] HTTPS được enable trong production
- [ ] HTTP → HTTPS redirect được cấu hình
- [ ] SSL certificate hợp lệ và không hết hạn
- [ ] HSTS được enable với max-age >= 31536000

---

## 🟡 HIGH (Nên có)

### Rate Limiting
- [ ] Rate limiting được implement
- [ ] Rate limits khác nhau cho từng endpoint
- [ ] Auth endpoints có rate limit nghiêm ngặt hơn
- [ ] IP blocking khi vượt quá limit
- [ ] Rate limit headers được trả về

### Password Policy
- [ ] Password minimum length (>= 8 characters)
- [ ] Password complexity requirements (uppercase, lowercase, number, special char)
- [ ] Account lockout sau nhiều lần đăng nhập sai
- [ ] Password expiration (optional)
- [ ] Password history (không cho dùng lại password cũ)

### Logging & Monitoring
- [ ] Security events được log
- [ ] Failed login attempts được log
- [ ] Suspicious activities được detect và alert
- [ ] Logs không chứa sensitive data (passwords, tokens)
- [ ] Log rotation được cấu hình

### CORS Configuration
- [ ] CORS được cấu hình với whitelist origins
- [ ] Credentials được enable đúng cách
- [ ] Development và production origins được tách biệt
- [ ] Wildcard (*) không được dùng trong production

### Error Handling
- [ ] Error messages không expose sensitive information trong production
- [ ] Stack traces không được hiển thị trong production
- [ ] Generic error messages cho users
- [ ] Detailed errors chỉ trong development mode

### Dependency Security
- [ ] `npm audit` được chạy thường xuyên
- [ ] Dependencies được update khi có security patches
- [ ] Không có high/critical vulnerabilities
- [ ] CI/CD có security checks

---

## 🟢 MEDIUM (Nice to have)

### Session Management
- [ ] Session timeout được cấu hình
- [ ] Concurrent session limits
- [ ] Session invalidation on logout
- [ ] Session fixation protection

### Data Encryption
- [ ] Database encryption at rest
- [ ] File uploads được encrypt
- [ ] Backups được encrypt
- [ ] Sensitive data được encrypt trong database

### Security Testing
- [ ] Automated security tests
- [ ] Penetration testing được thực hiện định kỳ
- [ ] Vulnerability scanning
- [ ] Code review cho security issues

### API Security
- [ ] API versioning
- [ ] API rate limiting per user
- [ ] API authentication required
- [ ] API documentation không expose sensitive endpoints

---

## ✅ QUICK SECURITY SCAN

Chạy các lệnh sau để kiểm tra nhanh:

```bash
# 1. Check for vulnerabilities
npm audit
npm audit --audit-level=high

# 2. Check for outdated packages
npm outdated

# 3. Check for exposed secrets (nếu có git-secrets)
git secrets --scan

# 4. Check for .env files in git
git ls-files | grep -E "\.env$|\.env\.local$|\.env\.production$"

# 5. Check for hardcoded secrets
grep -r "password\|secret\|key\|token" --include="*.ts" --include="*.js" src/ | grep -v "process.env"

# 6. Check for dangerous functions
grep -r "eval\|Function\|innerHTML\|dangerouslySetInnerHTML" --include="*.ts" --include="*.tsx" src/

# 7. Check for SQL injection risks
grep -r "sequelize.query\|pool.query" --include="*.ts" src/ | grep -v "replacements\|bind"

# 8. Check security headers
curl -I https://your-domain.com | grep -i "x-frame-options\|x-content-type-options\|strict-transport-security"
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Trước khi deploy production, đảm bảo:

- [ ] Tất cả items trong CRITICAL section đã được check
- [ ] Ít nhất 80% items trong HIGH section đã được check
- [ ] `npm audit` không có critical/high vulnerabilities
- [ ] Tất cả environment variables đã được set
- [ ] HTTPS được enable
- [ ] Security headers được verify
- [ ] Rate limiting được test
- [ ] File upload security được test
- [ ] CSRF protection được test
- [ ] Error handling không expose sensitive info
- [ ] Logs không chứa sensitive data
- [ ] Backup và recovery plan đã được chuẩn bị

---

## 🚨 EMERGENCY RESPONSE

Nếu phát hiện lỗ hổng bảo mật:

1. **Ngay lập tức:**
   - [ ] Đánh giá mức độ nghiêm trọng
   - [ ] Xác định phạm vi ảnh hưởng
   - [ ] Thông báo team security

2. **Trong 1 giờ:**
   - [ ] Tạo fix hoặc workaround
   - [ ] Test fix
   - [ ] Deploy fix

3. **Trong 24 giờ:**
   - [ ] Document incident
   - [ ] Review và cải thiện security
   - [ ] Update security checklist

---

**Last Updated:** 2025-01-XX  
**Status:** 🔴 CẦN HOÀN THÀNH TRƯỚC KHI DEPLOY


















