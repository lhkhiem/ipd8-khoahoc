// Public Auth Controller
// Customer authentication with refresh token support

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import { getJWTSecret, getJWTRefreshSecret } from '../../utils/jwtSecret';

// Register customer
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ email và mật khẩu' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email này đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      name: name || `${firstName || ''} ${lastName || ''}`.trim() || email,
      role: 'customer',
      status: 'active',
    });

    // Generate tokens
    const jwtSecret = getJWTSecret();
    const refreshSecret = getJWTRefreshSecret();
    
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: (user as any).role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as any
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      refreshSecret,
      { expiresIn: '7d' } as any
    );

    res.status(201).json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          firstName: firstName || null,
          lastName: lastName || null,
          role: (user as any).role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Đăng ký thất bại. Vui lòng thử lại sau' });
  }
};

// Login customer
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ email và mật khẩu' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    // Generate tokens
    const jwtSecret = getJWTSecret();
    const refreshSecret = getJWTRefreshSecret();
    
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: (user as any).role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as any
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      refreshSecret,
      { expiresIn: '7d' } as any
    );

    // Set HTTP-only cookie for session (optional, for cookie-based auth)
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    res.cookie('token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: maxAgeMs,
      path: '/',
    });

    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          firstName: (user as any).first_name,
          lastName: (user as any).last_name,
          role: (user as any).role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Đăng nhập thất bại. Vui lòng thử lại sau' });
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

// Get current user (me)
export const me = async (req: Request, res: Response) => {
  try {
    const header = req.headers.cookie || '';
    const cookies = header.split(';').reduce((acc: any, p) => {
      const [k, ...v] = p.trim().split('=');
      if (k) acc[k] = decodeURIComponent(v.join('='));
      return acc;
    }, {} as Record<string, string>);
    const bearer = req.headers.authorization?.split(' ')[1];
    const token = bearer || cookies['token'];

    if (!token) {
      return res.status(401).json({ error: 'No session' });
    }

    const jwtSecret = getJWTSecret();
    const decoded: any = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          firstName: (user as any).first_name,
          lastName: (user as any).last_name,
          role: (user as any).role,
        },
      },
    });
  } catch (error: any) {
    console.error('Get me failed:', error);
    return res.status(401).json({ error: 'Invalid session' });
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
  res.json({ data: { ok: true } });
};

