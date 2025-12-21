// Public Auth Controller
// Guest/Student authentication with refresh token support (IPD8)

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import { getJWTSecret, getJWTRefreshSecret } from '../../utils/jwtSecret';

// Password validation helper
const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 8) {
    return { valid: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Mật khẩu phải chứa ít nhất một chữ cái thường' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Mật khẩu phải chứa ít nhất một chữ cái hoa' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, error: 'Mật khẩu phải chứa ít nhất một số' };
  }
  return { valid: true };
};

// Email validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Register guest/student
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ email và mật khẩu' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email không hợp lệ' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email này đã được sử dụng' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role 'guest' (default for IPD8)
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      name: name || email.split('@')[0], // Default name from email if not provided
      role: 'guest', // IPD8: guest, student, instructor, admin
      phone,
      is_active: true, // IPD8 uses is_active instead of status
      email_verified: false,
      phone_verified: false,
    });

    // Generate tokens
    const jwtSecret = getJWTSecret();
    const refreshSecret = getJWTRefreshSecret();
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpiresIn } as any
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      refreshSecret,
      { expiresIn: '30d' } as any
    );

    // Set HTTP-only cookie for session
    const maxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    res.cookie('token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: maxAgeMs,
      path: '/',
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          is_active: user.is_active,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('[Register] Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Đăng ký thất bại. Vui lòng thử lại sau',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

// Login guest/student
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Vui lòng nhập đầy đủ email và mật khẩu' 
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        success: false,
        error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên' 
      });
    }

    // Check password
    if (!user.password_hash) {
      console.error('[Login] User found but password_hash is missing:', { userId: user.id, email: user.email });
      return res.status(500).json({ 
        success: false,
        error: 'Lỗi cấu hình tài khoản. Vui lòng liên hệ quản trị viên' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    // Update last_login_at
    await user.update({ last_login_at: new Date() });

    // Generate tokens
    const jwtSecret = getJWTSecret();
    const refreshSecret = getJWTRefreshSecret();
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpiresIn } as any
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      refreshSecret,
      { expiresIn: '30d' } as any
    );

    // Set HTTP-only cookie for session
    const maxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    res.cookie('token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: maxAgeMs,
      path: '/',
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          is_active: user.is_active,
          avatar_url: user.avatar_url,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('[Login] Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Đăng nhập thất bại. Vui lòng thử lại sau',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

// Refresh access token
export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const refreshSecret = getJWTRefreshSecret();
    const decoded: any = jwt.verify(refreshToken, refreshSecret);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const jwtSecret = getJWTSecret();
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: (user as any).role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as any
    );

    res.json({
      data: {
        accessToken,
      },
    });
  } catch (error: any) {
    console.error('Token refresh failed:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Get current user (me) - uses authMiddleware, so user is already in req.user
export const me = async (req: Request, res: Response) => {
  try {
    // authMiddleware should have set req.user
    const authReq = req as any;
    const userId = authReq.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Không tìm thấy thông tin đăng nhập' 
      });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'name', 'phone', 'role', 'is_active', 'avatar_url', 'email_verified', 'phone_verified', 'created_at'],
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Người dùng không tồn tại' 
      });
    }

    if (!user.is_active) {
      return res.status(403).json({ 
        success: false,
        error: 'Tài khoản của bạn đã bị khóa' 
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          is_active: user.is_active,
          avatar_url: user.avatar_url,
          email_verified: user.email_verified,
          phone_verified: user.phone_verified,
          created_at: user.created_at,
        },
      },
    });
  } catch (error: any) {
    console.error('[Me] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Lỗi khi lấy thông tin người dùng' 
    });
  }
};

// Logout
export const logout = async (_req: Request, res: Response) => {
  res.cookie('token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
  });
  res.json({ 
    success: true,
    data: { message: 'Đăng xuất thành công' } 
  });
};


