import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';

export const getProductAttributes = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      pageSize = 50,
      product_id: productId,
      q,
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSizeNumber = Math.min(
      Math.max(parseInt(pageSize as string, 10) || 50, 1),
      200,
    );
    const offset = (pageNumber - 1) * pageSizeNumber;

    const whereConditions: string[] = [];
    const replacements: Record<string, any> = {
      limit: pageSizeNumber,
      offset,
    };

    if (productId) {
      whereConditions.push('pa.product_id = :product_id');
      replacements.product_id = productId;
    }

    if (q) {
      whereConditions.push('(pa.name ILIKE :search OR pa.value ILIKE :search)');
      replacements.search = `%${q}%`;
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM product_attributes pa
      ${whereClause}
    `;
    const countResult: Array<{ total: number }> = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });
    const total = countResult?.[0]?.total ?? 0;

    const dataQuery = `
      SELECT 
        pa.*,
        p.name AS product_name,
        p.slug AS product_slug
      FROM product_attributes pa
      LEFT JOIN products p ON pa.product_id = p.id
      ${whereClause}
      ORDER BY pa.created_at DESC, pa.name ASC
      LIMIT :limit OFFSET :offset
    `;

    const data = await sequelize.query(dataQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.json({
      data,
      total,
      page: pageNumber,
      pageSize: pageSizeNumber,
      totalPages: Math.ceil(total / pageSizeNumber),
    });
  } catch (error) {
    console.error('Failed to fetch product attributes:', error);
    res.status(500).json({ error: 'Failed to fetch product attributes' });
  }
};

export const getProductAttributeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        pa.*,
        p.name AS product_name,
        p.slug AS product_slug
      FROM product_attributes pa
      LEFT JOIN products p ON pa.product_id = p.id
      WHERE pa.id = :id
    `;

    const result = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Product attribute not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Failed to fetch product attribute:', error);
    res.status(500).json({ error: 'Failed to fetch product attribute' });
  }
};

export const createProductAttribute = async (req: Request, res: Response) => {
  try {
    const { product_id: productId, name, value } = req.body;

    if (!productId || !name) {
      return res
        .status(400)
        .json({ error: 'product_id and name are required fields' });
    }

    // Ensure product exists
    const productCheckQuery = `
      SELECT id, name, slug
      FROM products
      WHERE id = :product_id
      LIMIT 1
    `;
    const productResult = await sequelize.query(productCheckQuery, {
      replacements: { product_id: productId },
      type: QueryTypes.SELECT,
    });

    if (!productResult || productResult.length === 0) {
      return res.status(400).json({ error: 'Invalid product_id' });
    }

    const id = uuidv4();

    const insertQuery = `
      INSERT INTO product_attributes (id, product_id, name, value)
      VALUES (:id, :product_id, :name, :value)
      RETURNING *
    `;

    const insertResult: any = await sequelize.query(insertQuery, {
      replacements: {
        id,
        product_id: productId,
        name,
        value: value ?? null,
      },
      type: QueryTypes.INSERT,
    });

    const attribute = insertResult?.[0]?.[0];

    const responsePayload = {
      ...attribute,
      product_name: (productResult[0] as any).name,
      product_slug: (productResult[0] as any).slug,
    };

    res.status(201).json(responsePayload);
  } catch (error: any) {
    console.error('Failed to create product attribute:', error);
    res
      .status(500)
      .json({ error: 'Failed to create product attribute', message: error.message });
  }
};

export const updateProductAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { product_id: productId, name, value } = req.body;

    const updateFields: string[] = [];
    const replacements: Record<string, any> = { id };

    if (productId !== undefined) {
      // Validate product if provided
      const productCheckQuery = `
        SELECT id
        FROM products
        WHERE id = :product_id
        LIMIT 1
      `;
      const productResult = await sequelize.query(productCheckQuery, {
        replacements: { product_id: productId },
        type: QueryTypes.SELECT,
      });

      if (!productResult || productResult.length === 0) {
        return res.status(400).json({ error: 'Invalid product_id' });
      }

      updateFields.push('product_id = :product_id');
      replacements.product_id = productId;
    }

    if (name !== undefined) {
      updateFields.push('name = :name');
      replacements.name = name;
    }

    if (value !== undefined) {
      updateFields.push('value = :value');
      replacements.value = value ?? null;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updateQuery = `
      UPDATE product_attributes
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const updateResult: any = await sequelize.query(updateQuery, {
      replacements,
      type: QueryTypes.UPDATE,
    });

    if (!updateResult?.[0] || updateResult[0].length === 0) {
      return res.status(404).json({ error: 'Product attribute not found' });
    }

    const updatedAttribute = updateResult[0][0];

    const joinQuery = `
      SELECT 
        pa.*,
        p.name AS product_name,
        p.slug AS product_slug
      FROM product_attributes pa
      LEFT JOIN products p ON pa.product_id = p.id
      WHERE pa.id = :id
    `;

    const result = await sequelize.query(joinQuery, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    res.json(result[0] || updatedAttribute);
  } catch (error: any) {
    console.error('Failed to update product attribute:', error);
    res
      .status(500)
      .json({ error: 'Failed to update product attribute', message: error.message });
  }
};

export const deleteProductAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleteQuery = `
      DELETE FROM product_attributes
      WHERE id = :id
      RETURNING *
    `;

    const deleteResult: any = await sequelize.query(deleteQuery, {
      replacements: { id },
      type: QueryTypes.DELETE,
    });

    if (!deleteResult?.[0] || deleteResult[0].length === 0) {
      return res.status(404).json({ error: 'Product attribute not found' });
    }

    res.json({ message: 'Product attribute deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product attribute:', error);
    res.status(500).json({ error: 'Failed to delete product attribute' });
  }
};




