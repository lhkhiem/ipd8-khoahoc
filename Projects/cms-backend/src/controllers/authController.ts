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
    const token = jwt.sign(
      { id: user.id, email: user.email, role: (user as any).role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    );
    console.log('[Login] Token generated, setting cookie...');

    // Set HTTP-only cookie for session
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    // Set domain for cross-subdomain cookie sharing
    // Allow cookie to be shared between api.banyco.vn and admin.banyco.vn
    const cookieOptions: any = {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: maxAgeMs,
      path: '/',
    };
    
    // Set domain for cross-subdomain cookie sharing (always in production-like environment)
    const apiDomain = process.env.API_DOMAIN || process.env.BASE_URL?.replace(/https?:\/\//, '').split(':')[0] || 'api.banyco.vn';
    if (apiDomain && !apiDomain.includes('localhost')) {
      // Extract root domain (e.g., 'banyco.vn' from 'api.banyco.vn')
      const rootDomain = apiDomain.split('.').slice(-2).join('.');
      if (rootDomain && rootDomain !== 'localhost' && !rootDomain.includes('127.0.0.1')) {
        cookieOptions.domain = `.${rootDomain}`;
      }
    }
    
    res.cookie('token', token, cookieOptions);
    console.log('[Login] Cookie set, sending response...');

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
  
  const apiDomain = process.env.API_DOMAIN || 'api.banyco.vn';
  if (apiDomain && !apiDomain.includes('localhost')) {
    const rootDomain = apiDomain.split('.').slice(-2).join('.');
    if (rootDomain && rootDomain !== 'localhost' && !rootDomain.includes('127.0.0.1')) {
      logoutCookieOptions.domain = `.${rootDomain}`;
    }
  }
  
  res.cookie('token', '', logoutCookieOptions);
  res.json({ ok: true });
};

