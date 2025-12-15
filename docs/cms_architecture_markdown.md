# Tài Liệu Kiến Trúc CMS - Web Client Độc Lập

## 📋 Mục Lục
1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [API Design](#3-api-design)
4. [Data Synchronization](#4-data-synchronization)
5. [Security Implementation](#5-security-implementation)
6. [Deployment Scenarios](#6-deployment-scenarios)
7. [Migration Procedures](#7-migration-procedures)
8. [Monitoring & Maintenance](#8-monitoring--maintenance)
9. [Code Examples](#9-code-examples)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Tổng Quan Kiến Trúc

### 1.1. Mô Hình Tổng Quan

```
┌─────────────────────────────────────────────────────────────┐
│              VPS CỦA BẠN (CMS Server)                        │
│  Domain: cms.yourdomain.com                                  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  CMS Application (NextJS 16.0.7)                      │   │
│  │  Port: 3001                                           │   │
│  │  ├─ Admin UI (/admin)                                 │   │
│  │  ├─ Content Editor                                    │   │
│  │  ├─ Media Manager                                     │   │
│  │  └─ API Gateway (/api/v1)                             │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                           │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │  CMS Database (PostgreSQL)                            │   │
│  │  Port: 5432                                           │   │
│  │  ├─ clients (thông tin khách hàng)                    │   │
│  │  ├─ api_keys (authentication)                         │   │
│  │  ├─ content (nội dung CMS)                            │   │
│  │  ├─ media (tài nguyên)                                │   │
│  │  └─ webhooks (callback URLs)                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Nginx Reverse Proxy                                  │   │
│  │  - SSL/TLS Termination                                │   │
│  │  - Rate Limiting                                      │   │
│  │  - WAF Rules                                          │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────┬───────────────────────────────────────┘
                    │
                    │ HTTPS API Calls
                    │ Authentication: Bearer Token / API Key
                    │
┌───────────────────▼───────────────────────────────────────┐
│         VPS KHÁCH HÀNG (Client Web - Có thể di chuyển)     │
│         Domain: client1.example.com                         │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Frontend (NextJS)                                  │   │
│  │  Port: 3000                                         │   │
│  │  - Display Content từ CMS                           │   │
│  │  - Real-time Updates (WebSocket/Polling)            │   │
│  └────────────────┬───────────────────────────────────┘   │
│                   │                                         │
│  ┌────────────────▼───────────────────────────────────┐   │
│  │  Backend API (Node.js/Express)                      │   │
│  │  Port: 4000                                         │   │
│  │  ├─ CMS Client SDK                                  │   │
│  │  ├─ Content Cache (Redis)                           │   │
│  │  ├─ Webhook Receiver                                │   │
│  │  └─ Business Logic                                  │   │
│  └────────────────┬───────────────────────────────────┘   │
│                   │                                         │
│  ┌────────────────▼───────────────────────────────────┐   │
│  │  Client Database (PostgreSQL)                       │   │
│  │  - Cached CMS Content                               │   │
│  │  - Application-specific Data                        │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 1.2. Đặc Điểm Chính

**CMS Server (VPS của bạn):**
- ✅ Luôn ở vị trí cố định
- ✅ Quản lý nhiều clients khác nhau
- ✅ Mỗi client có schema/data riêng biệt
- ✅ Centralized authentication & authorization
- ✅ Audit logging toàn bộ hoạt động

**Client Web (VPS khách hàng):**
- ✅ Có thể di chuyển qua VPS khác bất cứ lúc nào
- ✅ Kết nối với CMS qua HTTPS API
- ✅ Cache content locally để tối ưu performance
- ✅ Chỉ cần update API endpoint khi di chuyển

---

## 2. Authentication & Authorization

### 2.1. Multi-Tenant API Key Strategy

#### CMS Database Schema

```sql
-- Bảng quản lý clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bảng quản lý API keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    api_secret VARCHAR(64) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]',
    rate_limit INTEGER DEFAULT 1000,
    ip_whitelist TEXT[],
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Index để tối ưu query
CREATE INDEX idx_api_keys_key ON api_keys(api_key) WHERE is_active = true;
CREATE INDEX idx_api_keys_client ON api_keys(client_id);
CREATE INDEX idx_clients_slug ON clients(slug);

-- Bảng audit log
CREATE TABLE api_requests (
    id BIGSERIAL PRIMARY KEY,
    client_id UUID REFERENCES clients(id),
    api_key_id UUID REFERENCES api_keys(id),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    ip_address INET,
    user_agent TEXT,
    request_body JSONB,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_requests_client ON api_requests(client_id, created_at);
```

#### Generating API Keys (CMS Server)

```javascript
// cms/lib/api-key-generator.js
const crypto = require('crypto');

class ApiKeyGenerator {
  /**
   * Generate API Key và Secret cho client mới
   */
  static generate() {
    const apiKey = 'cms_' + crypto.randomBytes(24).toString('hex');
    const apiSecret = crypto.randomBytes(32).toString('hex');
    
    return {
      apiKey,
      apiSecret,
      hashedSecret: this.hashSecret(apiSecret)
    };
  }
  
  /**
   * Hash API Secret để lưu vào DB
   */
  static hashSecret(secret) {
    return crypto
      .createHash('sha256')
      .update(secret)
      .digest('hex');
  }
  
  /**
   * Verify API Secret
   */
  static verifySecret(providedSecret, hashedSecret) {
    const hashedProvided = this.hashSecret(providedSecret);
    return crypto.timingSafeEqual(
      Buffer.from(hashedProvided),
      Buffer.from(hashedSecret)
    );
  }
  
  /**
   * Generate JWT token cho authenticated request
   */
  static generateJWT(payload, secret, expiresIn = '1h') {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, secret, { expiresIn });
  }
}

module.exports = ApiKeyGenerator;
```

#### CMS API: Create Client & API Keys

```javascript
// cms/app/api/v1/clients/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { ApiKeyGenerator } from '@/lib/api-key-generator';
import { requireAdmin } from '@/lib/auth';

export async function POST(request) {
  try {
    // Verify admin authentication
    const admin = await requireAdmin(request);
    
    const body = await request.json();
    const { name, domain, permissions } = body;
    
    // Validate input
    if (!name || !domain) {
      return NextResponse.json(
        { error: 'Name and domain are required' },
        { status: 400 }
      );
    }
    
    // Generate slug từ name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Start transaction
    const client = await db.transaction(async (trx) => {
      // Tạo client
      const [newClient] = await trx('clients')
        .insert({
          name,
          slug,
          domain,
          status: 'active',
          metadata: {}
        })
        .returning('*');
      
      // Generate API keys
      const { apiKey, apiSecret, hashedSecret } = ApiKeyGenerator.generate();
      
      // Lưu API key
      await trx('api_keys').insert({
        client_id: newClient.id,
        key_name: 'default',
        api_key: apiKey,
        api_secret: hashedSecret,
        permissions: permissions || ['read', 'write'],
        rate_limit: 1000,
        is_active: true
      });
      
      return {
        client: newClient,
        credentials: {
          apiKey,
          apiSecret // ONLY return this once!
        }
      };
    });
    
    return NextResponse.json({
      success: true,
      data: client
    });
    
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
```

### 2.2. Authentication Middleware (CMS Server)

```javascript
// cms/middleware/authenticate.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { ApiKeyGenerator } from '@/lib/api-key-generator';

export async function authenticateApiRequest(request) {
  try {
    // Extract API credentials từ headers
    const authHeader = request.headers.get('authorization');
    const apiKey = request.headers.get('x-api-key');
    const apiSecret = request.headers.get('x-api-secret');
    
    if (!authHeader && !apiKey) {
      return {
        authenticated: false,
        error: 'No authentication credentials provided'
      };
    }
    
    let client = null;
    let keyRecord = null;
    
    // Method 1: Bearer Token (JWT)
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const jwt = require('jsonwebtoken');
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        client = await db('clients')
          .where({ id: decoded.clientId, status: 'active' })
          .first();
          
        keyRecord = await db('api_keys')
          .where({ id: decoded.keyId, is_active: true })
          .first();
          
      } catch (jwtError) {
        return { authenticated: false, error: 'Invalid token' };
      }
    }
    
    // Method 2: API Key + Secret
    else if (apiKey && apiSecret) {
      keyRecord = await db('api_keys')
        .where({ api_key: apiKey, is_active: true })
        .whereNull('expires_at')
        .orWhere('expires_at', '>', new Date())
        .first();
      
      if (!keyRecord) {
        return { authenticated: false, error: 'Invalid API key' };
      }
      
      // Verify secret
      const isValidSecret = ApiKeyGenerator.verifySecret(
        apiSecret,
        keyRecord.api_secret
      );
      
      if (!isValidSecret) {
        return { authenticated: false, error: 'Invalid API secret' };
      }
      
      client = await db('clients')
        .where({ id: keyRecord.client_id, status: 'active' })
        .first();
    }
    
    if (!client || !keyRecord) {
      return { authenticated: false, error: 'Client not found' };
    }
    
    // Check IP whitelist
    if (keyRecord.ip_whitelist?.length > 0) {
      const clientIp = request.headers.get('x-real-ip') || 
                       request.headers.get('x-forwarded-for');
      
      if (!keyRecord.ip_whitelist.includes(clientIp)) {
        return { 
          authenticated: false, 
          error: 'IP not whitelisted' 
        };
      }
    }
    
    // Update last_used_at
    await db('api_keys')
      .where({ id: keyRecord.id })
      .update({ last_used_at: new Date() });
    
    return {
      authenticated: true,
      client,
      apiKey: keyRecord,
      permissions: keyRecord.permissions || []
    };
    
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      authenticated: false, 
      error: 'Authentication failed' 
    };
  }
}

// Middleware wrapper
export function withAuth(handler, requiredPermissions = []) {
  return async (request, context) => {
    const auth = await authenticateApiRequest(request);
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }
    
    // Check permissions
    if (requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every(
        perm => auth.permissions.includes(perm)
      );
      
      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }
    
    // Attach auth info to request
    request.auth = auth;
    
    // Call actual handler
    return handler(request, context);
  };
}
```

### 2.3. Rate Limiting (CMS Server)

```javascript
// cms/middleware/rate-limiter.js
import { NextResponse } from 'next/server';

class RateLimiter {
  constructor() {
    // Sử dụng Redis trong production
    // Ở đây dùng in-memory cho demo
    this.requests = new Map();
  }
  
  async checkLimit(clientId, limit, window = 3600000) {
    const now = Date.now();
    const key = `${clientId}:${Math.floor(now / window)}`;
    
    const current = this.requests.get(key) || 0;
    
    if (current >= limit) {
      const resetTime = Math.ceil((now / window + 1) * window);
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetTime
      };
    }
    
    this.requests.set(key, current + 1);
    
    // Cleanup old keys
    this.cleanup();
    
    return {
      allowed: true,
      limit,
      remaining: limit - current - 1,
      resetTime: Math.ceil((now / window + 1) * window)
    };
  }
  
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      const [clientId, timestamp] = key.split(':');
      if (now - parseInt(timestamp) * 3600000 > 7200000) {
        this.requests.delete(key);
      }
    }
  }
}

const rateLimiter = new RateLimiter();

export async function withRateLimit(request, auth) {
  const limit = auth.apiKey.rate_limit || 1000;
  
  const result = await rateLimiter.checkLimit(
    auth.client.id,
    limit
  );
  
  if (!result.allowed) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        limit: result.limit,
        resetTime: new Date(result.resetTime).toISOString()
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString()
        }
      }
    );
  }
  
  return {
    headers: {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetTime.toString()
    }
  };
}
```

---

## 3. API Design

### 3.1. RESTful API Endpoints (CMS Server)

```javascript
// cms/app/api/v1/content/route.js
import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/authenticate';
import { withRateLimit } from '@/middleware/rate-limiter';
import { db } from '@/lib/database';

// GET /api/v1/content - Lấy danh sách content
export const GET = withAuth(async (request) => {
  try {
    const { client } = request.auth;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'published';
    
    // Rate limiting
    const rateLimitResult = await withRateLimit(request, request.auth);
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }
    
    // Query content cho client này
    let query = db('content')
      .where({ client_id: client.id, status })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);
    
    if (type) {
      query = query.where({ type });
    }
    
    const [content, totalCount] = await Promise.all([
      query,
      db('content')
        .where({ client_id: client.id, status })
        .count('* as count')
        .first()
    ]);
    
    return NextResponse.json({
      success: true,
      data: content,
      pagination: {
        page,
        limit,
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit)
      }
    }, {
      headers: rateLimitResult.headers
    });
    
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}, ['read']);

// POST /api/v1/content - Tạo content mới
export const POST = withAuth(async (request) => {
  try {
    const { client } = request.auth;
    const body = await request.json();
    
    const { title, slug, type, content_data, status } = body;
    
    // Validation
    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }
    
    // Insert content
    const [newContent] = await db('content')
      .insert({
        client_id: client.id,
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
        type,
        content_data: JSON.stringify(content_data),
        status: status || 'draft',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    // Trigger webhook để notify client
    await triggerWebhook(client.id, 'content.created', newContent);
    
    return NextResponse.json({
      success: true,
      data: newContent
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}, ['write']);
```

---

## 4. Data Synchronization

### 4.1. Webhook System (CMS Server)

```javascript
// cms/lib/webhook.js
import { db } from './database';
import axios from 'axios';

export async function triggerWebhook(clientId, event, data) {
  try {
    // Lấy webhook URLs của client
    const webhooks = await db('webhooks')
      .where({ 
        client_id: clientId,
        is_active: true
      })
      .where('events', '@>', JSON.stringify([event]));
    
    if (webhooks.length === 0) {
      return;
    }
    
    // Gửi webhook requests
    const promises = webhooks.map(async (webhook) => {
      try {
        const payload = {
          event,
          timestamp: new Date().toISOString(),
          data
        };
        
        // Sign payload
        const signature = generateWebhookSignature(
          payload,
          webhook.secret
        );
        
        const response = await axios.post(
          webhook.url,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': signature,
              'X-Webhook-Event': event
            },
            timeout: 10000
          }
        );
        
        // Log success
        await db('webhook_logs').insert({
          webhook_id: webhook.id,
          event,
          status: 'success',
          status_code: response.status,
          sent_at: new Date()
        });
        
      } catch (error) {
        // Log failure
        await db('webhook_logs').insert({
          webhook_id: webhook.id,
          event,
          status: 'failed',
          error_message: error.message,
          sent_at: new Date()
        });
        
        // Retry logic
        scheduleWebhookRetry(webhook.id, event, data);
      }
    });
    
    await Promise.allSettled(promises);
    
  } catch (error) {
    console.error('Webhook trigger error:', error);
  }
}

function generateWebhookSignature(payload, secret) {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}
```

### 4.2. Client SDK (Client Web)

```javascript
// client/lib/cms-sdk.js
import axios from 'axios';
import crypto from 'crypto';

export class CMSClient {
  constructor(config) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.cache = config.cache; // Redis instance
    this.cachePrefix = `cms:${this.apiKey}:`;
  }
  
  async authenticate() {
    try {
      const response = await axios.post(
        `${this.apiUrl}/auth/token`,
        {},
        {
          headers: {
            'X-API-Key': this.apiKey,
            'X-API-Secret': this.apiSecret
          }
        }
      );
      
      this.token = response.data.token;
      this.tokenExpiry = Date.now() + (3600 * 1000);
      
      return this.token;
      
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Failed to authenticate with CMS');
    }
  }
  
  async ensureAuthenticated() {
    if (!this.token || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }
  
  async request(method, endpoint, data = null) {
    await this.ensureAuthenticated();
    
    try {
      const response = await axios({
        method,
        url: `${this.apiUrl}${endpoint}`,
        data,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
      
    } catch (error) {
      if (error.response?.status === 401) {
        await this.authenticate();
        return this.request(method, endpoint, data);
      }
      throw error;
    }
  }
  
  async getContent(id, options = {}) {
    const cacheKey = `${this.cachePrefix}content:${id}`;
    
    if (this.cache && !options.skipCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }
    
    const response = await this.request('GET', `/content/${id}`);
    const content = response.data;
    
    if (this.cache) {
      await this.cache.setex(
        cacheKey,
        options.cacheTTL || 3600,
        JSON.stringify(content)
      );
    }
    
    return content;
  }
  
  async listContent(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/content?${queryString}`;
    
    const cacheKey = `${this.cachePrefix}list:${queryString}`;
    
    if (this.cache && !params.skipCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }
    
    const response = await this.request('GET', endpoint);
    
    if (this.cache) {
      await this.cache.setex(
        cacheKey,
        params.cacheTTL || 300,
        JSON.stringify(response)
      );
    }
    
    return response;
  }
  
  verifyWebhookSignature(payload, signature, secret) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}
```

---

## 5. Security Implementation

### 5.1. Nginx Configuration (CMS Server)

```nginx
# /etc/nginx/sites-available/cms.yourdomain.com

upstream cms_app {
    server 127.0.0.1:3001;
    keepalive 64;
}

limit_req_zone $binary_remote_addr zone=cms_api:10m rate=100r/m;
limit_req_zone $http_x_api_key zone=cms_api_key:10m rate=1000r/h;

server {
    listen 443 ssl http2;
    server_name cms.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/cms.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cms.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location /api/ {
        limit_req zone=cms_api burst=20 nodelay;
        limit_req zone=cms_api_key burst=100 nodelay;
        
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, X-API-Key, X-API-Secret, Content-Type" always;
        
        if ($request_method = OPTIONS) {
            return 204;
        }
        
        if ($http_x_api_key = "") {
            if ($http_authorization = "") {
                return 401;
            }
        }
        
        proxy_pass http://cms_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /admin {
        allow 1.2.3.4;  # Your office IP
        deny all;
        
        proxy_pass http://cms_app;
    }
}
```

---

## 6. Deployment Scenarios

### 6.1. Initial Setup

```bash
# === CMS Server Setup ===

# 1. Clone CMS repository
cd /var/www
git clone https://github.com/your-org/cms-platform.git cms
cd cms

# 2. Install dependencies
npm install --production

# 3. Setup environment
cp .env.example .env
nano .env

# 4. Database migration
npm run db:migrate

# 5. Build application
npm run build

# 6. Start with PM2
pm2 start ecosystem.config.js
pm2 save

# 7. Setup Nginx
sudo ln -s /etc/nginx/sites-available/cms.yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. SSL Certificate
sudo certbot --nginx -d cms.yourdomain.com

# === Client Onboarding ===

# Create client via API
curl -X POST https://cms.yourdomain.com/api/v1/clients \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Client Name",
    "domain": "client1.example.com",
    "permissions": ["read", "write"]
  }'
```

---

## 7. Migration Procedures

### 7.1. Khi Client Chuyển VPS

```bash
# ===== TRÊN VPS MỚI =====

# Step 1: Setup môi trường mới
cd /var/www
git clone https://github.com/client/web-app.git client1
cd client1
npm install --production

# Step 2: Copy .env với API credentials
cp .env.example .env
nano .env
# Paste API credentials (KHÔNG ĐỔI)

# Step 3: Update webhook URL trong CMS
curl -X PUT https://cms.yourdomain.com/api/v1/webhooks/:webhook_id \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://NEW-DOMAIN.com/webhooks/cms"
  }'

# Step 4: Deploy
npm run build
pm2 start ecosystem.config.js

# Step 5: Update DNS
# Point domain to new VPS IP

# Step 6: Verify
curl https://client1.example.com/health
```

### 7.2. Migration Checklist

```markdown
## Pre-Migration
- [ ] Server provisioned
- [ ] API credentials noted
- [ ] Webhook secret saved
- [ ] Environment variables prepared

## Migration Steps
1. [ ] Setup new VPS
2. [ ] Deploy application
3. [ ] Configure environment
4. [ ] Update webhook URL
5. [ ] Update DNS
6. [ ] Setup SSL
7. [ ] Test webhook
8. [ ] Verify API calls
9. [ ] Monitor 24 hours
10. [ ] Decommission old VPS

## Post-Migration
- [ ] All API calls successful
- [ ] Webhooks received
- [ ] Content syncing
- [ ] No errors in logs
- [ ] Performance acceptable
```

---

## 8. Monitoring & Maintenance

### 8.1. Health Monitoring

```javascript
// cms/lib/monitoring.js
import { db } from './database';

export class HealthMonitor {
  constructor() {
    this.checks = [];
    this.interval = 60000;
  }
  
  start() {
    setInterval(() => this.runChecks(), this.interval);
  }
  
  addCheck(name, checkFn) {
    this.checks.push({ name, checkFn });
  }
  
  async runChecks() {
    const results = [];
    
    for (const check of this.checks) {
      try {
        const result = await check.checkFn();
        results.push({
          name: check.name,
          status: 'ok',
          ...result
        });
      } catch (error) {
        results.push({
          name: check.name,
          status: 'failed',
          error: error.message
        });
        
        await sendAlert({
          type: 'health_check_failed',
          check: check.name,
          error: error.message
        });
      }
    }
    
    await this.logResults(results);
    return results;
  }
  
  async logResults(results) {
    await db('health_checks').insert({
      timestamp: new Date(),
      results: JSON.stringify(results)
    });
  }
}
```

---

## 9. Code Examples

### 9.1. Complete Client Integration

```javascript
// client/pages/api/content/[slug].js
import { CMSClient } from '@/lib/cms-sdk';
import { db } from '@/lib/database';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const cms = new CMSClient({
  apiUrl: process.env.CMS_API_URL,
  apiKey: process.env.CMS_API_KEY,
  apiSecret: process.env.CMS_API_SECRET,
  cache: redis
});

export default async function handler(req, res) {
  const { slug } = req.query;
  
  if (req.method === 'GET') {
    try {
      // Try local cache first
      const cached = await db('cached_content')
        .where({ slug, status: 'published' })
        .first();
      
      if (cached) {
        return res.json({
          success: true,
          data: JSON.parse(cached.content_data),
          source: 'cache'
        });
      }
      
      // Fetch from CMS
      const result = await cms.listContent({
        slug,
        status: 'published',
        limit: 1
      });
      
      if (result.data.length === 0) {
        return res.status(404).json({
          error: 'Content not found'
        });
      }
      
      const content = result.data[0];
      
      // Cache locally
      await db('cached_content').insert({
        cms_id: content.id,
        slug: content.slug,
        title: content.title,
        content_data: JSON.stringify(content.content_data),
        status: content.status,
        synced_at: new Date()
      }).onConflict('cms_id').merge();
      
      return res.json({
        success: true,
        data: content,
        source: 'cms'
      });
      
    } catch (error) {
      console.error('Error fetching content:', error);
      return res.status(500).json({
        error: 'Failed to fetch content'
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
```

---

## 10. Troubleshooting

### 10.1. Common Issues

#### Issue 1: Authentication Failed

```bash
# Check API credentials
echo $CMS_API_KEY
echo $CMS_API_SECRET

# Test authentication
curl -X POST https://cms.yourdomain.com/api/v1/auth/token \
  -H "X-API-Key: $CMS_API_KEY" \
  -H "X-API-Secret: $CMS_API_SECRET"

# Verify API key in database
psql -U postgres -d cms_db -c "
  SELECT id, key_name, is_active, expires_at 
  FROM api_keys 
  WHERE api_key = 'YOUR_API_KEY';
"
```

#### Issue 2: Webhook Not Received

```bash
# Verify webhook configuration
curl https://cms.yourdomain.com/api/v1/webhooks \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Check webhook logs
psql -U postgres -d cms_db -c "
  SELECT * FROM webhook_logs 
  WHERE webhook_id = 'YOUR_WEBHOOK_ID' 
  ORDER BY sent_at DESC 
  LIMIT 10;
"

# Test webhook endpoint
curl -X POST https://your-client-domain.com/webhooks/cms \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: test" \
  -d '{"event":"test","data":{}}'

# Check firewall
sudo ufw status
```

#### Issue 3: Rate Limit Exceeded

```bash
# Check current rate limit
curl -I https://cms.yourdomain.com/api/v1/content \
  -H "X-API-Key: $CMS_API_KEY"

# Headers show:
# X-RateLimit-Limit: 1000
# X-RateLimit-Remaining: 0
# X-RateLimit-Reset: 1234567890

# Request increase
curl -X PUT https://cms.yourdomain.com/api/v1/clients/:client_id \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"rate_limit": 5000}'
```

---

## 📚 Appendix

### A. Environment Variables

```bash
# CMS Server (.env)
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/cms_db
JWT_SECRET=your-jwt-secret-min-32-chars
ADMIN_EMAIL=admin@yourdomain.com
REDIS_URL=redis://localhost:6379
WEBHOOK_SECRET=webhook-signing-secret

# Client Web (.env)
NODE_ENV=production
PORT=4000
CMS_API_URL=https://cms.yourdomain.com/api/v1
CMS_API_KEY=cms_abc123...
CMS_API_SECRET=your-api-secret
CMS_WEBHOOK_SECRET=webhook-secret
DATABASE_URL=postgresql://user:pass@localhost:5432/client_db
REDIS_URL=redis://localhost:6379
```

### B. Useful Commands

```bash
# Generate API key
node -e "console.log('cms_' + require('crypto').randomBytes(24).toString('hex'))"

# Generate secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Backup database
pg_dump -U postgres cms_db > backup-$(date +%Y%m%d).sql

# Check logs
pm2 logs
tail -f /var/log/nginx/access.log

# Redis management
redis-cli
> KEYS *
> FLUSHDB
```

---

## ✅ Quick Start Summary

1. **CMS Server** luôn ở vị trí cố định (cms.yourdomain.com)
2. **Client Web** có thể di chuyển bất cứ lúc nào
3. **Kết nối** thông qua HTTPS API với authentication
4. **Sync** thông qua Webhooks + Polling
5. **Cache** local để tối ưu performance
6. **Migration** chỉ cần update webhook URL và DNS

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-11  
**Status:** ✅ Production Ready

Chúc triển khai thành công! 🚀