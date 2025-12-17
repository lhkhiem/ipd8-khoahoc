import { Request, Response } from 'express';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import { logActivity } from './activityLogController';

// Get all topics
export const getTopics = async (req: Request, res: Response) => {
  try {
    const { is_active } = req.query;
    
    let query = 'SELECT * FROM topics';
    const replacements: any = {};
    
    if (is_active !== undefined) {
      query += ' WHERE is_active = :is_active';
      replacements.is_active = is_active === 'true';
    }
    
    query += ' ORDER BY sort_order ASC, name ASC';
    
    const topics = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });
    
    res.json(topics);
  } catch (error) {
    console.error('Failed to fetch topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};

// Get topic by ID
export const getTopicById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM topics WHERE id = :id';
    const topics: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    
    if (topics.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    res.json(topics[0]);
  } catch (error) {
    console.error('Failed to fetch topic:', error);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
};

// Create topic
export const createTopic = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, color, icon, is_active, sort_order } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }
    
    const query = `
      INSERT INTO topics (name, slug, description, color, icon, is_active, sort_order)
      VALUES (:name, :slug, :description, :color, :icon, :is_active, :sort_order)
      RETURNING *
    `;
    
    const result: any = await sequelize.query(query, {
      replacements: {
        name,
        slug,
        description: description || null,
        color: color || null,
        icon: icon || null,
        is_active: is_active !== undefined ? is_active : true,
        sort_order: sort_order || 0
      },
      type: QueryTypes.INSERT
    });
    
    const topic = result[0][0];
    
    // Log activity
    await logActivity(req, 'create', 'topic', topic.id, name, `Created topic "${name}"`);
    
    res.status(201).json(topic);
  } catch (error: any) {
    console.error('Failed to create topic:', error);
    if (error.original?.constraint === 'topics_slug_key') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create topic' });
  }
};

// Update topic
export const updateTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, color, icon, is_active, sort_order } = req.body;
    
    const updateFields: string[] = [];
    const replacements: any = { id };
    
    if (name !== undefined) { updateFields.push('name = :name'); replacements.name = name; }
    if (slug !== undefined) { updateFields.push('slug = :slug'); replacements.slug = slug; }
    if (description !== undefined) { updateFields.push('description = :description'); replacements.description = description; }
    if (color !== undefined) { updateFields.push('color = :color'); replacements.color = color; }
    if (icon !== undefined) { updateFields.push('icon = :icon'); replacements.icon = icon; }
    if (is_active !== undefined) { updateFields.push('is_active = :is_active'); replacements.is_active = is_active; }
    if (sort_order !== undefined) { updateFields.push('sort_order = :sort_order'); replacements.sort_order = sort_order; }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const query = `
      UPDATE topics
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;
    
    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });
    
    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    const updatedTopic = result[0][0];
    
    // Log activity
    await logActivity(req, 'update', 'topic', id, updatedTopic.name, `Updated topic "${updatedTopic.name}"`);
    
    res.json(updatedTopic);
  } catch (error: any) {
    console.error('Failed to update topic:', error);
    if (error.original?.constraint === 'topics_slug_key') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update topic' });
  }
};

// Delete topic
export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get topic name before deleting
    const getTopicQuery = 'SELECT name FROM topics WHERE id = :id';
    const topicResult: any = await sequelize.query(getTopicQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    
    const topicName = topicResult[0]?.name || 'Unknown';
    
    const query = 'DELETE FROM topics WHERE id = :id RETURNING *';
    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    
    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    // Log activity
    await logActivity(req, 'delete', 'topic', id, topicName, `Deleted topic "${topicName}"`);
    
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Failed to delete topic:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
};

// Bulk update topics order
export const updateTopicsOrder = async (req: Request, res: Response) => {
  try {
    const { topics } = req.body; // Array of { id, sort_order }
    
    if (!Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ error: 'topics array is required' });
    }
    
    await sequelize.transaction(async (transaction) => {
      for (const topic of topics) {
        await sequelize.query(
          'UPDATE topics SET sort_order = :sort_order WHERE id = :id',
          {
            replacements: {
              id: topic.id,
              sort_order: topic.sort_order
            },
            type: QueryTypes.UPDATE,
            transaction
          }
        );
      }
    });
    
    res.json({ message: 'Topics order updated successfully' });
  } catch (error) {
    console.error('Failed to update topics order:', error);
    res.status(500).json({ error: 'Failed to update topics order' });
  }
};
