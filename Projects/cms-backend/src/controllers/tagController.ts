import { Request, Response } from 'express';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import { logActivity } from './activityLogController';

// Get all tags
export const getTags = async (req: Request, res: Response) => {
  try {
    const { is_active, sort } = req.query;
    
    let query = 'SELECT * FROM tags';
    const replacements: any = {};
    
    if (is_active !== undefined) {
      query += ' WHERE is_active = :is_active';
      replacements.is_active = is_active === 'true';
    }
    
    // Sort by post_count or name
    if (sort === 'popular') {
      query += ' ORDER BY post_count DESC, name ASC';
    } else {
      query += ' ORDER BY name ASC';
    }
    
    const tags = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });
    
    res.json(tags);
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
};

// Get tag by ID
export const getTagById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM tags WHERE id = :id';
    const tags: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    
    if (tags.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    res.json(tags[0]);
  } catch (error) {
    console.error('Failed to fetch tag:', error);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
};

// Create tag
export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, color, is_active } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }
    
    const query = `
      INSERT INTO tags (name, slug, description, color, is_active)
      VALUES (:name, :slug, :description, :color, :is_active)
      RETURNING *
    `;
    
    const result: any = await sequelize.query(query, {
      replacements: {
        name,
        slug,
        description: description || null,
        color: color || null,
        is_active: is_active !== undefined ? is_active : true
      },
      type: QueryTypes.INSERT
    });
    
    const tag = result[0][0];
    
    // Log activity
    await logActivity(req, 'create', 'tag', tag.id, name, `Created tag "${name}"`);
    
    res.status(201).json(tag);
  } catch (error: any) {
    console.error('Failed to create tag:', error);
    if (error.original?.constraint === 'tags_slug_key') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create tag' });
  }
};

// Update tag
export const updateTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, color, is_active } = req.body;
    
    const updateFields: string[] = [];
    const replacements: any = { id };
    
    if (name !== undefined) { updateFields.push('name = :name'); replacements.name = name; }
    if (slug !== undefined) { updateFields.push('slug = :slug'); replacements.slug = slug; }
    if (description !== undefined) { updateFields.push('description = :description'); replacements.description = description; }
    if (color !== undefined) { updateFields.push('color = :color'); replacements.color = color; }
    if (is_active !== undefined) { updateFields.push('is_active = :is_active'); replacements.is_active = is_active; }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const query = `
      UPDATE tags
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;
    
    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });
    
    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    const updatedTag = result[0][0];
    
    // Log activity
    await logActivity(req, 'update', 'tag', id, updatedTag.name, `Updated tag "${updatedTag.name}"`);
    
    res.json(updatedTag);
  } catch (error: any) {
    console.error('Failed to update tag:', error);
    if (error.original?.constraint === 'tags_slug_key') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update tag' });
  }
};

// Delete tag
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get tag name before deleting
    const getTagQuery = 'SELECT name FROM tags WHERE id = :id';
    const tagResult: any = await sequelize.query(getTagQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    
    const tagName = tagResult[0]?.name || 'Unknown';
    
    const query = 'DELETE FROM tags WHERE id = :id RETURNING *';
    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    
    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    // Log activity
    await logActivity(req, 'delete', 'tag', id, tagName, `Deleted tag "${tagName}"`);
    
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
};
