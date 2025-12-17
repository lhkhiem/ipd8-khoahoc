import { Request, Response } from 'express';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from './activityLogController';

export const getAllSliders = async (req: Request, res: Response) => {
  try {
    console.log('[getAllSliders] Fetching sliders...');
    const { active_only } = req.query;
    
    // Build WHERE clause
    let whereClause = '';
    if (active_only === 'true') {
      whereClause = 'WHERE s.is_active = true';
    }
    
    const query = `
      SELECT 
        s.*,
        a.url as asset_url,
        a.cdn_url as asset_cdn_url,
        a.sizes as asset_sizes
      FROM sliders s
      LEFT JOIN assets a ON s.image_id = a.id
      ${whereClause}
      ORDER BY s.order_index ASC, s.created_at DESC
    `;
    
    console.log('[getAllSliders] Query:', query);
    
    const sliders: any[] = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    }) as any[];
    
    console.log('[getAllSliders] Found sliders:', sliders.length);
    
    // Format response
    const formattedSliders = sliders.map((slider: any) => ({
      id: slider.id,
      title: slider.title,
      description: slider.description,
      button_text: slider.button_text,
      button_link: slider.button_link,
      image_id: slider.image_id,
      image_url: slider.image_url || slider.asset_cdn_url || slider.asset_url,
      asset: slider.asset_url ? {
        id: slider.image_id,
        url: slider.asset_url,
        cdn_url: slider.asset_cdn_url,
        sizes: slider.asset_sizes,
      } : null,
      order_index: slider.order_index,
      is_active: slider.is_active,
      created_at: slider.created_at,
      updated_at: slider.updated_at,
    }));
    
    res.json({ data: formattedSliders });
  } catch (error: any) {
    console.error('[getAllSliders] Error:', error.message);
    console.error('[getAllSliders] Error stack:', error.stack);
    console.error('[getAllSliders] Full error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sliders',
      message: error.message 
    });
  }
};

export const getSliderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        s.*,
        a.url as asset_url,
        a.cdn_url as asset_cdn_url,
        a.sizes as asset_sizes
      FROM sliders s
      LEFT JOIN assets a ON s.image_id = a.id
      WHERE s.id = $1
    `;
    
    const results: any[] = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      bind: [id],
    }) as any[];
    
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Slider not found' });
    }
    
    const slider = results[0];
    const formattedSlider = {
      id: slider.id,
      title: slider.title,
      description: slider.description,
      button_text: slider.button_text,
      button_link: slider.button_link,
      image_id: slider.image_id,
      image_url: slider.image_url || slider.asset_cdn_url || slider.asset_url,
      asset: slider.asset_url ? {
        id: slider.image_id,
        url: slider.asset_url,
        cdn_url: slider.asset_cdn_url,
        sizes: slider.asset_sizes,
      } : null,
      order_index: slider.order_index,
      is_active: slider.is_active,
      created_at: slider.created_at,
      updated_at: slider.updated_at,
    };
    
    res.json(formattedSlider);
  } catch (error: any) {
    console.error('[getSliderById] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch slider',
      message: error.message 
    });
  }
};

export const createSlider = async (req: Request, res: Response) => {
  try {
    console.log('[createSlider] Request body:', JSON.stringify(req.body, null, 2));
    const { title, description, button_text, button_link, image_id, image_url, order_index, is_active } = req.body;
    
    if (!title || title.trim() === '') {
      console.error('[createSlider] Validation failed: missing title');
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const id = uuidv4();
    const order = order_index !== undefined ? order_index : 0;
    const active = is_active !== undefined ? is_active : true;
    
    const query = `
      INSERT INTO sliders (
        id, title, description, button_text, button_link, 
        image_id, image_url, order_index, is_active, created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
      RETURNING *
    `;
    
    const result: any = await sequelize.query(query, {
      type: QueryTypes.INSERT,
      bind: [
        id,
        title.trim(),
        description && description.trim() ? description.trim() : null,
        button_text && button_text.trim() ? button_text.trim() : null,
        button_link && button_link.trim() ? button_link.trim() : null,
        image_id || null,
        image_url || null,
        order,
        active,
      ],
    });
    
    console.log('[createSlider] Slider created successfully:', id);
    
    // Log activity
    await logActivity(req, 'create', 'slider', id, title, `Created slider "${title}"`);
    
    res.status(201).json({ id, message: 'Slider created successfully' });
  } catch (error: any) {
    console.error('[createSlider] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to create slider', 
      message: error.message 
    });
  }
};

export const updateSlider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, button_text, button_link, image_id, image_url, order_index, is_active } = req.body;
    
    // Build update query dynamically
    const updates: string[] = [];
    const bindValues: any[] = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      bindValues.push(title && title.trim() ? title.trim() : null);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      bindValues.push(description && description.trim() ? description.trim() : null);
    }
    if (button_text !== undefined) {
      updates.push(`button_text = $${paramIndex++}`);
      bindValues.push(button_text && button_text.trim() ? button_text.trim() : null);
    }
    if (button_link !== undefined) {
      updates.push(`button_link = $${paramIndex++}`);
      bindValues.push(button_link && button_link.trim() ? button_link.trim() : null);
    }
    if (image_id !== undefined) {
      updates.push(`image_id = $${paramIndex++}`);
      bindValues.push(image_id || null);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramIndex++}`);
      bindValues.push(image_url || null);
    }
    if (order_index !== undefined) {
      updates.push(`order_index = $${paramIndex++}`);
      bindValues.push(order_index);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      bindValues.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push('updated_at = NOW()');
    bindValues.push(id); // Add id at the end for WHERE clause
    
    const query = `
      UPDATE sliders
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    console.log('[updateSlider] Query:', query);
    console.log('[updateSlider] Bind values:', bindValues);
    
    const result: any = await sequelize.query(query, {
      type: QueryTypes.UPDATE,
      bind: bindValues,
    });
    
    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Slider not found' });
    }
    
    // Get slider title for logging
    const getSliderQuery = 'SELECT title FROM sliders WHERE id = $1';
    const sliderResult: any = await sequelize.query(getSliderQuery, {
      type: QueryTypes.SELECT,
      bind: [id],
    });
    const sliderTitle = sliderResult[0]?.title || title || 'Unknown';
    
    // Log activity
    await logActivity(req, 'update', 'slider', id, sliderTitle, `Updated slider "${sliderTitle}"`);
    
    res.json({ message: 'Slider updated successfully' });
  } catch (error: any) {
    console.error('[updateSlider] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to update slider',
      message: error.message 
    });
  }
};

export const deleteSlider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get slider title before deleting
    const getSliderQuery = 'SELECT title FROM sliders WHERE id = $1';
    const sliderResult: any = await sequelize.query(getSliderQuery, {
      type: QueryTypes.SELECT,
      bind: [id],
    });
    const sliderTitle = sliderResult[0]?.title || 'Unknown';
    
    const query = 'DELETE FROM sliders WHERE id = $1';
    
    const result: any = await sequelize.query(query, {
      type: QueryTypes.DELETE,
      bind: [id],
    });
    
    // Log activity
    await logActivity(req, 'delete', 'slider', id, sliderTitle, `Deleted slider "${sliderTitle}"`);
    
    res.json({ message: 'Slider deleted successfully' });
  } catch (error: any) {
    console.error('[deleteSlider] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to delete slider',
      message: error.message 
    });
  }
};

export const reorderSliders = async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // Array of { id, order_index }
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    
    // Update each slider's order in a transaction
    await sequelize.transaction(async (transaction) => {
      for (const item of items) {
        await sequelize.query(
          'UPDATE sliders SET order_index = $1, updated_at = NOW() WHERE id = $2',
          {
            type: QueryTypes.UPDATE,
            bind: [item.order_index, item.id],
            transaction,
          }
        );
      }
    });
    
    res.json({ message: 'Sliders reordered successfully' });
  } catch (error: any) {
    console.error('[reorderSliders] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to reorder sliders',
      message: error.message 
    });
  }
};
