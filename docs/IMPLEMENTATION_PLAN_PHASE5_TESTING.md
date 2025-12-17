# PHASE 5: TESTING & DEPLOYMENT

**Mục tiêu:** Đảm bảo chất lượng và triển khai production

**Thời gian ước tính:** 1-2 tuần

---

## 📋 CHECKLIST

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing
- [ ] Security audit

### Deployment
- [ ] Environment setup
- [ ] Database migration (production)
- [ ] Backend deployment
- [ ] Frontend deployment
- [ ] Monitoring setup
- [ ] Backup strategy

---

## 1. TESTING

### 1.1. Unit Tests

**Backend:**
- Service layer tests
- Utility function tests
- Model validation tests

**Frontend:**
- Component tests
- Hook tests
- Utility function tests

**Coverage Target:** > 80%

**Tools:**
- Backend: Jest
- Frontend: Jest + React Testing Library

**Checklist:**
- [ ] Backend unit tests
- [ ] Frontend unit tests
- [ ] Coverage reports
- [ ] CI/CD integration

---

### 1.2. Integration Tests

**Backend:**
- API endpoint tests
- Database integration tests
- External service tests (payment gateways)

**Frontend:**
- API integration tests (mock)
- Component integration tests

**Tools:**
- Backend: Jest + Supertest
- Frontend: Jest + MSW (Mock Service Worker)

**Checklist:**
- [ ] API endpoint tests
- [ ] Database integration tests
- [ ] Payment gateway tests
- [ ] Frontend API integration tests

---

### 1.3. E2E Tests

**Critical Flows:**
1. User registration & login
2. Course browsing & booking
3. Payment flow
4. User dashboard
5. CMS: Course creation
6. CMS: Enrollment management
7. CMS: Payment processing

**Tools:**
- Playwright (recommended)
- Cypress (alternative)

**Checklist:**
- [ ] User registration & login flow
- [ ] Course browsing & booking flow
- [ ] Payment flow
- [ ] User dashboard flow
- [ ] CMS course creation flow
- [ ] CMS enrollment management flow
- [ ] CMS payment processing flow

---

### 1.4. Performance Testing

**Backend:**
- API response time
- Database query performance
- Load testing
- Stress testing

**Frontend:**
- Page load time
- Time to interactive (TTI)
- Lighthouse scores
- Bundle size

**Tools:**
- Backend: Apache JMeter, k6, Artillery
- Frontend: Lighthouse, WebPageTest

**Targets:**
- API response time: < 200ms (p95)
- Page load time: < 3s
- Lighthouse score: > 90
- Bundle size: < 500KB (initial)

**Checklist:**
- [ ] API performance testing
- [ ] Database query optimization
- [ ] Load testing
- [ ] Frontend performance testing
- [ ] Bundle size optimization
- [ ] Image optimization

---

### 1.5. Security Testing & Audit

**Priority:** 🔴 CRITICAL - Phải pass trước khi deploy production

**Reference:** [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) | [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)

**Areas to Check:**
- Authentication & authorization
- SQL injection prevention
- XSS prevention
- CSRF protection
- API security
- File upload security
- Input validation & sanitization
- Data encryption
- Secrets management
- Security headers
- Rate limiting
- Password policy

**Tools:**
- OWASP ZAP - Security testing
- Burp Suite - Penetration testing
- Snyk - Vulnerability scanning
- npm audit - Dependency scanning
- Manual security review

**Security Audit Checklist:**

#### Critical Items (Phải pass trước khi deploy):
- [ ] CSRF protection implemented và tested
- [ ] Input sanitization implemented và tested
- [ ] Helmet.js configured và verified
- [ ] File upload security verified
- [ ] Environment variables validated
- [ ] HTTPS enforced
- [ ] Security headers verified (X-Frame-Options, CSP, HSTS, v.v.)
- [ ] Rate limiting tested
- [ ] Password policy implemented
- [ ] No critical/high vulnerabilities in dependencies (`npm audit`)
- [ ] Security logging working
- [ ] Error messages không expose sensitive info trong production

#### High Priority Items:
- [ ] Authentication security tested
- [ ] Authorization checks tested
- [ ] SQL injection prevention tested
- [ ] XSS prevention tested
- [ ] API rate limiting tested per endpoint
- [ ] Secrets management verified
- [ ] Account lockout tested
- [ ] Session management tested

#### Medium Priority Items:
- [ ] Penetration testing (optional)
- [ ] Data encryption at rest
- [ ] Dependency scanning automated (CI/CD)

**Security Testing Steps:**

1. **Automated Scanning:**
```bash
# Dependency vulnerabilities
npm audit
npm audit --audit-level=high

# Security testing với OWASP ZAP
# (cần setup OWASP ZAP và run scan)

# Snyk scanning
snyk test
snyk monitor
```

2. **Manual Testing:**
- Test CSRF protection với các POST/PUT/DELETE requests
- Test XSS với các input fields
- Test SQL injection với các query parameters
- Test file upload với malicious files
- Test rate limiting với nhiều requests
- Test authentication bypass attempts
- Test authorization với different roles

3. **Security Headers Verification:**
```bash
curl -I https://your-domain.com | grep -i "x-frame-options\|x-content-type-options\|strict-transport-security\|content-security-policy"
```

4. **Checklist Verification:**
- Review [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)
- Đảm bảo tất cả CRITICAL items đã được check
- Ít nhất 80% HIGH items đã được check

**Checklist:**
- [ ] Security audit checklist completed
- [ ] CSRF protection tested
- [ ] XSS vulnerability tested
- [ ] SQL injection tested
- [ ] File upload security tested
- [ ] Authentication & authorization tested
- [ ] Rate limiting tested
- [ ] Security headers verified
- [ ] Dependency vulnerability scanning passed
- [ ] Penetration testing (optional)
- [ ] Security documentation updated

---

## 2. DEPLOYMENT

### 2.1. Environment Setup

**Environments:**
- Development
- Staging
- Production

**Configuration:**
- Environment variables
- Database connections
- API endpoints
- Payment gateway credentials

**Checklist:**
- [ ] Development environment
- [ ] Staging environment
- [ ] Production environment
- [ ] Environment variables setup
- [ ] Secrets management

---

### 2.2. Database Migration (Production)

**Steps:**
1. Backup production database
2. Run migration scripts
3. Verify data integrity
4. Monitor performance

**Checklist:**
- [ ] Production database backup
- [ ] Migration scripts review
- [ ] Migration execution
- [ ] Data integrity verification
- [ ] Performance monitoring
- [ ] Rollback plan ready

---

### 2.3. Backend Deployment

**Options:**
- VPS (DigitalOcean, Linode, v.v.)
- Cloud (AWS, GCP, Azure)
- Platform (Heroku, Railway, Render)

**Steps:**
1. Build application
2. Setup server
3. Configure environment
4. **Setup shared-storage** (ở root project)
5. Deploy application
6. Setup reverse proxy (Nginx)
7. Setup SSL certificate
8. Configure monitoring

**Shared Storage Setup:**
- Tạo thư mục `shared-storage/` ở root project
- Tạo `shared-storage/uploads/` và `shared-storage/temp/`
- Set permissions: `chmod 755 shared-storage/uploads`
- Configure environment variable: `SHARED_STORAGE_PATH=/path/to/shared-storage`
- **Lưu ý:** Shared storage không nằm trong cms-backend hay public-backend

**Checklist:**
- [ ] Server setup
- [ ] Shared storage setup (ở root)
- [ ] Application build
- [ ] Environment configuration
- [ ] Application deployment
- [ ] Reverse proxy setup
- [ ] SSL certificate
- [ ] Domain configuration
- [ ] Health check endpoints

---

### 2.4. Frontend Deployment

**Options:**
- Vercel (recommended for Next.js)
- Netlify
- VPS với Nginx
- Cloud (AWS S3 + CloudFront)

**Steps:**
1. Build application
2. Deploy to hosting
3. Configure environment variables
4. Setup domain
5. Configure CDN (if needed)

**Checklist:**
- [ ] Application build
- [ ] Environment variables
- [ ] Deployment to hosting
- [ ] Domain configuration
- [ ] CDN setup (if needed)
- [ ] SSL certificate

---

### 2.5. Monitoring Setup

**Monitoring Tools:**
- Application monitoring: Sentry, LogRocket
- Server monitoring: Datadog, New Relic
- Uptime monitoring: UptimeRobot, Pingdom
- Log aggregation: Logtail, Papertrail

**Metrics to Monitor:**
- API response time
- Error rates
- Server resources (CPU, memory, disk)
- Database performance
- User activity

**Checklist:**
- [ ] Application monitoring
- [ ] Server monitoring
- [ ] Uptime monitoring
- [ ] Log aggregation
- [ ] Alert configuration
- [ ] Dashboard setup

---

### 2.6. Backup Strategy

**Backup Types:**
- Database backups (daily)
- **Shared storage backups** (daily) - `shared-storage/uploads/`
- Code backups (Git)

**Backup Storage:**
- Cloud storage (AWS S3, Google Cloud Storage)
- Local storage (for quick restore)

**Shared Storage Backup:**
- Backup `shared-storage/uploads/` (files đã upload)
- Không cần backup `shared-storage/temp/` (files tạm thời)
- Backup path: `../../shared-storage/uploads/` (từ backend projects)

**Retention:**
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months

**Checklist:**
- [ ] Database backup automation
- [ ] Shared storage backup automation
- [ ] Backup storage setup
- [ ] Backup retention policy
- [ ] Restore testing

---

## 3. CI/CD PIPELINE

### 3.1. Continuous Integration

**Steps:**
1. Code push to repository
2. Run tests
3. Run linters
4. Build application
5. Run security scans

**Tools:**
- GitHub Actions
- GitLab CI
- CircleCI
- Jenkins

**Checklist:**
- [ ] CI pipeline setup
- [ ] Test automation
- [ ] Linter automation
- [ ] Build automation
- [ ] Security scan automation

---

### 3.2. Continuous Deployment

**Steps:**
1. Merge to main branch
2. Run tests
3. Build application
4. Deploy to staging
5. Run E2E tests
6. Deploy to production (manual approval)

**Checklist:**
- [ ] CD pipeline setup
- [ ] Staging deployment automation
- [ ] Production deployment (manual approval)
- [ ] Rollback automation

---

## 4. DOCUMENTATION

### 4.1. API Documentation

**Tools:**
- Swagger/OpenAPI
- Postman collection

**Content:**
- Endpoint descriptions
- Request/Response schemas
- Authentication
- Examples

**Checklist:**
- [ ] API documentation
- [ ] Postman collection
- [ ] Authentication guide

---

### 4.2. User Documentation

**Content:**
- User guide
- FAQ
- Troubleshooting

**Checklist:**
- [ ] User guide
- [ ] FAQ
- [ ] Troubleshooting guide

---

### 4.3. Developer Documentation

**Content:**
- Setup guide
- Architecture overview
- Development workflow
- Deployment guide

**Checklist:**
- [ ] Setup guide
- [ ] Architecture documentation
- [ ] Development workflow
- [ ] Deployment guide

---

## 5. LAUNCH CHECKLIST

### Pre-Launch
- [ ] All tests passing
- [ ] Performance targets met
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Backup strategy in place
- [ ] Monitoring setup
- [ ] Team training

### Launch Day
- [ ] Final database backup
- [ ] Deploy to production
- [ ] Verify deployment
- [ ] Monitor for issues
- [ ] Team on standby

### Post-Launch
- [ ] Monitor metrics
- [ ] Collect user feedback
- [ ] Fix critical issues
- [ ] Performance optimization
- [ ] Documentation updates

---

## 6. CHECKLIST TỔNG KẾT

### Testing ✅
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing
- [ ] Security audit

### Deployment ✅
- [ ] Environment setup
- [ ] Database migration
- [ ] Shared storage setup (ở root)
- [ ] CMS Backend deployment
- [ ] Public Backend deployment
- [ ] CMS Frontend deployment
- [ ] Public Frontend deployment
- [ ] Monitoring setup
- [ ] Backup strategy (database + shared-storage)

### CI/CD ✅
- [ ] CI pipeline
- [ ] CD pipeline

### Documentation ✅
- [ ] API documentation
- [ ] User documentation
- [ ] Developer documentation

### Launch ✅
- [ ] Pre-launch checklist
- [ ] Launch day
- [ ] Post-launch monitoring

---

## TÓM TẮT

**Phase 5: Testing & Deployment** bao gồm:
1. ✅ Comprehensive testing
2. ✅ Production deployment
3. ✅ Monitoring & backup
4. ✅ CI/CD pipeline
5. ✅ Documentation

**Kết quả:** Hệ thống IPD8 hoàn chỉnh, đã test, đã deploy production, sẵn sàng sử dụng.

---

## NEXT STEPS

Sau khi hoàn thành Phase 5:
1. Monitor hệ thống trong 1-2 tuần đầu
2. Thu thập feedback từ users
3. Fix bugs và optimize performance
4. Plan features cho version tiếp theo

