/**
 * Authentication Controller for Public Backend
 * - User-level authentication (not admin)
 * - Register, login, logout, profile, password reset
 */

import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { UserProfile, UserPregnancy, UserChild } from '../models';
import { getJWTSecret } from '../utils/jwtSecret';
import { AuthRequest } from '../middleware/auth';

// Initialize Google OAuth client
const getGoogleOAuthClient = (): OAuth2Client | null => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return null;
  }
  return new OAuth2Client(clientId);
};

/**
 * Register new user
 * POST /api/public/auth/register
 * Body: { email, password, name, phone?, userType?, dueDate?, childAge? }
 * userType: 'pregnant' | 'mom'
 * dueDate: Date string (YYYY-MM-DD) - nếu là mẹ bầu
 * childAge: number (months) - nếu là mẹ bỉm
 */
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, phone, location, address, userType, dueDate, childAge } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    // Theo DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md: role default là 'guest'
    // Map location từ frontend sang address trong database
    const userAddress = address || location || null;
    
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      name,
      phone: phone || null,
      address: userAddress, // Lưu địa chỉ vào database
      role: 'guest', // Default role cho user đăng ký mới
      is_active: true,
    });

    // Create user profile if userType is provided
    if (userType && ['pregnant', 'mom'].includes(userType)) {
      const profileData: any = {
        user_id: user.id,
        user_type: userType,
      };

      if (userType === 'pregnant' && dueDate) {
        profileData.current_due_date = dueDate;
      }

      const profile = await UserProfile.create(profileData);

      // Create pregnancy if dueDate provided
      if (userType === 'pregnant' && dueDate) {
        // Kiểm tra xem đã có active pregnancy chưa (đảm bảo không duplicate)
        // Trong cùng một thời điểm không thể có nhiều hơn 1 chu kỳ thai active
        const existingActivePregnancy = await UserPregnancy.findOne({
          where: {
            user_id: user.id,
            status: 'active',
          },
        });

        // Chỉ tạo mới nếu chưa có active pregnancy
        if (!existingActivePregnancy) {
          // Calculate pregnancy weeks
          const due = new Date(dueDate);
          const today = new Date();
          const diffTime = due.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const pregnancyWeeks = Math.floor((280 - diffDays) / 7); // 280 days = 40 weeks
          
          await UserPregnancy.create({
            user_id: user.id,
            user_profile_id: profile.id,
            due_date: dueDate,
            pregnancy_weeks: (pregnancyWeeks > 0 && pregnancyWeeks <= 42) ? pregnancyWeeks : null,
            status: 'active',
          });
        }
      }

      // Create child if childAge provided (for mom type)
      if (userType === 'mom' && childAge) {
        const ageMonths = parseInt(childAge);
        if (!isNaN(ageMonths) && ageMonths >= 0) {
          const today = new Date();
          const birthDate = new Date(today.getFullYear(), today.getMonth() - ageMonths, today.getDate());
          
          await UserChild.create({
            user_id: user.id,
            user_profile_id: profile.id,
            name: 'Con của bạn', // Default name, user can update later
            birth_date: birthDate.toISOString().split('T')[0],
            age_in_months: ageMonths,
          });
        }
      }
    }

    // Generate JWT token
    const jwtSecret = getJWTSecret();
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn } as jwt.SignOptions
    );

    // Set HTTP-only cookie
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: maxAgeMs,
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    console.error('[AuthController] Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Login user
 * POST /api/public/auth/login
 * Body: { email, password } hoặc { phone, password }
 * Support login bằng email hoặc phone
 */
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, phone, password } = req.body;

    // Validate input
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        error: 'Email or phone is required',
      });
    }

    // Find user by email or phone
    let user;
    if (email) {
      user = await User.findOne({ where: { email } });
    } else if (phone) {
      user = await User.findOne({ where: { phone } });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email/phone or password',
      });
    }

    // Check password
    if (!user.password_hash) {
      return res.status(500).json({
        success: false,
        error: 'Account configuration error',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive',
      });
    }

    // Update last login
    await user.update({ last_login_at: new Date() });

    // Generate JWT token
    const jwtSecret = getJWTSecret();
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn } as jwt.SignOptions
    );

    // Set HTTP-only cookie
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: maxAgeMs,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          avatar_url: user.avatar_url,
        },
      },
    });
  } catch (error: any) {
    console.error('[AuthController] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Logout user
 * POST /api/public/auth/logout
 * Requires authentication
 */
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // Clear cookie
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('[AuthController] Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
};

/**
 * Get current user
 * GET /api/public/auth/me
 * Requires authentication
 */
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    // Fetch full user data
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dob: user.dob,
        avatar_url: user.avatar_url,
        role: user.role,
        is_active: user.is_active,
        email_verified: user.email_verified,
        phone_verified: user.phone_verified,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('[AuthController] GetMe error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Forgot password
 * POST /api/public/auth/forgot-password
 * Body: { email }
 */
export const forgotPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists (security best practice)
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    }

    // TODO: Send password reset email
    // For now, just return success
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  } catch (error: any) {
    console.error('[AuthController] ForgotPassword error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request',
    });
  }
};

/**
 * Reset password
 * POST /api/public/auth/reset-password
 * Body: { token, password }
 */
export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token and password are required',
      });
    }

    // TODO: Verify reset token and update password
    // For now, return error
    res.status(501).json({
      success: false,
      error: 'Password reset not implemented yet',
    });
  } catch (error: any) {
    console.error('[AuthController] ResetPassword error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
    });
  }
};

/**
 * Google OAuth Login/Register
 * POST /api/public/auth/google
 * Body: { idToken }
 */
export const googleAuth = async (req: AuthRequest, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'Google ID token is required',
      });
    }

    const client = getGoogleOAuthClient();
    if (!client) {
      return res.status(500).json({
        success: false,
        error: 'Google OAuth chưa được cấu hình. Vui lòng liên hệ quản trị viên',
      });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Google token',
      });
    }

    const { email, name, picture, email_verified, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Không thể lấy email từ Google account',
      });
    }

    // Find or create user
    let user = await User.findOne({ where: { email } });
    let isNewUser = false;

    if (user) {
      // User exists - update last login and avatar if needed
      await user.update({
        last_login_at: new Date(),
        avatar_url: picture || user.avatar_url,
        email_verified: email_verified || user.email_verified,
      });
    } else {
      // Create new user from Google account
      // Generate a random password hash (user won't use password login)
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        email,
        password_hash: hashedPassword, // Random password, user will use Google login
        name: name || email.split('@')[0],
        role: 'guest', // IPD8: default role for new users
        avatar_url: picture,
        is_active: true,
        email_verified: email_verified || false,
        phone_verified: false,
        last_login_at: new Date(),
      });
      isNewUser = true;
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên',
      });
    }

    // Generate JWT token
    const jwtSecret = getJWTSecret();
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn } as jwt.SignOptions
    );

    // Set HTTP-only cookie
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: maxAgeMs,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          is_active: user.is_active,
          avatar_url: user.avatar_url,
          email_verified: user.email_verified,
        },
        isNewUser,
      },
    });
  } catch (error: any) {
    console.error('[AuthController] GoogleAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Đăng nhập với Google thất bại. Vui lòng thử lại sau',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};


