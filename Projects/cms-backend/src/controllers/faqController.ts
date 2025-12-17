import { Request, Response } from 'express';
import { FAQCategory, FAQQuestion } from '../models';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

// ============ FAQ Categories ============

// Get all FAQ categories
export const getFAQCategories = async (req: Request, res: Response) => {
  try {
    const { active_only } = req.query;

    const whereClause = active_only === 'true' ? 'WHERE is_active = TRUE' : '';

    const query = `
      SELECT * FROM faq_categories
      ${whereClause}
      ORDER BY sort_order ASC, created_at ASC
    `;

    const categories: any = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Failed to fetch FAQ categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch FAQ categories' });
  }
};

// Get FAQ category by ID
export const getFAQCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT * FROM faq_categories
      WHERE id = :id
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, error: 'FAQ category not found' });
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Failed to fetch FAQ category:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch FAQ category' });
  }
};

// Create FAQ category
export const createFAQCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, sort_order, is_active } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    if (!slug) {
      return res.status(400).json({ success: false, error: 'Slug is required' });
    }

    const id = uuidv4();
    const query = `
      INSERT INTO faq_categories (
        id, name, slug, sort_order, is_active
      )
      VALUES (
        :id, :name, :slug, :sort_order, :is_active
      )
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        name,
        slug,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
      },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({ success: true, data: result[0][0] });
  } catch (error: any) {
    console.error('Failed to create FAQ category:', error);
    if (error.original?.code === '23505') {
      return res.status(400).json({ success: false, error: 'Slug already exists' });
    }
    res.status(500).json({ success: false, error: 'Failed to create FAQ category' });
  }
};

// Update FAQ category
export const updateFAQCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, sort_order, is_active } = req.body;

    const query = `
      UPDATE faq_categories
      SET
        name = COALESCE(:name, name),
        slug = COALESCE(:slug, slug),
        sort_order = COALESCE(:sort_order, sort_order),
        is_active = :is_active,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        name,
        slug,
        sort_order,
        is_active,
      },
      type: QueryTypes.UPDATE,
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ success: false, error: 'FAQ category not found' });
    }

    res.json({ success: true, data: result[0][0] });
  } catch (error: any) {
    console.error('Failed to update FAQ category:', error);
    if (error.original?.code === '23505') {
      return res.status(400).json({ success: false, error: 'Slug already exists' });
    }
    res.status(500).json({ success: false, error: 'Failed to update FAQ category' });
  }
};

// Delete FAQ category
export const deleteFAQCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First check if category has questions
    const checkQuery = 'SELECT COUNT(*) as count FROM faq_questions WHERE category_id = :id';
    const checkResult: any = await sequelize.query(checkQuery, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (checkResult[0]?.count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with existing questions. Please delete or move questions first.',
      });
    }

    const query = 'DELETE FROM faq_categories WHERE id = :id RETURNING *';

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.DELETE,
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ success: false, error: 'FAQ category not found' });
    }

    res.json({ success: true, message: 'FAQ category deleted successfully' });
  } catch (error) {
    console.error('Failed to delete FAQ category:', error);
    res.status(500).json({ success: false, error: 'Failed to delete FAQ category' });
  }
};

// ============ FAQ Questions ============

// Get all FAQ questions (optionally filtered by category)
export const getFAQQuestions = async (req: Request, res: Response) => {
  try {
    const { category_id, active_only } = req.query;

    let whereClause = '';
    const replacements: any = {};

    if (category_id) {
      whereClause += 'WHERE category_id = :category_id';
      replacements.category_id = category_id;
    }

    if (active_only === 'true') {
      whereClause += whereClause ? ' AND is_active = TRUE' : 'WHERE is_active = TRUE';
    }

    const query = `
      SELECT * FROM faq_questions
      ${whereClause}
      ORDER BY sort_order ASC, created_at ASC
    `;

    const questions: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.json({ success: true, data: questions });
  } catch (error) {
    console.error('Failed to fetch FAQ questions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch FAQ questions' });
  }
};

// Get FAQ question by ID
export const getFAQQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT * FROM faq_questions
      WHERE id = :id
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, error: 'FAQ question not found' });
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Failed to fetch FAQ question:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch FAQ question' });
  }
};

// Create FAQ question
export const createFAQQuestion = async (req: Request, res: Response) => {
  try {
    const { category_id, question, answer, sort_order, is_active } = req.body;

    if (!category_id) {
      return res.status(400).json({ success: false, error: 'Category ID is required' });
    }

    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    if (!answer) {
      return res.status(400).json({ success: false, error: 'Answer is required' });
    }

    // Verify category exists
    const categoryCheck: any = await sequelize.query(
      'SELECT id FROM faq_categories WHERE id = :category_id',
      {
        replacements: { category_id },
        type: QueryTypes.SELECT,
      }
    );

    if (!categoryCheck || categoryCheck.length === 0) {
      return res.status(404).json({ success: false, error: 'FAQ category not found' });
    }

    const id = uuidv4();
    const query = `
      INSERT INTO faq_questions (
        id, category_id, question, answer, sort_order, is_active
      )
      VALUES (
        :id, :category_id, :question, :answer, :sort_order, :is_active
      )
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        category_id,
        question,
        answer,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
      },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({ success: true, data: result[0][0] });
  } catch (error) {
    console.error('Failed to create FAQ question:', error);
    res.status(500).json({ success: false, error: 'Failed to create FAQ question' });
  }
};

// Update FAQ question
export const updateFAQQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category_id, question, answer, sort_order, is_active } = req.body;

    // If category_id is being updated, verify it exists
    if (category_id) {
      const categoryCheck: any = await sequelize.query(
        'SELECT id FROM faq_categories WHERE id = :category_id',
        {
          replacements: { category_id },
          type: QueryTypes.SELECT,
        }
      );

      if (!categoryCheck || categoryCheck.length === 0) {
        return res.status(404).json({ success: false, error: 'FAQ category not found' });
      }
    }

    const query = `
      UPDATE faq_questions
      SET
        category_id = COALESCE(:category_id, category_id),
        question = COALESCE(:question, question),
        answer = COALESCE(:answer, answer),
        sort_order = COALESCE(:sort_order, sort_order),
        is_active = :is_active,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        category_id,
        question,
        answer,
        sort_order,
        is_active,
      },
      type: QueryTypes.UPDATE,
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ success: false, error: 'FAQ question not found' });
    }

    res.json({ success: true, data: result[0][0] });
  } catch (error) {
    console.error('Failed to update FAQ question:', error);
    res.status(500).json({ success: false, error: 'Failed to update FAQ question' });
  }
};

// Delete FAQ question
export const deleteFAQQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM faq_questions WHERE id = :id RETURNING *';

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.DELETE,
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ success: false, error: 'FAQ question not found' });
    }

    res.json({ success: true, message: 'FAQ question deleted successfully' });
  } catch (error) {
    console.error('Failed to delete FAQ question:', error);
    res.status(500).json({ success: false, error: 'Failed to delete FAQ question' });
  }
};

// Get FAQs with categories and questions (for public API)
export const getFAQsWithCategories = async (req: Request, res: Response) => {
  try {
    const { active_only } = req.query;

    const categoriesWhere = active_only === 'true' ? 'WHERE c.is_active = TRUE' : '';
    const questionsWhere = active_only === 'true' ? 'AND q.is_active = TRUE' : '';

    const query = `
      SELECT 
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.sort_order as category_sort_order,
        q.id as question_id,
        q.question,
        q.answer,
        q.sort_order as question_sort_order
      FROM faq_categories c
      LEFT JOIN faq_questions q ON c.id = q.category_id ${questionsWhere}
      ${categoriesWhere}
      ORDER BY c.sort_order ASC, c.created_at ASC, q.sort_order ASC, q.created_at ASC
    `;

    const results: any = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    // Group by category
    const categoriesMap = new Map();
    results.forEach((row: any) => {
      if (!categoriesMap.has(row.category_id)) {
        categoriesMap.set(row.category_id, {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          sort_order: row.category_sort_order,
          questions: [],
        });
      }

      if (row.question_id) {
        categoriesMap.get(row.category_id).questions.push({
          id: row.question_id,
          question: row.question,
          answer: row.answer,
          sort_order: row.question_sort_order,
        });
      }
    });

    const categories = Array.from(categoriesMap.values());

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Failed to fetch FAQs with categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch FAQs' });
  }
};




