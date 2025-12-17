import http from 'http';

type Result = { name: string; ok: boolean; detail?: string };

function request(method: string, path: string, body?: any, headers: Record<string, string> = {}): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }>{
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : undefined;
    const baseUrl = process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3011';
    let hostname = 'localhost';
    let port = 3011;
    
    try {
      const url = new URL(baseUrl);
      hostname = url.hostname;
      port = url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80);
    } catch {
      // Invalid URL, use defaults
    }
    
    const req = http.request(
      {
        hostname,
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data ? data.length : 0,
          ...headers,
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf-8');
          let parsed: any = raw;
          try {
            parsed = raw ? JSON.parse(raw) : {};
          } catch {
            // leave as string
          }
          resolve({ status: res.statusCode || 0, body: parsed, headers: res.headers });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  const results: Result[] = [];
  try {
    // health
    const h = await request('GET', '/api/health');
    results.push({ name: 'health', ok: h.status === 200 });

    // login
    // SECURITY: Use ADMIN_SEED_PASSWORD from environment or skip login test
    const adminPassword = process.env.ADMIN_SEED_PASSWORD;
    let tokenCookie = '';
    if (!adminPassword) {
      results.push({ 
        name: 'login', 
        ok: false, 
        detail: 'Skipped: ADMIN_SEED_PASSWORD not set in environment' 
      });
    } else {
      const login = await request('POST', '/api/auth/login', {
        email: 'admin@pressup.com',
        password: adminPassword,
      });
      const setCookie = (login.headers['set-cookie'] || [])[0] || '';
      tokenCookie = setCookie.split(';')[0];
      const hasToken = tokenCookie.startsWith('token=');
      results.push({ name: 'login', ok: login.status === 200 && hasToken, detail: hasToken ? 'cookie ok' : 'no cookie' });
    }

    // verify
    if (tokenCookie) {
      const verify = await request('GET', '/api/auth/verify', undefined, { Cookie: tokenCookie });
      results.push({ name: 'verify', ok: verify.status === 200 && verify.body?.user?.email === 'admin@pressup.com' });

      // settings save (appearance)
      const appearance = { themeMode: 'light', primaryColor: '#10b981', logo_asset_id: null };
      const put = await request('PUT', '/api/settings/appearance', appearance, { Cookie: tokenCookie });
      results.push({ name: 'settings.save', ok: put.status === 200 && put.body?.ok === true });

      // create draft post
      const title = 'QA Draft ' + Date.now();
      const create = await request(
        'POST',
        '/api/posts',
        { title, status: 'draft', content: {} },
        { Cookie: tokenCookie }
      );
      const postId = create.body?.id;
      results.push({ name: 'posts.create', ok: create.status === 201 && !!postId, detail: postId });

      // publish
      if (postId) {
        const pub = await request('POST', `/api/posts/${postId}/publish`, undefined, { Cookie: tokenCookie });
        results.push({ name: 'posts.publish', ok: pub.status === 200 && pub.body?.status === 'published' });
      }
    } else {
      results.push({ name: 'verify', ok: false, detail: 'Skipped: No token available' });
      results.push({ name: 'settings.save', ok: false, detail: 'Skipped: No token available' });
      results.push({ name: 'posts.create', ok: false, detail: 'Skipped: No token available' });
      results.push({ name: 'posts.publish', ok: false, detail: 'Skipped: No token available' });
    }

  } catch (e: any) {
    results.push({ name: 'qa.error', ok: false, detail: e?.message || String(e) });
  }

  // Output summary
  const pass = results.every((r) => r.ok);
  for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'} - ${r.name}${r.detail ? ' - ' + r.detail : ''}`);
  }
  process.exit(pass ? 0 : 1);
}

run();
