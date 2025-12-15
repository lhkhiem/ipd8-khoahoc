# IPD8 Production Deployment

Thư mục này chứa các file production build để deploy lên VPS.

## 📦 Nội dung

- `.next/` - Next.js production build output
- `public/` - Static files (images, fonts, etc.)
- `package.json` - Production dependencies
- `next.config.js` - Next.js configuration
- `package-lock.json` - Locked dependencies versions

## 🚀 Hướng dẫn Deploy lên VPS

### 1. Upload files lên VPS

Upload toàn bộ nội dung thư mục `deploy` lên VPS (sử dụng SCP, FTP, hoặc Git).

```bash
# Ví dụ với SCP
scp -r deploy/* user@your-vps:/path/to/app/
```

### 2. Cài đặt trên VPS

SSH vào VPS và chạy:

```bash
cd /path/to/app
npm install --production
```

### 3. Cấu hình Environment Variables

Tạo file `.env.production` trên VPS:

```bash
# Tạo file .env.production
nano .env.production
```

Thêm các biến môi trường cần thiết:

```env
# Server
NODE_ENV=production
PORT=3100

# Next.js
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com

# Security (thay đổi các giá trị này)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://yourdomain.com
```

### 4. Chạy ứng dụng

#### Option 1: Chạy trực tiếp

```bash
npm start
```

#### Option 2: Sử dụng PM2 (Khuyến nghị)

```bash
# Cài đặt PM2 (nếu chưa có)
npm install -g pm2

# Chạy với PM2
pm2 start npm --name "ipd8-web" -- start

# Lưu cấu hình PM2
pm2 save

# Thiết lập khởi động cùng hệ thống
pm2 startup
```

#### Option 3: Sử dụng systemd

Tạo file `/etc/systemd/system/ipd8-web.service`:

```ini
[Unit]
Description=IPD8 Web Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/app
Environment=NODE_ENV=production
Environment=PORT=3100
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Sau đó:

```bash
sudo systemctl daemon-reload
sudo systemctl enable ipd8-web
sudo systemctl start ipd8-web
```

### 5. Cấu hình Nginx (Reverse Proxy)

Tạo file `/etc/nginx/sites-available/ipd8`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificate (sử dụng Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt site:

```bash
sudo ln -s /etc/nginx/sites-available/ipd8 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Bảo mật

### Checklist bảo mật:

- [x] Không commit `.env` files vào Git
- [x] Sử dụng HTTPS với SSL certificate
- [x] Cấu hình firewall (chỉ mở port 80, 443)
- [x] Security headers đã được cấu hình trong `next.config.js`
- [x] Sử dụng strong passwords và secrets
- [ ] Cấu hình rate limiting
- [ ] Thiết lập monitoring và logging
- [ ] Backup database định kỳ (nếu có)

### Firewall Configuration

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 📊 Monitoring

### PM2 Monitoring

```bash
# Xem logs
pm2 logs ipd8-web

# Xem status
pm2 status

# Monitor realtime
pm2 monit
```

### Systemd Logs

```bash
# Xem logs
sudo journalctl -u ipd8-web -f

# Xem status
sudo systemctl status ipd8-web
```

## 🔄 Cập nhật ứng dụng

Khi có version mới:

1. Build lại production: `npm run build` (từ project root)
2. Chạy script build: `.\deploy\build-deploy.ps1`
3. Upload thư mục `deploy` mới lên VPS
4. Trên VPS:
   ```bash
   cd /path/to/app
   npm install --production
   pm2 restart ipd8-web
   # hoặc
   sudo systemctl restart ipd8-web
   ```

## 📝 Notes

- Node.js version yêu cầu: 18.x hoặc cao hơn
- Port mặc định: 3100 (có thể thay đổi trong .env.production)
- Đảm bảo VPS có đủ RAM (tối thiểu 512MB, khuyến nghị 1GB+)

## 🆘 Troubleshooting

### Ứng dụng không khởi động

```bash
# Kiểm tra logs
pm2 logs ipd8-web
# hoặc
sudo journalctl -u ipd8-web -n 50

# Kiểm tra port đang được sử dụng
sudo netstat -tlnp | grep 3100

# Kiểm tra environment variables
printenv | grep NODE
```

### Lỗi build

Đảm bảo đã chạy `npm run build` thành công trước khi copy vào deploy.

### Lỗi module not found

```bash
cd /path/to/app
rm -rf node_modules package-lock.json
npm install --production
```

