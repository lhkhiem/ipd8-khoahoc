// Public User Controller
// Customer account management: profile, addresses, wishlist

import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import User from '../../models/User';
import Address from '../../models/Address';
import sequelize from '../../config/database';
import { QueryTypes, Op } from 'sequelize';

// Get user profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: (user as any).first_name,
        lastName: (user as any).last_name,
        phone: (user as any).phone,
        avatar: (user as any).avatar,
        role: (user as any).role,
      },
    });
  } catch (error: any) {
    console.error('Failed to get profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { firstName, lastName, name, phone, avatar } = req.body;

    const updateFields: any = {};
    if (firstName !== undefined) updateFields.first_name = firstName;
    if (lastName !== undefined) updateFields.last_name = lastName;
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone || null;
    if (avatar !== undefined) updateFields.avatar = avatar;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.updated_at = new Date();

    await User.update(updateFields, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId);
    res.json({
      data: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        name: updatedUser!.name,
        firstName: (updatedUser as any).first_name,
        lastName: (updatedUser as any).last_name,
        phone: (updatedUser as any).phone || null,
        avatar: (updatedUser as any).avatar,
      },
    });
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get user addresses
export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const addresses = await Address.findAll({
      where: { user_id: userId },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']],
    });

    res.json({ data: addresses });
  } catch (error: any) {
    console.error('Failed to get addresses:', error);
    res.status(500).json({ error: 'Failed to get addresses' });
  }
};

// Add address
export const addAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      first_name,
      last_name,
      company,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default,
      type,
    } = req.body;

    // If this is set as default, unset other defaults of the same type
    if (is_default) {
      await Address.update(
        { is_default: false },
        {
          where: {
            user_id: userId,
            type: type || 'both',
          },
        }
      );
    }

    const address = await Address.create({
      user_id: userId,
      first_name,
      last_name,
      company,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country: country || 'United States',
      phone,
      is_default: is_default || false,
      type: type || 'both',
    });

    res.status(201).json({ data: address });
  } catch (error: any) {
    console.error('Failed to add address:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
};

// Update address
export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const address = await Address.findOne({ where: { id, user_id: userId } });
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const {
      first_name,
      last_name,
      company,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default,
      type,
    } = req.body;

    // If this is set as default, unset other defaults of the same type
    if (is_default && !address.is_default) {
      await Address.update(
        { is_default: false },
        {
          where: {
            user_id: userId,
            id: { [Op.ne]: id },
            type: type || address.type,
          },
        }
      );
    }

    const updateFields: any = {};
    if (first_name !== undefined) updateFields.first_name = first_name;
    if (last_name !== undefined) updateFields.last_name = last_name;
    if (company !== undefined) updateFields.company = company;
    if (address_line1 !== undefined) updateFields.address_line1 = address_line1;
    if (address_line2 !== undefined) updateFields.address_line2 = address_line2;
    if (city !== undefined) updateFields.city = city;
    if (state !== undefined) updateFields.state = state;
    if (postal_code !== undefined) updateFields.postal_code = postal_code;
    if (country !== undefined) updateFields.country = country;
    if (phone !== undefined) updateFields.phone = phone;
    if (is_default !== undefined) updateFields.is_default = is_default;
    if (type !== undefined) updateFields.type = type;

    updateFields.updated_at = new Date();

    await Address.update(updateFields, { where: { id, user_id: userId } });

    const updatedAddress = await Address.findByPk(id);
    res.json({ data: updatedAddress });
  } catch (error: any) {
    console.error('Failed to update address:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
};

// Delete address
export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const address = await Address.findOne({ where: { id, user_id: userId } });
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    await Address.destroy({ where: { id, user_id: userId } });
    res.json({ data: { id } });
  } catch (error: any) {
    console.error('Failed to delete address:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
};

// Get wishlist
export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = `
      SELECT 
        w.id,
        w.product_id,
        w.created_at,
        p.name as product_name,
        p.slug as product_slug,
        p.price,
        p.compare_price,
        p.thumbnail_url,
        p.status
      FROM wishlist_items w
      INNER JOIN products p ON w.product_id = p.id
      WHERE w.user_id = :userId
      ORDER BY w.created_at DESC
    `;

    const items = await sequelize.query(query, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });

    res.json({ data: items });
  } catch (error: any) {
    console.error('Failed to get wishlist:', error);
    res.status(500).json({ error: 'Failed to get wishlist' });
  }
};

// Add to wishlist
export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { product_id } = req.body;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    // Check if already in wishlist
    const existing = await sequelize.query(
      'SELECT id FROM wishlist_items WHERE user_id = :userId AND product_id = :productId',
      {
        replacements: { userId, productId: product_id },
        type: QueryTypes.SELECT,
      }
    );

    if ((existing as any[]).length > 0) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    const query = `
      INSERT INTO wishlist_items (id, user_id, product_id, created_at)
      VALUES (gen_random_uuid(), :userId, :productId, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const [result] = await sequelize.query(query, {
      replacements: { userId, productId: product_id },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({ data: result });
  } catch (error: any) {
    console.error('Failed to add to wishlist:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = `
      DELETE FROM wishlist_items
      WHERE id = :id AND user_id = :userId
      RETURNING id
    `;

    const result = await sequelize.query(query, {
      replacements: { id, userId },
      type: QueryTypes.DELETE,
    });

    if ((result[0] as any[]).length === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.json({ data: { id } });
  } catch (error: any) {
    console.error('Failed to remove from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
};

