/**
 * Profile Controller for Public Backend
 * - User profile management
 * - Get, update, change password, upload avatar
 */

import { Response } from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { getAvatarUrl } from '../middleware/upload';

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

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Log file info for debugging
    console.log('[ProfileController] UploadAvatar - File received:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      destination: req.file.destination,
    });

    // Verify file actually exists on disk
    if (!fs.existsSync(req.file.path)) {
      console.error('[ProfileController] ERROR: Uploaded file does not exist at path:', req.file.path);
      return res.status(500).json({
        success: false,
        error: 'File was not saved correctly',
      });
    }

    // Get file stats to verify
    const fileStats = fs.statSync(req.file.path);
    console.log('[ProfileController] File saved successfully:', {
      path: req.file.path,
      size: fileStats.size,
      exists: fs.existsSync(req.file.path),
    });

    // Get avatar URL
    const avatarUrl = getAvatarUrl(req.file.filename);
    console.log('[ProfileController] UploadAvatar - Generated URL:', avatarUrl);

    // Update user's avatar_url in database
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Delete old avatar file if exists
    if (user.avatar_url) {
      try {
        const oldFilename = user.avatar_url.split('/').pop();
        if (oldFilename) {
          // Get backend root directory
          const backendRoot = path.resolve(__dirname, '../..');
          let uploadDir: string;
          
          // Check if STORAGE_UPLOADS_PATH is set and is a valid path (not a template variable)
          const storageUploadsPath = process.env.STORAGE_UPLOADS_PATH;
          if (storageUploadsPath && !storageUploadsPath.includes('${') && !storageUploadsPath.includes('$SHARED')) {
            uploadDir = path.isAbsolute(storageUploadsPath)
              ? path.join(storageUploadsPath, 'avatars')
              : path.join(path.resolve(backendRoot, storageUploadsPath), 'avatars');
          } else if (process.env.SHARED_STORAGE_PATH) {
            const sharedPath = path.isAbsolute(process.env.SHARED_STORAGE_PATH)
              ? process.env.SHARED_STORAGE_PATH
              : path.resolve(backendRoot, process.env.SHARED_STORAGE_PATH);
            uploadDir = path.join(sharedPath, 'uploads', 'avatars');
          } else {
            uploadDir = path.join(backendRoot, 'uploads', 'avatars');
          }
          const oldFilePath = path.join(uploadDir, oldFilename);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log('[ProfileController] Deleted old avatar:', oldFilePath);
          }
        }
      } catch (deleteError) {
        // Log but don't fail if old file deletion fails
        console.warn('[ProfileController] Failed to delete old avatar:', deleteError);
      }
    }

    // Update user with new avatar URL
    await user.update({ avatar_url: avatarUrl });
    console.log('[ProfileController] Updated user avatar_url to:', avatarUrl);

    // Fetch updated user (exclude password)
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch updated user',
      });
    }

    console.log('[ProfileController] Returning user data with avatar_url:', updatedUser.avatar_url);

    res.json({
      success: true,
      data: updatedUser,
      message: 'Avatar uploaded successfully',
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























