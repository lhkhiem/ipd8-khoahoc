import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Get all menu locations
export const getMenuLocations = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        ml.*,
        COUNT(mi.id) as item_count
      FROM menu_locations ml
      LEFT JOIN menu_items mi ON ml.id = mi.menu_location_id
      GROUP BY ml.id
      ORDER BY ml.created_at DESC
    `;
    
    const locations: any = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({ data: locations });
  } catch (error) {
    console.error('Failed to fetch menu locations:', error);
    res.status(500).json({ error: 'Failed to fetch menu locations' });
  }
};

// Get single menu location
export const getMenuLocationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT * FROM menu_locations WHERE id = :id
    `;
    
    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Menu location not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Failed to fetch menu location:', error);
    res.status(500).json({ error: 'Failed to fetch menu location' });
  }
};

// Create menu location
export const createMenuLocation = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, is_active } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const id = uuidv4();

    const query = `
      INSERT INTO menu_locations (id, name, slug, description, is_active)
      VALUES (:id, :name, :slug, :description, :is_active)
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        name,
        slug,
        description: description || null,
        is_active: is_active !== undefined ? is_active : true
      },
      type: QueryTypes.INSERT
    });

    res.status(201).json(result[0][0]);
  } catch (error: any) {
    console.error('Failed to create menu location:', error);
    if (error.original?.constraint === 'menu_locations_slug_key') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create menu location' });
  }
};

// Update menu location
export const updateMenuLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, is_active } = req.body;

    const updateFields: string[] = [];
    const replacements: any = { id };

    if (name !== undefined) {
      updateFields.push('name = :name');
      replacements.name = name;
    }
    if (slug !== undefined) {
      updateFields.push('slug = :slug');
      replacements.slug = slug;
    }
    if (description !== undefined) {
      updateFields.push('description = :description');
      replacements.description = description;
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = :is_active');
      replacements.is_active = is_active;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE menu_locations
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Menu location not found' });
    }

    res.json(result[0][0]);
  } catch (error: any) {
    console.error('Failed to update menu location:', error);
    if (error.original?.constraint === 'menu_locations_slug_key') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update menu location' });
  }
};

// Delete menu location
export const deleteMenuLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result: any = await sequelize.query(
      'DELETE FROM menu_locations WHERE id = :id RETURNING *',
      {
        replacements: { id },
        type: QueryTypes.DELETE
      }
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Menu location not found' });
    }

    res.json({ message: 'Menu location deleted successfully' });
  } catch (error) {
    console.error('Failed to delete menu location:', error);
    res.status(500).json({ error: 'Failed to delete menu location' });
  }
};






































