// Brand controller
// Handles CRUD operations for brands

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import { logActivity } from './activityLogController';

export const getBrands = async (req: Request, res: Response) => {
  try {
    const { featured_only, q } = req.query;

    const conditions: string[] = [];
    const replacements: Record<string, unknown> = {};

    if (featured_only === 'true') {
      conditions.push('b.is_featured = TRUE');
    }

    if (q && typeof q === 'string' && q.trim().length > 0) {
      conditions.push('(b.name ILIKE :search OR b.slug ILIKE :search)');
      replacements.search = `%${q.trim()}%`;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        b.*,
        COALESCE(a.cdn_url, a.url) as logo_url,
        a.format as logo_format,
        a.width as logo_width,
        a.height as logo_height,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'published') as product_count,
        (
          SELECT c.name 
          FROM products p2
          LEFT JOIN product_product_categories ppc ON ppc.product_id = p2.id
          LEFT JOIN product_categories c ON c.id = ppc.category_id
          WHERE p2.brand_id = b.id AND p2.status = 'published' AND c.id IS NOT NULL
          GROUP BY c.name
          ORDER BY COUNT(DISTINCT p2.id) DESC
          LIMIT 1
        ) as primary_category
      FROM brands b
      LEFT JOIN assets a ON b.logo_id = a.id
      LEFT JOIN products p ON p.brand_id = b.id
      ${whereClause}
      GROUP BY 
        b.id,
        b.name,
        b.slug,
        b.description,
        b.logo_id,
        b.website,
        b.is_featured,
        b.created_at,
        b.updated_at,
        a.cdn_url,
        a.url,
        a.format,
        a.width,
        a.height
      ORDER BY b.name ASC
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
};

export const getBrandById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        b.*,
        COALESCE(a.cdn_url, a.url) as logo_url,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'published') as product_count,
        (
          SELECT c.name 
          FROM products p2
          LEFT JOIN product_product_categories ppc ON ppc.product_id = p2.id
          LEFT JOIN product_categories c ON c.id = ppc.category_id
          WHERE p2.brand_id = b.id AND p2.status = 'published' AND c.id IS NOT NULL
          GROUP BY c.name
          ORDER BY COUNT(DISTINCT p2.id) DESC
          LIMIT 1
        ) as primary_category
      FROM brands b
      LEFT JOIN assets a ON b.logo_id = a.id
      LEFT JOIN products p ON p.brand_id = b.id
      WHERE b.id = :id
      GROUP BY 
        b.id,
        b.name,
        b.slug,
        b.description,
        b.logo_id,
        b.website,
        b.is_featured,
        b.created_at,
        b.updated_at,
        a.cdn_url,
        a.url
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Failed to fetch brand:', error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
};

export const getBrandBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const query = `
      SELECT 
        b.*,
        COALESCE(a.cdn_url, a.url) as logo_url,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'published') as product_count,
        (
          SELECT c.name 
          FROM products p2
          LEFT JOIN product_product_categories ppc ON ppc.product_id = p2.id
          LEFT JOIN product_categories c ON c.id = ppc.category_id
          WHERE p2.brand_id = b.id AND p2.status = 'published' AND c.id IS NOT NULL
          GROUP BY c.name
          ORDER BY COUNT(DISTINCT p2.id) DESC
          LIMIT 1
        ) as primary_category
      FROM brands b
      LEFT JOIN assets a ON b.logo_id = a.id
      LEFT JOIN products p ON p.brand_id = b.id
      WHERE b.slug = :slug
      GROUP BY 
        b.id,
        b.name,
        b.slug,
        b.description,
        b.logo_id,
        b.website,
        b.is_featured,
        b.created_at,
        b.updated_at,
        a.cdn_url,
        a.url
    `;

    const result: any = await sequelize.query(query, {
      replacements: { slug },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Failed to fetch brand by slug:', error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, logo_id, website, is_featured } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const id = uuidv4();
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const query = `
      INSERT INTO brands (id, name, slug, description, logo_id, website, is_featured)
      VALUES (:id, :name, :slug, :description, :logo_id, :website, :is_featured)
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        name,
        slug: generatedSlug,
        description: description || null,
        logo_id: logo_id || null,
        website: website || null,
        is_featured: is_featured ?? false,
      },
      type: QueryTypes.INSERT
    });

    const brand = result[0][0];
    
    // Log activity
    await logActivity(req, 'create', 'brand', id, name, `Created brand "${name}"`);

    res.status(201).json(brand);
  } catch (error) {
    console.error('Failed to create brand:', error);
    res.status(500).json({ error: 'Failed to create brand' });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, logo_id, website, is_featured } = req.body;

    const query = `
      UPDATE brands
      SET 
        name = COALESCE(:name, name),
        slug = COALESCE(:slug, slug),
        description = COALESCE(:description, description),
        logo_id = COALESCE(:logo_id, logo_id),
        website = COALESCE(:website, website),
        is_featured = COALESCE(:is_featured, is_featured),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: { 
        id, 
        name: name ?? null, 
        slug: slug ?? null, 
        description: description !== undefined ? description : null, 
        logo_id: logo_id !== undefined ? logo_id : null, 
        website: website ?? null,
        is_featured: is_featured !== undefined ? is_featured : null,
      },
      type: QueryTypes.UPDATE
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const updatedBrand = result[0][0];
    
    // Log activity
    await logActivity(req, 'update', 'brand', id, updatedBrand.name, `Updated brand "${updatedBrand.name}"`);

    res.json(updatedBrand);
  } catch (error) {
    console.error('Failed to update brand:', error);
    res.status(500).json({ error: 'Failed to update brand' });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get brand name before deleting
    const getBrandQuery = 'SELECT name FROM brands WHERE id = :id';
    const brandResult: any = await sequelize.query(getBrandQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    
    const brandName = brandResult[0]?.name || 'Unknown';
    
    const result: any = await sequelize.query(
      'DELETE FROM brands WHERE id = :id RETURNING *',
      {
        replacements: { id },
        type: QueryTypes.DELETE
      }
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Log activity
    await logActivity(req, 'delete', 'brand', id, brandName, `Deleted brand "${brandName}"`);

    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Failed to delete brand:', error);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
};
