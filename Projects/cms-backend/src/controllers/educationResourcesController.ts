import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../config/database';
import { generateSlug, generateUniqueSlug } from '../utils/slug';

// Normalize URL to remove domain, keep only relative path
const normalizeImageUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== 'string') return null;
  
  // If already a relative path, return as is
  if (url.startsWith('/')) return url;
  
  // Remove protocol and domain
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    // If URL parsing fails, try to extract path manually
    const match = url.match(/https?:\/\/[^\/]+(\/.*)/);
    return match ? match[1] : url;
  }
};

// Helper function to get full education resource with topics and tags
const getFullEducationResource = async (resourceId: string) => {
  try {
    // Validate UUID format
    if (!resourceId || typeof resourceId !== 'string') {
      throw new Error('Invalid resource ID');
    }

    const resourceQuery = `
      SELECT * FROM education_resources WHERE id = :id::uuid
    `;
    const resources: any = await sequelize.query(resourceQuery, {
      replacements: { id: resourceId },
      type: QueryTypes.SELECT,
    });

    console.log('[getFullEducationResource] Query result:', resources?.length || 0, 'rows');

    if (!resources || !Array.isArray(resources) || resources.length === 0) {
      console.log('[getFullEducationResource] No resource found for ID:', resourceId);
      return null;
    }

    const resource = resources[0];
    if (!resource) {
      console.log('[getFullEducationResource] Resource is null/undefined');
      return null;
    }

    console.log('[getFullEducationResource] Found resource:', resource.id, resource.title);

    // Get topics - wrap in try-catch in case junction table doesn't exist
    let topics: any[] = [];
    try {
      const topicsQuery = `
        SELECT t.id, t.name, t.slug
        FROM topics t
        INNER JOIN education_resource_topics ert ON t.id = ert.topic_id
        WHERE ert.education_resource_id = :id::uuid
        ORDER BY t.name ASC
      `;
      const topicsResult: any = await sequelize.query(topicsQuery, {
        replacements: { id: resourceId },
        type: QueryTypes.SELECT,
      });
      topics = Array.isArray(topicsResult) ? topicsResult : [];
      console.log('[getFullEducationResource] Found', topics.length, 'topics');
    } catch (error: any) {
      console.error('[getFullEducationResource] Error fetching topics:', error.message);
      console.error('[getFullEducationResource] Error details:', error);
      // If table doesn't exist, return empty array
      if (error.message?.includes('does not exist') || 
          error.message?.includes('relation') ||
          error.message?.includes('column') ||
          error.code === '42P01') {
        console.warn('[getFullEducationResource] Junction table education_resource_topics may not exist yet');
        topics = [];
      } else {
        // Log but don't throw - return empty array to allow resource to load
        console.error('[getFullEducationResource] Non-critical error fetching topics, continuing...');
        topics = [];
      }
    }

    // Get tags - wrap in try-catch in case junction table doesn't exist
    let tags: any[] = [];
    try {
      const tagsQuery = `
        SELECT t.id, t.name, t.slug
        FROM tags t
        INNER JOIN education_resource_tags ert ON t.id = ert.tag_id
        WHERE ert.education_resource_id = :id::uuid
        ORDER BY t.name ASC
      `;
      const tagsResult: any = await sequelize.query(tagsQuery, {
        replacements: { id: resourceId },
        type: QueryTypes.SELECT,
      });
      tags = Array.isArray(tagsResult) ? tagsResult : [];
      console.log('[getFullEducationResource] Found', tags.length, 'tags');
    } catch (error: any) {
      console.error('[getFullEducationResource] Error fetching tags:', error.message);
      console.error('[getFullEducationResource] Error details:', error);
      // If table doesn't exist, return empty array
      if (error.message?.includes('does not exist') || 
          error.message?.includes('relation') ||
          error.message?.includes('column') ||
          error.code === '42P01') {
        console.warn('[getFullEducationResource] Junction table education_resource_tags may not exist yet');
        tags = [];
      } else {
        // Log but don't throw - return empty array to allow resource to load
        console.error('[getFullEducationResource] Non-critical error fetching tags, continuing...');
        tags = [];
      }
    }

    const result = {
      ...resource,
      topics: topics || [],
      tags: tags || [],
    };

    console.log('[getFullEducationResource] Returning resource with', result.topics.length, 'topics and', result.tags.length, 'tags');
    return result;
  } catch (error: any) {
    console.error('[getFullEducationResource] Unexpected error:', error);
    console.error('[getFullEducationResource] Error message:', error?.message);
    console.error('[getFullEducationResource] Error code:', error?.code);
    console.error('[getFullEducationResource] Error stack:', error?.stack);
    throw error;
  }
};

export const getEducationResources = async (req: Request, res: Response) => {
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
      SELECT * FROM education_resources 
      ${whereClause}
      ORDER BY sort_order ASC, created_at ASC
    `;

    const resources: any = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.json({ success: true, data: resources });
  } catch (error) {
    console.error('Failed to fetch education resources:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch education resources' });
  }
};

export const getEducationResourceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('[getEducationResourceById] Requested ID:', id);

    if (!id) {
      return res.status(400).json({ success: false, error: 'Resource ID is required' });
    }

    const fullResource = await getFullEducationResource(id);
    console.log('[getEducationResourceById] Found resource:', fullResource ? 'Yes' : 'No');

    if (!fullResource) {
      console.log('[getEducationResourceById] Resource not found for ID:', id);
      return res.status(404).json({ success: false, error: 'Education resource not found' });
    }

    console.log('[getEducationResourceById] Returning resource with', fullResource.topics?.length || 0, 'topics and', fullResource.tags?.length || 0, 'tags');
    res.json({ success: true, data: fullResource });
  } catch (error: any) {
    console.error('[getEducationResourceById] Error:', error);
    console.error('[getEducationResourceById] Error message:', error?.message);
    console.error('[getEducationResourceById] Error code:', error?.code);
    console.error('[getEducationResourceById] Error stack:', error?.stack);
    
    // Ensure we always return a proper error message
    const errorMessage = error?.message || error?.toString() || 'Failed to fetch education resource';
    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        code: error?.code,
        stack: error?.stack
      } : undefined
    });
  }
};

export const getEducationResourceBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const query = `
      SELECT * FROM education_resources 
      WHERE slug = :slug AND is_active = TRUE
    `;

    const resources: any = await sequelize.query(query, {
      replacements: { slug },
      type: QueryTypes.SELECT,
    });

    if (!resources || resources.length === 0) {
      return res.status(404).json({ success: false, error: 'Education resource not found' });
    }

    res.json({ success: true, data: resources[0] });
  } catch (error) {
    console.error('Failed to fetch education resource by slug:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch education resource' });
  }
};

export const createEducationResource = async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug,
      description,
      image_url,
      link_url,
      link_text,
      duration,
      ceus,
      level,
      resource_type,
      is_featured,
      sort_order,
      is_active,
      topics,
      tags,
    } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({ success: false, error: 'Title and image_url are required' });
    }

    // Generate slug if not provided
    let finalSlug = slug || generateSlug(title);
    
    // Ensure slug is unique
    const checkSlugUnique = async (s: string): Promise<boolean> => {
      const existing = await sequelize.query(
        'SELECT id FROM education_resources WHERE slug = :slug',
        { replacements: { slug: s }, type: QueryTypes.SELECT }
      );
      return !existing || existing.length === 0;
    };
    
    finalSlug = await generateUniqueSlug(finalSlug, checkSlugUnique);

    // Auto-generate link_url from slug if not provided
    const finalLinkUrl = link_url || `/education/${finalSlug}`;

    const id = uuidv4();
    const query = `
      INSERT INTO education_resources (
        id, title, slug, description, image_url, link_url, link_text,
        duration, ceus, level, resource_type, is_featured, sort_order, is_active,
        created_at, updated_at
      )
      VALUES (
        :id::uuid, :title, :slug, :description, :image_url, :link_url, :link_text,
        :duration, :ceus, :level, :resource_type, :is_featured, :sort_order, :is_active,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        title,
        slug: finalSlug,
        description: description || null,
        image_url: normalizeImageUrl(image_url) || image_url,
        link_url: finalLinkUrl,
        link_text: link_text || 'Learn More',
        duration: duration || null,
        ceus: ceus || null,
        level: level || null,
        resource_type: resource_type || 'course',
        is_featured: is_featured !== undefined ? is_featured : false,
        sort_order: sort_order !== undefined ? sort_order : 0,
        is_active: is_active !== undefined ? is_active : true,
      },
      type: QueryTypes.INSERT,
    });

    console.log('[createEducationResource] Insert result:', result);
    const createdResource = result[0] && result[0][0] ? result[0][0] : result[0];
    
    if (!createdResource) {
      throw new Error('Failed to create resource - no data returned');
    }

    // Add topics
    console.log('[createEducationResource] Topics received:', topics);
    if (topics && Array.isArray(topics) && topics.length > 0) {
      console.log('[createEducationResource] Adding topics:', topics);
      for (const topicId of topics) {
        console.log('[createEducationResource] Inserting topic:', topicId, 'for resource:', id);
        await sequelize.query(
          'INSERT INTO education_resource_topics (education_resource_id, topic_id) VALUES (:resource_id::uuid, :topic_id::uuid) ON CONFLICT DO NOTHING',
          {
            replacements: { resource_id: id, topic_id: topicId },
            type: QueryTypes.INSERT,
          }
        );
      }
    } else {
      console.log('[createEducationResource] No topics to add or topics is not an array');
    }

    // Add tags
    console.log('[createEducationResource] Tags received:', tags);
    if (tags && Array.isArray(tags) && tags.length > 0) {
      console.log('[createEducationResource] Adding tags:', tags);
      for (const tagId of tags) {
        console.log('[createEducationResource] Inserting tag:', tagId, 'for resource:', id);
        await sequelize.query(
          'INSERT INTO education_resource_tags (education_resource_id, tag_id) VALUES (:resource_id::uuid, :tag_id::uuid) ON CONFLICT DO NOTHING',
          {
            replacements: { resource_id: id, tag_id: tagId },
            type: QueryTypes.INSERT,
          }
        );
      }
    } else {
      console.log('[createEducationResource] No tags to add or tags is not an array');
    }

    // Fetch topics and tags for response
    const topicsQuery = `
      SELECT t.id, t.name, t.slug
      FROM topics t
      INNER JOIN education_resource_topics ert ON t.id = ert.topic_id
      WHERE ert.education_resource_id = :id::uuid
      ORDER BY t.name ASC
    `;
    const resourceTopics: any = await sequelize.query(topicsQuery, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    const tagsQuery = `
      SELECT t.id, t.name, t.slug
      FROM tags t
      INNER JOIN education_resource_tags ert ON t.id = ert.tag_id
      WHERE ert.education_resource_id = :id::uuid
      ORDER BY t.name ASC
    `;
    const resourceTags: any = await sequelize.query(tagsQuery, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    createdResource.topics = resourceTopics || [];
    createdResource.tags = resourceTags || [];

    res.status(201).json({ success: true, data: createdResource });
  } catch (error: any) {
    console.error('[createEducationResource] Failed to create education resource:', error);
    console.error('[createEducationResource] Error message:', error?.message);
    console.error('[createEducationResource] Error code:', error?.code);
    console.error('[createEducationResource] Error detail:', error?.detail);
    console.error('[createEducationResource] Error stack:', error?.stack);
    res.status(500).json({ 
      success: false, 
      error: error?.message || 'Failed to create education resource',
      details: process.env.NODE_ENV === 'development' ? {
        code: error?.code,
        detail: error?.detail,
        stack: error?.stack
      } : undefined
    });
  }
};

export const updateEducationResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      image_url,
      link_url,
      link_text,
      duration,
      ceus,
      level,
      resource_type,
      is_featured,
      sort_order,
      is_active,
      topics,
      tags,
    } = req.body;

    // Normalize image_url if provided
    const normalizedImageUrl = image_url ? normalizeImageUrl(image_url) : undefined;

    // Handle slug update - generate if title changed but slug not provided
    let finalSlug = slug;
    if (title && !slug) {
      // If title changed but slug not provided, generate new slug
      const baseSlug = generateSlug(title);
      const checkSlugUnique = async (s: string): Promise<boolean> => {
        const existing = await sequelize.query(
          'SELECT id FROM education_resources WHERE slug = :slug AND id != :id',
          { replacements: { slug: s, id }, type: QueryTypes.SELECT }
        );
        return !existing || existing.length === 0;
      };
      finalSlug = await generateUniqueSlug(baseSlug, checkSlugUnique);
    }

    // Auto-update link_url from slug if link_url not provided
    let finalLinkUrl: string | undefined = link_url;
    if (link_url === undefined || link_url === null || link_url === '') {
      // If link_url is not provided, generate from slug
      if (finalSlug) {
        finalLinkUrl = `/education/${finalSlug}`;
      } else {
        // Get current slug from DB if slug is not being updated
        const currentResource: any = await sequelize.query(
          'SELECT slug FROM education_resources WHERE id = :id::uuid',
          { replacements: { id }, type: QueryTypes.SELECT }
        );
        if (currentResource && currentResource.length > 0 && currentResource[0].slug) {
          finalLinkUrl = `/education/${currentResource[0].slug}`;
        }
      }
    }

    const updates: string[] = [
      'title = COALESCE(:title, title)',
    ];

    const replacements: any = {
      id,
      title: title || null,
    };

    // Add slug update if provided
    if (finalSlug) {
      updates.push('slug = :slug');
      replacements.slug = finalSlug;
    }

    // Add image_url update if provided
    if (normalizedImageUrl !== undefined) {
      updates.push('image_url = :image_url');
      replacements.image_url = normalizedImageUrl;
    }

    // Add link_url update if provided or auto-generated
    if (finalLinkUrl !== undefined) {
      updates.push('link_url = :link_url');
      replacements.link_url = finalLinkUrl;
    }

    // Add remaining fields
    updates.push(
      'description = :description',
      'link_text = COALESCE(:link_text, link_text)',
      'duration = :duration',
      'ceus = :ceus',
      'level = :level',
      'resource_type = COALESCE(:resource_type, resource_type)',
      'is_featured = :is_featured',
      'sort_order = COALESCE(:sort_order, sort_order)',
      'is_active = :is_active',
      'updated_at = CURRENT_TIMESTAMP'
    );

    replacements.description = description || null;
    replacements.link_text = link_text || null;
    replacements.duration = duration || null;
    replacements.ceus = ceus || null;
    replacements.level = level || null;
    replacements.resource_type = resource_type || null;
    replacements.is_featured = is_featured !== undefined ? is_featured : null;
    replacements.sort_order = sort_order !== undefined ? sort_order : null;
    replacements.is_active = is_active !== undefined ? is_active : null;

    const query = `
      UPDATE education_resources
      SET ${updates.join(', ')}
      WHERE id = :id::uuid
      RETURNING *
    `;

    console.log('[updateEducationResource] Executing UPDATE query with replacements:', Object.keys(replacements));
    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE,
    });

    console.log('[updateEducationResource] Update result:', result);
    
    // Sequelize UPDATE with RETURNING returns [affectedRows, [rows]]
    const updatedResource = result[0] && result[0].length > 0 ? result[0][0] : null;
    
    if (!updatedResource) {
      // Check if resource exists
      const checkQuery = 'SELECT id FROM education_resources WHERE id = :id::uuid';
      const checkResult: any = await sequelize.query(checkQuery, {
        replacements: { id },
        type: QueryTypes.SELECT,
      });
      
      if (!checkResult || checkResult.length === 0) {
        return res.status(404).json({ success: false, error: 'Education resource not found' });
      }
      
      // Resource exists but update didn't return data, fetch it
      const fullResource = await getFullEducationResource(id);
      if (!fullResource) {
        return res.status(404).json({ success: false, error: 'Education resource not found' });
      }
      // Continue with fullResource instead
    }

    // Update topics if provided
    if (topics !== undefined) {
      console.log('[updateEducationResource] Updating topics:', topics);
      // Delete existing topics
      await sequelize.query(
        'DELETE FROM education_resource_topics WHERE education_resource_id = :resource_id::uuid',
        {
          replacements: { resource_id: id },
          type: QueryTypes.DELETE,
        }
      );

      // Add new topics
      if (Array.isArray(topics) && topics.length > 0) {
        for (const topicId of topics) {
          console.log('[updateEducationResource] Adding topic:', topicId);
          await sequelize.query(
            'INSERT INTO education_resource_topics (education_resource_id, topic_id) VALUES (:resource_id::uuid, :topic_id::uuid) ON CONFLICT DO NOTHING',
            {
              replacements: { resource_id: id, topic_id: topicId },
              type: QueryTypes.INSERT,
            }
          );
        }
      }
    } else {
      console.log('[updateEducationResource] Topics not provided, skipping update');
    }

    // Update tags if provided
    if (tags !== undefined) {
      console.log('[updateEducationResource] Updating tags:', tags);
      // Delete existing tags
      await sequelize.query(
        'DELETE FROM education_resource_tags WHERE education_resource_id = :resource_id::uuid',
        {
          replacements: { resource_id: id },
          type: QueryTypes.DELETE,
        }
      );

      // Add new tags
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tagId of tags) {
          console.log('[updateEducationResource] Adding tag:', tagId);
          await sequelize.query(
            'INSERT INTO education_resource_tags (education_resource_id, tag_id) VALUES (:resource_id::uuid, :tag_id::uuid) ON CONFLICT DO NOTHING',
            {
              replacements: { resource_id: id, tag_id: tagId },
              type: QueryTypes.INSERT,
            }
          );
        }
      }
    } else {
      console.log('[updateEducationResource] Tags not provided, skipping update');
    }

    // Fetch updated resource with topics and tags
    const fullResource = await getFullEducationResource(id);
    if (!fullResource) {
      return res.status(404).json({ success: false, error: 'Education resource not found after update' });
    }
    res.json({ success: true, data: fullResource });
  } catch (error: any) {
    console.error('[updateEducationResource] Failed to update education resource:', error);
    console.error('[updateEducationResource] Error message:', error?.message);
    console.error('[updateEducationResource] Error code:', error?.code);
    console.error('[updateEducationResource] Error detail:', error?.detail);
    console.error('[updateEducationResource] Error stack:', error?.stack);
    res.status(500).json({ 
      success: false, 
      error: error?.message || 'Failed to update education resource',
      details: process.env.NODE_ENV === 'development' ? {
        code: error?.code,
        detail: error?.detail,
        stack: error?.stack
      } : undefined
    });
  }
};

export const deleteEducationResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM education_resources WHERE id = :id::uuid RETURNING *';

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.DELETE,
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ success: false, error: 'Education resource not found' });
    }

    res.json({ success: true, message: 'Education resource deleted successfully' });
  } catch (error) {
    console.error('Failed to delete education resource:', error);
    res.status(500).json({ success: false, error: 'Failed to delete education resource' });
  }
};


