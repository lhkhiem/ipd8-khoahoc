/**
 * Profile Controller for Public Backend
 * - User profile management
 * - Get, update, change password, upload avatar
 */

import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

/**
 * Get user profile
 * GET /api/public/profile
 * Requires authentication
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

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
      data: user,
    });
  } catch (error: any) {
    console.error('[ProfileController] GetProfile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Update user profile
 * PUT /api/public/profile
 * Body: { name?, phone?, address?, gender?, dob? }
 * Requires authentication
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const { name, phone, address, gender, dob } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Update allowed fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (gender !== undefined) updateData.gender = gender;
    if (dob !== undefined) updateData.dob = dob;

    await user.update(updateData);

    // Fetch updated user (exclude password)
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('[ProfileController] UpdateProfile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Change password
 * POST /api/public/profile/change-password
 * Body: { currentPassword, newPassword }
 * Requires authentication
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'currentPassword and newPassword are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters',
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user || !user.password_hash) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password_hash: hashedPassword });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('[ProfileController] ChangePassword error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Upload avatar
 * POST /api/public/profile/avatar
 * Body: multipart/form-data with file
 * Requires authentication
 */
export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    // TODO: Implement file upload with multer
    // For now, return error
    res.status(501).json({
      success: false,
      error: 'Avatar upload not implemented yet',
      message: 'TODO: Implement file upload with multer and save to shared-storage',
    });
  } catch (error: any) {
    console.error('[ProfileController] UploadAvatar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};


















