// Product Category controller
// Handles CRUD operations for product categories

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import { logActivity } from './activityLogController';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { featured_only } = req.query;

    let whereClause = '';
    if (featured_only === 'true') {
      whereClause = 'WHERE c.is_featured = TRUE';
    }

    const query = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.parent_id,
        c.is_featured,
        c.created_at,
        c.updated_at,
        pc.name as parent_name,
        COALESCE(a.cdn_url, a.url) as image_url,
        COUNT(DISTINCT ppc.product_id) AS product_count
      FROM product_categories c
      LEFT JOIN product_categories pc ON c.parent_id = pc.id
      LEFT JOIN assets a ON c.image_id = a.id
      LEFT JOIN product_product_categories ppc ON ppc.category_id = c.id
      LEFT JOIN products p ON p.id = ppc.product_id AND p.status = 'published'
      ${whereClause}
      GROUP BY
        c.id,
        c.name,
        c.slug,
        c.description,
        c.parent_id,
        c.is_featured,
        c.created_at,
        c.updated_at,
        pc.name,
        a.cdn_url,
        a.url
      ORDER BY c.name ASC
    `;

    const result: any = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({ data: result });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        c.*,
        pc.name as parent_name,
        a.url as image_url
      FROM product_categories c
      LEFT JOIN product_categories pc ON c.parent_id = pc.id
      LEFT JOIN assets a ON c.image_id = a.id
      WHERE c.id = :id
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Failed to fetch category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const query = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.parent_id,
        c.is_featured,
        c.created_at,
        c.updated_at,
        pc.name as parent_name,
        COALESCE(a.cdn_url, a.url) as image_url,
        COUNT(DISTINCT ppc.product_id) AS product_count
      FROM product_categories c
      LEFT JOIN product_categories pc ON c.parent_id = pc.id
      LEFT JOIN assets a ON c.image_id = a.id
      LEFT JOIN product_product_categories ppc ON ppc.category_id = c.id
      LEFT JOIN products p ON p.id = ppc.product_id AND p.status = 'published'
      WHERE c.slug = :slug
      GROUP BY
        c.id,
        c.name,
        c.slug,
        c.description,
        c.parent_id,
        c.is_featured,
        c.created_at,
        c.updated_at,
        pc.name,
        a.cdn_url,
        a.url
    `;

    const result: any = await sequelize.query(query, {
      replacements: { slug },
      type: QueryTypes.SELECT,
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Failed to fetch category by slug:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, parent_id, description, image_id, is_featured } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const id = uuidv4();
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const query = `
      INSERT INTO product_categories (id, name, slug, parent_id, description, image_id, is_featured)
      VALUES (:id, :name, :slug, :parent_id, :description, :image_id, :is_featured)
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        name,
        slug: generatedSlug,
        parent_id: parent_id || null,
        description: description || null,
        image_id: (image_id && image_id.trim() !== '') ? image_id : null,
        is_featured: is_featured || false
      },
      type: QueryTypes.INSERT
    });

    const category = result[0][0];
    
    // Log activity
    await logActivity(req, 'create', 'category', id, name, `Created category "${name}"`);

    res.status(201).json(category);
  } catch (error) {
    console.error('Failed to create category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, parent_id, description, image_id, is_featured } = req.body;

    // Build dynamic update query - only update fields that are provided
    const updates: string[] = [];
    const replacements: any = { id };

    if (name !== undefined) {
      updates.push('name = :name');
      replacements.name = name;
    }
    if (slug !== undefined) {
      updates.push('slug = :slug');
      replacements.slug = slug;
    }
    if (parent_id !== undefined) {
      updates.push('parent_id = :parent_id');
      replacements.parent_id = parent_id || null;
    }
    if (description !== undefined) {
      updates.push('description = :description');
      replacements.description = description;
    }
    // Only update image_id if it's explicitly provided in the request
    if (image_id !== undefined) {
      updates.push('image_id = :image_id');
      replacements.image_id = (image_id !== null && image_id !== '' && String(image_id).trim() !== '') ? String(image_id) : null;
    }
    if (is_featured !== undefined) {
      updates.push('is_featured = :is_featured');
      replacements.is_featured = is_featured;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const query = `
      UPDATE product_categories
      SET ${updates.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updatedCategory = result[0][0];
    
    // Log activity
    await logActivity(req, 'update', 'category', id, updatedCategory.name, `Updated category "${updatedCategory.name}"`);

    res.json(updatedCategory);
  } catch (error) {
    console.error('Failed to update category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const checkCategoryRelationships = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check for products via many-to-many relationship only
    // Only count valid relationships where product_id is not null and product exists
    const productsQuery = `
      SELECT COUNT(*) as count
      FROM product_product_categories ppc
      INNER JOIN products p ON ppc.product_id = p.id
      WHERE ppc.category_id = :id
        AND ppc.product_id IS NOT NULL
    `;
    const productsResult: any = await sequelize.query(productsQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    const totalProducts = parseInt(productsResult[0]?.count || '0', 10);

    // Check for subcategories (children)
    const subcategoriesQuery = `
      SELECT COUNT(*) as count
      FROM product_categories
      WHERE parent_id = :id
    `;
    const subcategoriesResult: any = await sequelize.query(subcategoriesQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    const subcategoriesCount = parseInt(subcategoriesResult[0]?.count || '0', 10);

    res.json({
      hasRelationships: totalProducts > 0 || subcategoriesCount > 0,
      productsCount: totalProducts,
      subcategoriesCount,
      warnings: [
        totalProducts > 0 ? `This category is used by ${totalProducts} product(s)` : null,
        subcategoriesCount > 0 ? `This category has ${subcategoriesCount} subcategory(ies)` : null
      ].filter(Boolean)
    });
  } catch (error) {
    console.error('Failed to check category relationships:', error);
    res.status(500).json({ error: 'Failed to check category relationships' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Always check relationships - no force delete allowed
    // Only count valid relationships via many-to-many where product exists
    const relationshipsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM product_product_categories ppc 
         INNER JOIN products p ON ppc.product_id = p.id 
         WHERE ppc.category_id = :id AND ppc.product_id IS NOT NULL) as products_count,
        (SELECT COUNT(*) FROM product_categories WHERE parent_id = :id) as subcategories_count
    `;
    const relationships: any = await sequelize.query(relationshipsQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    
    const relationshipsData = relationships[0];
    const totalProducts = parseInt(relationshipsData?.products_count || '0', 10);
    const subcategoriesCount = parseInt(relationshipsData?.subcategories_count || '0', 10);

    // Block delete if there are any relationships
    if (totalProducts > 0 || subcategoriesCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with active relationships',
        hasRelationships: true,
        productsCount: totalProducts,
        subcategoriesCount,
        warnings: [
          totalProducts > 0 ? `This category is used by ${totalProducts} product(s)` : null,
          subcategoriesCount > 0 ? `This category has ${subcategoriesCount} subcategory(ies)` : null
        ].filter(Boolean),
        instructions: {
          products: totalProducts > 0 ? 'Remove or reassign all products from this category first' : null,
          subcategories: subcategoriesCount > 0 ? 'Delete or reassign all subcategories first' : null
        }
      });
    }

    // Get category name before deleting
    const getCategoryQuery = 'SELECT name FROM product_categories WHERE id = :id';
    const categoryResult: any = await sequelize.query(getCategoryQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    
    const categoryName = categoryResult[0]?.name || 'Unknown';
    
    const result: any = await sequelize.query(
      'DELETE FROM product_categories WHERE id = :id RETURNING *',
      {
        replacements: { id },
        type: QueryTypes.DELETE
      }
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Log activity
    await logActivity(req, 'delete', 'category', id, categoryName, `Deleted category "${categoryName}"`);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Failed to delete category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
