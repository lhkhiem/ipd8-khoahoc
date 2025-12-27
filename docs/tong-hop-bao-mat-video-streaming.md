# TỔNG HỢP ĐÁNH GIÁ BẢO MẬT VIDEO STREAMING - IPD8 CMS

## 📋 MỤC LỤC

1. [Tổng Quan](#1-tổng-quan)
2. [Đánh Giá Hiện Trạng](#2-đánh-giá-hiện-trạng)
3. [Các Biện Pháp Bảo Mật Đã Có](#3-các-biện-pháp-bảo-mật-đã-có)
4. [Các Vấn Đề Cần Bổ Sung](#4-các-vấn-đề-cần-bổ-sung)
5. [Implementation Chi Tiết](#5-implementation-chi-tiết)
6. [Nginx Configuration](#6-nginx-configuration)
7. [Checklist Triển Khai](#7-checklist-triển-khai)
8. [Kết Luận & Khuyến Nghị](#8-kết-luận--khuyến-nghị)

---

## 1. TỔNG QUAN

### 1.1. Mục Đích

Tài liệu này đánh giá toàn diện module video streaming trong giải pháp CMS IPD8 về:
- ✅ Khả năng bảo mật video
- ✅ Khả năng chống download
- ✅ Các biện pháp cần bổ sung
- ✅ Implementation chi tiết

### 1.2. Phạm Vi Đánh Giá

- HLS streaming với AES-128 encryption
- Signed URL generation & verification
- Key endpoint security
- Segment access control
- Watermark implementation
- Monitoring & detection

---

## 2. ĐÁNH GIÁ HIỆN TRẠNG

### 2.1. Điểm Mạnh ✅

| Tính Năng | Trạng Thái | Đánh Giá |
|-----------|------------|----------|
| HLS với AES-128 encryption | ✅ Đã có | ⭐⭐⭐⭐ (4/5) |
| Signed URLs với expiration | ✅ Đã có | ⭐⭐⭐⭐ (4/5) |
| Signature verification (HMAC-SHA256) | ✅ Đã có | ⭐⭐⭐⭐ (4/5) |
| User ID binding | ✅ Đã có | ⭐⭐⭐⭐ (4/5) |
| Permission check | ✅ Đã có | ⭐⭐⭐⭐ (4/5) |
| Nginx secure_link | ✅ Đã có | ⭐⭐⭐⭐ (4/5) |
| Access control (tier-based) | ✅ Đã có | ⭐⭐⭐⭐ (4/5) |

**Tổng điểm bảo mật:** ⭐⭐⭐⭐ (4/5)

### 2.2. Điểm Yếu ⚠️

| Tính Năng | Trạng Thái | Mức Độ |
|-----------|------------|--------|
| Rate limiting | ⚠️ Chưa có | CRITICAL |
| Token-based segment access | ⚠️ Chưa có | IMPORTANT |
| Cache-Control headers | ⚠️ Chưa có | CRITICAL |
| IP binding | ⚠️ Chưa có | OPTIONAL |
| Monitoring & detection | ⚠️ Chưa có | IMPORTANT |
| Watermark implementation | ⚠️ Thiếu chi tiết | IMPORTANT |
| Playlist security | ⚠️ Chưa có | IMPORTANT |

**Tổng điểm chống download:** ⭐⭐⭐ (3/5)

---

## 3. CÁC BIỆN PHÁP BẢO MẬT ĐÃ CÓ

### 3.1. HLS với AES-128 Encryption ✅

**Implementation hiện tại:**
```javascript
// Video được convert sang HLS với encryption
async convertToHLS(inputPath, outputPath, encryptionKey) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-c:a aac',
        '-hls_time 10',
        '-hls_playlist_type vod',
        '-hls_segment_filename', `${outputPath}/segment_%03d.ts`,
        '-hls_key_info_file', this.createKeyInfoFile(encryptionKey),
        '-hls_flags independent_segments',
      ])
      .output(`${outputPath}/playlist.m3u8`)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
```

**Đánh giá:**
- ✅ Tiêu chuẩn công nghiệp
- ✅ AES-128 đủ mạnh cho hầu hết trường hợp
- ⚠️ Có thể nâng cấp lên DRM cho nội dung premium cao

### 3.2. Signed URLs ✅

**Implementation hiện tại:**
```javascript
getVPSVideoUrl(video, userId) {
  const baseUrl = `${process.env.CDN_URL}/videos/${video.id}/playlist.m3u8`;
  const expires = Math.floor(Date.now() / 1000) + 7200; // 2 hours
  
  // Create signature
  const stringToSign = `${video.id}${userId}${expires}`;
  const signature = crypto
    .createHmac('sha256', process.env.VIDEO_SECRET_KEY)
    .update(stringToSign)
    .digest('hex');

  const signedUrl = `${baseUrl}?expires=${expires}&signature=${signature}&user=${userId}`;
  return { signedUrl, keyUrl, duration, title };
}
```

**Đánh giá:**
- ✅ Expiration: 2 hours (tốt)
- ✅ Signature: HMAC-SHA256 (mạnh)
- ✅ User binding: Có
- ⚠️ Thiếu IP binding (optional)
- ⚠️ Thiếu nonce (chống replay attack)

### 3.3. Key Endpoint Security ✅

**Implementation hiện tại:**
```javascript
async getEncryptionKey(videoId, userId, signature, expires) {
  // 1. Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.VIDEO_SECRET_KEY)
    .update(`${videoId}${userId}${expires}`)
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new Error('Invalid signature');
  }

  // 2. Check expiration
  if (Date.now() / 1000 > parseInt(expires)) {
    throw new Error('URL expired');
  }

  // 3. Check permission
  const hasPermission = await this.checkVideoPermission(videoId, userId);
  if (!hasPermission) {
    throw new Error('No permission');
  }
  
  // 4. Get key from cache or database
  const cacheKey = `video:key:${videoId}`;
  let encryptionKey = await redis.get(cacheKey);
  
  if (!encryptionKey) {
    // Get from database and decrypt
    encryptionKey = this.decryptKey(rows[0].encryption_key);
    await redis.setex(cacheKey, 3600, encryptionKey); // Cache 1 hour
  }

  return Buffer.from(encryptionKey, 'hex');
}
```

**Đánh giá:**
- ✅ Signature verification: Có
- ✅ Expiration check: Có
- ✅ Permission check: Có
- ✅ Redis caching: Có
- ⚠️ Thiếu rate limiting
- ⚠️ Thiếu Cache-Control headers
- ⚠️ Thiếu JWT token verification

### 3.4. Access Control ✅

**Implementation hiện tại:**
```javascript
async checkVideoPermission(videoId, userId) {
  const query = `
    SELECT EXISTS(
      SELECT 1
      FROM videos v
      JOIN courses c ON v.course_id = c.id
      LEFT JOIN course_enrollments ce ON c.id = ce.course_id AND ce.user_id = $2
      LEFT JOIN users u ON u.id = $2
      WHERE v.id = $1
        AND (
          v.is_free = true
          OR ce.id IS NOT NULL
          OR (v.tier = 'bronze' AND u.tier IN ('bronze', 'silver', 'gold'))
          OR (v.tier = 'silver' AND u.tier IN ('silver', 'gold'))
          OR (v.tier = 'gold' AND u.tier = 'gold')
        )
    ) as has_permission
  `;
  const { rows } = await pool.query(query, [videoId, userId]);
  return rows[0].has_permission;
}
```

**Đánh giá:**
- ✅ Logic kiểm tra đầy đủ
- ✅ Hỗ trợ free videos
- ✅ Hỗ trợ tier-based access
- ✅ Hỗ trợ enrollment-based access

---

## 4. CÁC VẤN ĐỀ CẦN BỔ SUNG

### 4.1. Rate Limiting ⚠️ CRITICAL

**Vấn đề:**
- Key endpoint có thể bị spam
- Segment requests có thể bị abuse
- Không có giới hạn requests per user

**Giải pháp:**
```javascript
// Middleware rate limiting
const rateLimit = require('express-rate-limit');

// Key endpoint: 1 request/second per user
const keyRateLimit = rateLimit({
  windowMs: 1000, // 1 second
  max: 1,
  keyGenerator: (req) => req.userId || req.ip,
  message: 'Too many key requests, please try again later.',
});

// Segment endpoint: 10 requests/second per user
const segmentRateLimit = rateLimit({
  windowMs: 1000, // 1 second
  max: 10,
  keyGenerator: (req) => req.userId || req.ip,
  message: 'Too many segment requests, please try again later.',
});

// Apply to routes
app.get('/api/v1/videos/:id/key', keyRateLimit, getEncryptionKey);
app.get('/videos/:id/segments/:segmentId.ts', segmentRateLimit, getSegment);
```

**Priority:** 🔴 CRITICAL

---

### 4.2. Token-based Segment Access ⚠️ IMPORTANT

**Vấn đề:**
- HLS segments (.ts) có thể download trực tiếp
- Không có authentication cho từng segment
- Tools như yt-dlp có thể download toàn bộ video

**Giải pháp:**
```javascript
// Generate segment token khi request playlist
function generateSegmentToken(videoId, userId, expiresIn = 600) {
  const payload = {
    videoId,
    userId,
    expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
    nonce: crypto.randomBytes(16).toString('hex'),
  };
  
  const token = jwt.sign(payload, process.env.SEGMENT_SECRET, {
    expiresIn: `${expiresIn}s`,
  });
  
  return token;
}

// Verify token khi request segment
function verifySegmentToken(token, videoId, userId) {
  try {
    const decoded = jwt.verify(token, process.env.SEGMENT_SECRET);
    
    // Verify video ID
    if (decoded.videoId !== videoId) {
      return false;
    }
    
    // Verify user ID
    if (decoded.userId !== userId) {
      return false;
    }
    
    // Verify expiration
    if (Date.now() / 1000 > decoded.expiresAt) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Update playlist với token trong segment URLs
function generatePlaylistWithTokens(videoId, userId, segments) {
  const token = generateSegmentToken(videoId, userId);
  
  let playlist = '#EXTM3U\n#EXT-X-VERSION:3\n';
  
  segments.forEach((segment, index) => {
    playlist += `#EXTINF:${segment.duration},\n`;
    playlist += `${segment.url}?token=${token}&seq=${index}\n`;
  });
  
  return playlist;
}
```

**Priority:** 🟡 IMPORTANT

---

### 4.3. Cache-Control Headers ⚠️ CRITICAL

**Vấn đề:**
- Key có thể bị cache bởi browser/CDN
- Segments có thể bị cache lâu
- Không kiểm soát được cache behavior

**Giải pháp:**
```javascript
// Key endpoint response headers
app.get('/api/v1/videos/:id/key', (req, res) => {
  // ... get key logic ...
  
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Content-Type-Options': 'nosniff',
    'Content-Type': 'application/octet-stream',
  });
  
  res.send(keyBuffer);
});

// Segment endpoint response headers
app.get('/videos/:id/segments/:segmentId.ts', (req, res) => {
  // ... get segment logic ...
  
  res.set({
    'Cache-Control': 'private, max-age=3600', // Cache 1 hour
    'X-Content-Type-Options': 'nosniff',
    'Content-Type': 'video/mp2t',
  });
  
  res.sendFile(segmentPath);
});
```

**Priority:** 🔴 CRITICAL

---

### 4.4. Referer & CORS Checking ⚠️ IMPORTANT

**Vấn đề:**
- Segments có thể được request từ bất kỳ domain nào
- Không kiểm soát được nguồn request

**Giải pháp:**
```javascript
// Middleware check referer
function checkReferer(req, res, next) {
  const allowedDomains = [
    'https://ipd8.com',
    'https://www.ipd8.com',
    'https://cms.ipd8.com',
  ];
  
  const referer = req.get('Referer') || req.get('Origin');
  
  if (!referer) {
    return res.status(403).json({ error: 'Referer required' });
  }
  
  const isAllowed = allowedDomains.some(domain => 
    referer.startsWith(domain)
  );
  
  if (!isAllowed) {
    return res.status(403).json({ error: 'Invalid referer' });
  }
  
  next();
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://ipd8.com',
      'https://www.ipd8.com',
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

**Priority:** 🟡 IMPORTANT

---

### 4.5. User-Agent Validation ⚠️ IMPORTANT

**Vấn đề:**
- Tools như yt-dlp, ffmpeg có thể download video
- Không block được các automated tools

**Giải pháp:**
```javascript
// Block suspicious user agents
const blockedUserAgents = [
  'yt-dlp',
  'ffmpeg',
  'wget',
  'curl',
  'python-requests',
  'axios',
  'node-fetch',
  'aria2',
  'axel',
];

function validateUserAgent(req, res, next) {
  const userAgent = req.get('User-Agent') || '';
  const isBlocked = blockedUserAgents.some(ua => 
    userAgent.toLowerCase().includes(ua.toLowerCase())
  );
  
  if (isBlocked) {
    return res.status(403).json({ 
      error: 'Access denied',
      code: 'BLOCKED_USER_AGENT'
    });
  }
  
  next();
}

// Apply to segment endpoint
app.get('/videos/:id/segments/:segmentId.ts', 
  validateUserAgent, 
  getSegment
);
```

**Priority:** 🟡 IMPORTANT

---

### 4.6. Monitoring & Detection ⚠️ IMPORTANT

**Vấn đề:**
- Không track được suspicious activities
- Không detect được download attempts
- Không có alert system

**Giải pháp:**
```javascript
// Track video access
async function logVideoAccess(videoId, userId, req) {
  const accessLog = {
    videoId,
    userId,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    timestamp: new Date(),
    requestType: 'segment', // 'playlist', 'key', 'segment'
  };
  
  // Save to database
  await db('video_access_logs').insert(accessLog);
  
  // Check for suspicious activity
  await detectSuspiciousActivity(videoId, userId, req);
}

// Detect suspicious activity
async function detectSuspiciousActivity(videoId, userId, req) {
  const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
  
  // Count requests in last 5 minutes
  const requestCount = await db('video_access_logs')
    .where({ videoId, userId })
    .where('timestamp', '>', last5Minutes)
    .count();
  
  // If more than 100 requests in 5 minutes → suspicious
  if (requestCount > 100) {
    await alertAdmin({
      type: 'SUSPICIOUS_ACTIVITY',
      videoId,
      userId,
      requestCount,
      message: 'Possible download attempt detected',
    });
    
    // Optionally block user temporarily
    await blockUserTemporarily(userId, 3600); // Block 1 hour
  }
  
  // Check for out-of-order segment requests
  const segments = await db('video_access_logs')
    .where({ videoId, userId })
    .where('timestamp', '>', last5Minutes)
    .orderBy('timestamp', 'desc')
    .limit(10);
  
  // If segments not in order → suspicious
  const isOutOfOrder = checkSegmentOrder(segments);
  if (isOutOfOrder) {
    await alertAdmin({
      type: 'OUT_OF_ORDER_REQUESTS',
      videoId,
      userId,
      message: 'Segments requested out of order',
    });
  }
}

// Alert admin
async function alertAdmin(alert) {
  // Send email
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `Security Alert: ${alert.type}`,
    body: JSON.stringify(alert, null, 2),
  });
  
  // Log to database
  await db('security_alerts').insert({
    ...alert,
    created_at: new Date(),
  });
}
```

**Priority:** 🟡 IMPORTANT

---

### 4.7. Watermark Implementation ⚠️ IMPORTANT

**Vấn đề:**
- Chưa rõ implementation
- Không track được user nào leak video

**Giải pháp (Dynamic Watermark):**
```javascript
// Generate watermark với user info
function generateWatermark(userId, userEmail) {
  const watermark = {
    userId: userId.substring(0, 8), // Short user ID
    email: userEmail.substring(0, 10), // Short email
    timestamp: new Date().toISOString(),
  };
  
  return watermark;
}

// Inject watermark vào video segment
async function injectWatermark(segmentPath, watermark, outputPath) {
  const watermarkText = `${watermark.userId} | ${watermark.email} | ${watermark.timestamp}`;
  
  return new Promise((resolve, reject) => {
    ffmpeg(segmentPath)
      .videoFilters([
        `drawtext=text='${watermarkText}':fontcolor=white@0.5:fontsize=24:x=10:y=10`
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

// Cache watermarked segments per user
async function getWatermarkedSegment(videoId, segmentId, userId) {
  const cacheKey = `segment:${videoId}:${segmentId}:${userId}`;
  
  // Check cache
  let segment = await redis.get(cacheKey);
  if (segment) {
    return segment;
  }
  
  // Get original segment
  const originalSegment = await getSegment(videoId, segmentId);
  
  // Get user info
  const user = await getUser(userId);
  
  // Generate watermark
  const watermark = generateWatermark(userId, user.email);
  
  // Inject watermark
  const watermarkedPath = `/tmp/watermarked/${videoId}/${segmentId}_${userId}.ts`;
  await injectWatermark(originalSegment.path, watermark, watermarkedPath);
  
  // Cache watermarked segment
  await redis.setex(cacheKey, 3600, watermarkedPath); // Cache 1 hour
  
  return watermarkedPath;
}
```

**Priority:** 🟡 IMPORTANT

---

### 4.8. Playlist Security ⚠️ IMPORTANT

**Vấn đề:**
- Playlist chứa tất cả segment URLs
- Có thể dùng để download toàn bộ video

**Giải pháp:**
```javascript
// Generate sliding window playlist
function generateSlidingWindowPlaylist(videoId, userId, currentTime) {
  // Chỉ include segments trong window (e.g., 5 phút trước và sau)
  const windowStart = currentTime - 5 * 60; // 5 minutes before
  const windowEnd = currentTime + 5 * 60; // 5 minutes after
  
  const segments = getSegmentsInWindow(videoId, windowStart, windowEnd);
  
  // Generate token cho segments
  const token = generateSegmentToken(videoId, userId);
  
  let playlist = '#EXTM3U\n#EXT-X-VERSION:3\n';
  playlist += `#EXT-X-TARGETDURATION:10\n`;
  playlist += `#EXT-X-MEDIA-SEQUENCE:${segments[0].sequence}\n`;
  
  segments.forEach(segment => {
    playlist += `#EXTINF:${segment.duration},\n`;
    playlist += `${segment.url}?token=${token}&seq=${segment.sequence}\n`;
  });
  
  return playlist;
}
```

**Priority:** 🟡 IMPORTANT

---

## 5. IMPLEMENTATION CHI TIẾT

### 5.1. Enhanced Key Endpoint

```javascript
// Enhanced key endpoint với đầy đủ security
app.get('/api/v1/videos/:id/key', 
  authenticateJWT, // Verify JWT token
  keyRateLimit,     // Rate limiting
  async (req, res) => {
    const { id: videoId } = req.params;
    const userId = req.user.id;
    const { expires, signature, nonce } = req.query;
    
    // 1. Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.VIDEO_SECRET_KEY)
      .update(`${videoId}${userId}${expires}${nonce}`)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(403).json({ error: 'Invalid signature' });
    }
    
    // 2. Check expiration
    if (Date.now() / 1000 > parseInt(expires)) {
      return res.status(410).json({ error: 'URL expired' });
    }
    
    // 3. Check nonce (prevent replay)
    const nonceKey = `nonce:${nonce}`;
    const used = await redis.get(nonceKey);
    if (used) {
      return res.status(403).json({ error: 'Nonce already used' });
    }
    await redis.setex(nonceKey, 3600, '1'); // Mark as used
    
    // 4. Check permission
    const hasPermission = await checkVideoPermission(videoId, userId);
    if (!hasPermission) {
      return res.status(403).json({ error: 'No permission' });
    }
    
    // 5. Get encryption key
    const key = await getEncryptionKey(videoId);
    
    // 6. Set security headers
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'application/octet-stream',
    });
    
    // 7. Log access
    await logVideoAccess(videoId, userId, req, 'key');
    
    res.send(key);
  }
);
```

### 5.2. Enhanced Segment Endpoint

```javascript
// Enhanced segment endpoint với đầy đủ security
app.get('/videos/:videoId/segments/:segmentId.ts',
  validateUserAgent,  // Block suspicious user agents
  checkReferer,      // Check referer
  segmentRateLimit,  // Rate limiting
  cors(corsOptions), // CORS
  async (req, res) => {
    const { videoId, segmentId } = req.params;
    const { token, userId } = req.query;
    
    // 1. Verify token
    if (!verifySegmentToken(token, videoId, userId)) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    // 2. Check permission
    const hasPermission = await checkVideoPermission(videoId, userId);
    if (!hasPermission) {
      return res.status(403).json({ error: 'No permission' });
    }
    
    // 3. Get segment (with watermark if needed)
    const segmentPath = await getWatermarkedSegment(videoId, segmentId, userId);
    
    // 4. Set headers
    res.set({
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'video/mp2t',
      'Accept-Ranges': 'bytes',
    });
    
    // 5. Log access
    await logVideoAccess(videoId, userId, req, 'segment');
    
    // 6. Send file
    res.sendFile(segmentPath);
  }
);
```

---

## 6. NGINX CONFIGURATION

### 6.1. Video Files Location với Secure Link

```nginx
# Video files location
location /videos/ {
    alias /var/www/videos/;
    
    # Secure link verification
    secure_link $arg_signature,$arg_expires;
    secure_link_md5 "$secure_link_expires$uri$arg_user $video_secret_key";
    
    if ($secure_link = "") {
        return 403;
    }
    
    if ($secure_link = "0") {
        return 410; # Gone (expired)
    }
    
    # Referer checking
    if ($http_referer !~* "^https://ipd8\.com") {
        return 403;
    }
    
    # CORS for HLS
    add_header Access-Control-Allow-Origin "https://ipd8.com" always;
    add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Range, Content-Type" always;
    add_header Access-Control-Allow-Credentials "true" always;
    
    # Cache control
    expires 1h;
    add_header Cache-Control "private, no-transform" always;
    
    # Support byte-range requests
    add_header Accept-Ranges bytes always;
    
    # HLS content types
    types {
        application/vnd.apple.mpegurl m3u8;
        video/mp2t ts;
    }
    
    # Disable access logging for segments (reduce log size)
    access_log off;
    
    # Rate limiting
    limit_req zone=video_limit burst=10 nodelay;
}
```

### 6.2. Rate Limiting Zones

```nginx
# Rate limiting zones
http {
    # Video segment rate limit: 10 req/sec
    limit_req_zone $binary_remote_addr zone=video_limit:10m rate=10r/s;
    
    # Key endpoint rate limit: 1 req/sec
    limit_req_zone $binary_remote_addr zone=key_limit:10m rate=1r/s;
    
    # API rate limit: 100 req/min
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
}
```

### 6.3. Block Suspicious User Agents

```nginx
# Block suspicious user agents
map $http_user_agent $blocked_agent {
    default 0;
    ~*yt-dlp 1;
    ~*ffmpeg 1;
    ~*wget 1;
    ~*curl 1;
    ~*python-requests 1;
    ~*axios 1;
    ~*node-fetch 1;
}

# Apply blocking
if ($blocked_agent) {
    return 403;
}
```

---

## 7. CHECKLIST TRIỂN KHAI

### Phase 1: Critical Security (Tuần 1)

- [ ] **Rate Limiting**
  - [ ] Implement rate limiting cho key endpoint (1 req/sec)
  - [ ] Implement rate limiting cho segment endpoint (10 req/sec)
  - [ ] Configure Nginx rate limiting zones
  - [ ] Test rate limiting với load testing

- [ ] **Cache-Control Headers**
  - [ ] Add Cache-Control headers cho key endpoint
  - [ ] Add Cache-Control headers cho segment endpoint
  - [ ] Verify headers với browser DevTools
  - [ ] Test cache behavior

- [ ] **JWT Token Verification**
  - [ ] Add JWT middleware cho key endpoint
  - [ ] Verify token trong mỗi request
  - [ ] Handle token expiration
  - [ ] Test với invalid tokens

### Phase 2: Important Security (Tuần 2)

- [ ] **Token-based Segment Access**
  - [ ] Generate segment tokens
  - [ ] Verify tokens trong segment requests
  - [ ] Update playlist với tokens
  - [ ] Test token expiration

- [ ] **Referer & CORS Checking**
  - [ ] Implement referer checking middleware
  - [ ] Configure CORS properly
  - [ ] Test với different origins
  - [ ] Whitelist allowed domains

- [ ] **User-Agent Validation**
  - [ ] Create blocked user agents list
  - [ ] Implement validation middleware
  - [ ] Test với various user agents
  - [ ] Monitor false positives

### Phase 3: Advanced Security (Tuần 3-4)

- [ ] **Monitoring & Detection**
  - [ ] Implement access logging
  - [ ] Create suspicious activity detection
  - [ ] Setup alert system
  - [ ] Test detection với mock attacks

- [ ] **Watermark Implementation**
  - [ ] Implement dynamic watermark generation
  - [ ] Inject watermark vào segments
  - [ ] Cache watermarked segments
  - [ ] Test watermark visibility

- [ ] **Playlist Security**
  - [ ] Implement sliding window playlist
  - [ ] Add tokens vào segment URLs
  - [ ] Test playlist generation
  - [ ] Verify security

---

## 8. KẾT LUẬN & KHUYẾN NGHỊ

### 8.1. Tổng Kết

**Bảo mật hiện tại:** ⭐⭐⭐⭐ (4/5)
- ✅ Đã có nền tảng tốt
- ✅ Signature verification mạnh
- ✅ Permission check đầy đủ
- ⚠️ Thiếu một số tính năng nâng cao

**Chống download:** ⭐⭐⭐ (3/5)
- ✅ HLS encryption tốt
- ✅ Signed URLs hoạt động
- ⚠️ Segments vẫn có thể download
- ⚠️ Cần thêm nhiều lớp bảo vệ

### 8.2. Khuyến Nghị Ưu Tiên

#### Priority 1 (Critical - Tuần 1):
1. ✅ Rate limiting
2. ✅ Cache-Control headers
3. ✅ JWT token verification

#### Priority 2 (Important - Tuần 2):
4. ✅ Token-based segment access
5. ✅ Referer & CORS checking
6. ✅ User-Agent validation

#### Priority 3 (Advanced - Tuần 3-4):
7. ✅ Monitoring & detection
8. ✅ Watermark implementation
9. ✅ Playlist security

### 8.3. Timeline

- **Tuần 1:** Critical security features
- **Tuần 2:** Important security features
- **Tuần 3-4:** Advanced security features
- **Tổng cộng:** 3-4 tuần

### 8.4. Lưu Ý

1. **Không có giải pháp 100% chống download**
   - Mục tiêu: Làm khó download nhất có thể
   - Track được user nào leak video (watermark)
   - Detect và block suspicious activities

2. **Cân bằng giữa bảo mật và UX**
   - Không làm ảnh hưởng playback experience
   - Rate limiting phải đủ cho normal playback
   - Watermark không được quá intrusive

3. **Monitoring là quan trọng**
   - Track tất cả access
   - Alert khi có suspicious activity
   - Review logs định kỳ

---

**Document Version:** 1.0  
**Created:** 2025-01-XX  
**Last Updated:** 2025-01-XX  
**Status:** 📋 Complete Assessment & Implementation Guide

























