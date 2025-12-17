import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

// Get all testimonials
export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const { featured_only, active_only } = req.query;

    const conditions: string[] = [];
    if (featured_only === 'true') {
      conditions.push('is_featured = TRUE');
    }
    if (active_only === 'true') {
      conditions.push('is_active = TRUE');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT * FROM testimonials 
      ${whereClause}
      ORDER BY sort_order ASC, created_at ASC
    `;

    const testimonials: any = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch testimonials' });
  }
};

// Create testimonial
export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      customer_title,
      customer_initials,
      testimonial_text,
      rating,
      is_featured,
      sort_order,
      is_active,
    } = req.body;

    if (!customer_name || !testimonial_text) {
      return res.status(400).json({ success: false, error: 'Customer name and testimonial text are required' });
    }

    const id = uuidv4();
    const query = `
      INSERT INTO testimonials (
        id, customer_name, customer_title, customer_initials, 
        testimonial_text, rating, is_featured, sort_order, is_active
      )
      VALUES (
        :id, :customer_name, :customer_title, :customer_initials,
        :testimonial_text, :rating, :is_featured, :sort_order, :is_active
      )
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        customer_name,
        customer_title: customer_title || null,
        customer_initials: customer_initials || null,
        testimonial_text,
        rating: rating || 5,
        is_featured: is_featured || false,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
      },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({ success: true, data: result[0][0] });
  } catch (error) {
    console.error('Failed to create testimonial:', error);
    res.status(500).json({ success: false, error: 'Failed to create testimonial' });
  }
};

// Update testimonial
export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      customer_name,
      customer_title,
      customer_initials,
      testimonial_text,
      rating,
      is_featured,
      sort_order,
      is_active,
    } = req.body;

    const query = `
      UPDATE testimonials
      SET 
        customer_name = COALESCE(:customer_name, customer_name),
        customer_title = :customer_title,
        customer_initials = :customer_initials,
        testimonial_text = COALESCE(:testimonial_text, testimonial_text),
        rating = COALESCE(:rating, rating),
        is_featured = :is_featured,
        sort_order = COALESCE(:sort_order, sort_order),
        is_active = :is_active,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        customer_name,
        customer_title: customer_title || null,
        customer_initials: customer_initials || null,
        testimonial_text,
        rating,
        is_featured,
        sort_order,
        is_active,
      },
      type: QueryTypes.UPDATE,
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ success: false, error: 'Testimonial not found' });
    }

    res.json({ success: true, data: result[0][0] });
  } catch (error) {
    console.error('Failed to update testimonial:', error);
    res.status(500).json({ success: false, error: 'Failed to update testimonial' });
  }
};

// Delete testimonial
export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM testimonials WHERE id = :id RETURNING *';

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.DELETE,
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ success: false, error: 'Testimonial not found' });
    }

    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Failed to delete testimonial:', error);
    res.status(500).json({ success: false, error: 'Failed to delete testimonial' });
  }
};


