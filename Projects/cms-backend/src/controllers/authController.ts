// Controller xác thực (Auth)
// - Chứa các hàm đăng ký và đăng nhập cơ bản
// - Lưu ý: hiện lưu password đã hash vào trường `password_hash` trong bảng users

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { getJWTSecret } from '../utils/jwtSecret';

// Đăng ký user mới
// Body: { email, password, name }
// Trả về: id, email, name (không trả password)
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      name,
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error: any) {
    console.error('Registration failed:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    res.status(500).json({ 
      error: 'Registration failed',
      message: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

// Đăng nhập và phát JWT
// Body: { email, password }
// Trả về: { token, user }
export const login = async (req: Request, res: Response) => {
  try {
    console.log('[Login] Login attempt:', { email: req.body?.email, hasPassword: !!req.body?.password });
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('[Login] Missing email or password');
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ email và mật khẩu' });
    }

    console.log('[Login] Looking up user:', email);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('[Login] User not found:', email);
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }
    console.log('[Login] User found:', { id: user.id, email: user.email, hasPasswordHash: !!user.password_hash });

    // Check if user has a password hash
    if (!user.password_hash) {
      console.error('User found but password_hash is missing:', { userId: user.id, email: user.email });
      return res.status(500).json({ error: 'Lỗi cấu hình tài khoản. Vui lòng liên hệ quản trị viên' });
    }

    console.log('[Login] Validating password...');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      console.log('[Login] Invalid password for user:', email);
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }
    console.log('[Login] Password valid, generating token...');

    const jwtSecret = getJWTSecret();
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
    if (!jwtExpiresIn) {
      throw new Error('JWT_EXPIRES_IN environment variable is required. Please set it in .env.local file.');
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: (user as any).role },
      jwtSecret,
      { expiresIn: jwtExpiresIn } as any
    );
    console.log('[Login] Token generated, setting cookie...');

    // Set HTTP-only cookie for session
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    // Determine if we're in development (localhost)
    // Check multiple sources to detect localhost environment
    const baseUrl = process.env.BASE_URL || process.env.CMS_API_BASE_URL || '';
    const apiDomain = process.env.API_DOMAIN || '';
    const isLocalhost = 
      process.env.NODE_ENV === 'development' ||
      baseUrl.includes('localhost') ||
      baseUrl.includes('127.0.0.1') ||
      apiDomain.includes('localhost') ||
      apiDomain.includes('127.0.0.1') ||
      !apiDomain || // No API_DOMAIN set = likely development
      apiDomain === 'localhost' ||
      apiDomain === '127.0.0.1';
    
    // Set domain for cross-subdomain cookie sharing
    // Allow cookie to be shared between API domain and Admin domain (from env)
    const cookieOptions: any = {
      httpOnly: true,
      // For localhost development: use 'lax' (works for same-site)
      // For production: use 'lax' (secure cookies)
      sameSite: 'lax',
      secure: !isLocalhost, // Only secure in production
      maxAge: maxAgeMs,
      path: '/',
    };
    
    // Set domain for cross-subdomain cookie sharing (ONLY in production, NOT for localhost)
    // For localhost, NEVER set domain - this allows cookie to work across different ports
    if (!isLocalhost && apiDomain && apiDomain !== 'localhost' && apiDomain !== '127.0.0.1') {
      // Extract root domain from API_DOMAIN env (e.g., 'example.com' from 'api.example.com')
      const rootDomain = apiDomain.split('.').slice(-2).join('.');
      if (rootDomain && rootDomain !== 'localhost' && !rootDomain.includes('127.0.0.1')) {
        cookieOptions.domain = `.${rootDomain}`;
      }
    }
    
    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Login] Cookie domain detection:', {
        baseUrl,
        apiDomain,
        isLocalhost,
        willSetDomain: !!cookieOptions.domain,
        cookieDomain: cookieOptions.domain || 'not set (localhost)',
      });
    }
    
    // Set cookie BEFORE sending response
    res.cookie('token', token, cookieOptions);
    
    // Log cookie details for debugging
    console.log('[Login] Cookie set with options:', {
      httpOnly: cookieOptions.httpOnly,
      sameSite: cookieOptions.sameSite,
      secure: cookieOptions.secure,
      path: cookieOptions.path,
      domain: cookieOptions.domain || 'not set (localhost)',
      maxAge: cookieOptions.maxAge,
      isLocalhost, // Using isLocalhost (defined above) instead of isDevelopment
    });
    
    // Verify cookie was set by checking response headers
    const setCookieHeader = res.getHeader('Set-Cookie');
    console.log('[Login] Set-Cookie header:', setCookieHeader);
    console.log('[Login] Response headers:', {
      'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials'),
      'Set-Cookie': setCookieHeader,
    });
    
    console.log('[Login] Sending response...');

    const response = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user as any).role,
      },
    };
    console.log('[Login] Login successful:', { userId: user.id, email: user.email });
    res.json(response);
  } catch (error: any) {
    console.error('[Login] Login failed:', error);
    console.error('[Login] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      parent: error?.parent?.message,
      sql: error?.sql,
      original: error?.original?.message,
    });
    
    // Check if it's a database permission error
    if (error?.parent?.code === '42501' || error?.code === '42501') {
      console.error('[Login] Database permission denied! Check DB_USER permissions.');
      return res.status(500).json({ 
        error: 'Lỗi quyền truy cập cơ sở dữ liệu',
        message: process.env.NODE_ENV === 'development' ? 'Database user does not have permission to access users table' : undefined
      });
    }
    
    // Check if it's a database connection error
    if (error?.parent?.code === 'ECONNREFUSED' || error?.code === 'ECONNREFUSED') {
      console.error('[Login] Database connection refused! Check if PostgreSQL is running.');
      return res.status(500).json({ 
        error: 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau',
        message: process.env.NODE_ENV === 'development' ? 'Cannot connect to database' : undefined
      });
    }
    
    res.status(500).json({ 
      error: 'Đăng nhập thất bại. Vui lòng thử lại sau',
      message: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

// Xác thực session hiện tại từ cookie và trả về user
export const verify = async (req: Request, res: Response) => {
  try {
    const header = req.headers.cookie || '';
    const cookies = header.split(';').reduce((acc: any, p) => {
      const [k, ...v] = p.trim().split('=');
      if (k) acc[k] = decodeURIComponent(v.join('='));
      return acc;
    }, {} as Record<string, string>);
    const bearer = req.headers.authorization?.split(' ')[1];
    const token = bearer || cookies['token'];
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Verify] Request details:', {
        hasCookieHeader: !!header,
        cookieHeaderLength: header.length,
        cookieKeys: Object.keys(cookies),
        hasTokenCookie: !!cookies['token'],
        hasBearerToken: !!bearer,
        hasToken: !!token,
        origin: req.headers.origin,
        referer: req.headers.referer,
      });
    }
    
    // 401 khi không có token là expected behavior, không cần log chi tiết
    if (!token) {
      return res.status(401).json({ error: 'No session' });
    }
    
    const jwtSecret = getJWTSecret();
    const decoded: any = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    // Chỉ log khi verify thành công (có session hợp lệ)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Verify] Session verified:', { userId: user.id, email: user.email });
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user as any).role,
      },
    });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid session' });
  }
};

// Đăng xuất: xóa cookie token
export const logout = async (_req: Request, res: Response) => {
  const logoutCookieOptions: any = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
  };
  
  // Get API domain from env - required in production
  const apiDomain = process.env.API_DOMAIN;
  if (!apiDomain && process.env.NODE_ENV === 'production') {
    console.warn('[Logout] API_DOMAIN not set in production environment');
  }
  if (apiDomain && !apiDomain.includes('localhost')) {
    const rootDomain = apiDomain.split('.').slice(-2).join('.');
    if (rootDomain && rootDomain !== 'localhost' && !rootDomain.includes('127.0.0.1')) {
      logoutCookieOptions.domain = `.${rootDomain}`;
    }
  }
  
  res.cookie('token', '', logoutCookieOptions);
  res.json({ ok: true });
};

