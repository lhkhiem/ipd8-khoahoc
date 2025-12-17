// Controller xử lý các route liên quan đến Post
// - CRUD operations cho bài viết
// - Hỗ trợ phân trang, filter theo status
// - Search theo title/excerpt
// - Quản lý topics và tags của bài viết

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import Post from '../models/Post';
import Topic from '../models/Topic';
import Tag from '../models/Tag';
import Asset from '../models/Asset';
import sequelize from '../config/database';
import { generateSlug, generateUniqueSlug } from '../utils/slug';
import { logActivity } from './activityLogController';

// Lấy danh sách bài viết có phân trang
// Query params:
// - page: trang hiện tại
// - pageSize: số bài mỗi trang
// - status: trạng thái (published/draft)
// - featured_only: chỉ lấy featured posts
// - q: từ khóa tìm kiếm
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, status, featured_only, q } = req.query;
    const offset = ((page as any) - 1) * (pageSize as any);

    const where: any = {};
    // Only filter by status if it's explicitly provided and not empty
    if (status && status !== '') {
      where.status = status;
    }
    // Filter by featured
    if (featured_only === 'true') {
      where.is_featured = true;
    }
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { excerpt: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      offset,
      limit: pageSize as any,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Asset,
          as: 'cover_asset',
          required: false,
          attributes: ['id', 'url', 'cdn_url', 'format', 'width', 'height', 'sizes']
        },
        {
          model: Topic,
          as: 'topics',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
      distinct: true,
    });

    const formatted = rows.map((post: any) => {
      const plain = post.toJSON();
      plain.topics = Array.isArray(plain.topics)
        ? plain.topics.map((t: any) => ({ id: t.id, name: t.name }))
        : [];
      plain.tags = Array.isArray(plain.tags)
        ? plain.tags.map((t: any) => ({ id: t.id, name: t.name }))
        : [];
      plain.readTime = plain.read_time;
      return plain;
    });

    res.json({
      data: formatted,
      total: count,
      page,
      pageSize,
    });
  } catch (error: any) {
    console.error('[getPosts] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch posts', message: error.message });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id, {
      include: [
        {
          model: Asset,
          as: 'cover_asset',
          required: false,
          attributes: ['id', 'url', 'cdn_url', 'format', 'width', 'height', 'sizes']
        },
        {
          model: Topic,
          as: 'topics',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const plain = post.toJSON();
    plain.topics = Array.isArray(plain.topics)
      ? plain.topics.map((t: any) => ({ id: t.id, name: t.name }))
      : [];
    plain.tags = Array.isArray(plain.tags)
      ? plain.tags.map((t: any) => ({ id: t.id, name: t.name }))
      : [];
    plain.readTime = plain.read_time;

    res.json(plain);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({
      where: { slug },
      include: [
        {
          model: Asset,
          as: 'cover_asset',
          required: false,
          attributes: ['id', 'url', 'cdn_url', 'format', 'width', 'height', 'sizes']
        },
        {
          model: Topic,
          as: 'topics',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const plain = post.toJSON();
    plain.topics = Array.isArray(plain.topics)
      ? plain.topics.map((t: any) => ({ id: t.id, name: t.name }))
      : [];
    plain.tags = Array.isArray(plain.tags)
      ? plain.tags.map((t: any) => ({ id: t.id, name: t.name }))
      : [];
    plain.readTime = plain.read_time;

    res.json(plain);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    console.log('[createPost] Request body:', JSON.stringify(req.body, null, 2));
    const {
      title,
      slug,
      excerpt,
      content,
      cover_asset_id,
      status,
      author_id,
      seo,
      header_code,
      topics,
      tags,
      published_at,
      read_time,
      readTime,
      is_featured,
    } = req.body;

    if (!title) {
      console.error('[createPost] Missing title');
      return res.status(400).json({ error: 'Title is required', code: 'VALIDATION_ERROR' });
    }
    
    console.log('[createPost] cover_asset_id:', cover_asset_id);

    // Slug generation and uniqueness
    const desired = slug ? generateSlug(slug) : generateSlug(title);
    const unique = await generateUniqueSlug(desired, async (s) => {
      const exist = await Post.findOne({ where: { slug: s }, attributes: ['id'] });
      return !exist; // Return true if unique (doesn't exist)
    });

    // Normalize optional fields - ensure proper UUID or null
    const safeAuthorId = author_id || null;
    // Handle both HTML string and JSON content (backward compatibility)
    const safeContent = content !== undefined ? content : '';
    const safeCoverAsset = cover_asset_id || null;
    // SEO can be object or null - Sequelize will handle JSONB conversion
    const safeSeo = seo !== undefined && seo !== null ? seo : null;
    console.log('[createPost] SEO data received:', safeSeo, 'Type:', typeof safeSeo);
    const safeHeaderCode = header_code || null;
    const safeReadTimeValue =
      typeof read_time === 'string'
        ? read_time.trim() || null
        : typeof readTime === 'string'
        ? readTime.trim() || null
        : null;
    
    // Set published_at to now if publishing without explicit date
    const finalPublishedAt = status === 'published' 
      ? (published_at ? new Date(published_at) : new Date()) 
      : null;

    console.log('[createPost] Creating post:', { title, slug: unique, status, author_id: safeAuthorId, cover_asset_id: safeCoverAsset });

    const post = await Post.create({
      id: uuidv4(),
      title,
      slug: unique,
      excerpt: excerpt || '',
      content: safeContent,
      cover_asset_id: safeCoverAsset,
      status: status || 'draft',
      author_id: safeAuthorId,
      published_at: finalPublishedAt,
      seo: safeSeo,
      header_code: safeHeaderCode,
      read_time: safeReadTimeValue,
      is_featured: is_featured !== undefined ? Boolean(is_featured) : true, // Default to true
    });
    
    console.log('[createPost] Post saved with cover_asset_id:', (post as any).cover_asset_id);

    // Add topics
    if (topics && topics.length > 0) {
      const topicIds = await Topic.findAll({
        where: { id: topics },
        attributes: ['id'],
      });
      await (post as any).addTopics(topicIds);
    }

    // Add tags
    if (tags && tags.length > 0) {
      const tagIds = await Tag.findAll({
        where: { id: tags },
        attributes: ['id'],
      });
      await (post as any).addTags(tagIds);
    }

    console.log('[createPost] Post created successfully:', post.id);
    
    // Log activity
    await logActivity(req, 'create', 'post', (post as any).id, title, `Created post "${title}"`);
    
    res.status(201).json(post);
  } catch (error: any) {
    console.error('[createPost] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to create post', 
      message: error.message,
      code: 'SERVER_ERROR' 
    });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('[updatePost] Request body:', JSON.stringify(req.body, null, 2));
    const {
      title,
      slug,
      excerpt,
      content,
      cover_asset_id,
      status,
      author_id,
      seo,
      header_code,
      topics,
      tags,
      published_at,
      read_time,
      readTime,
      is_featured,
    } = req.body;

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    console.log('[updatePost] cover_asset_id from request:', cover_asset_id);

    // Slug uniqueness if changed
    let nextSlug = (post as any).slug as string;
    if (slug || title) {
      const base = slug ? generateSlug(slug) : generateSlug(title || nextSlug);
      if (base !== nextSlug) {
        nextSlug = await generateUniqueSlug(base, async (s) => {
          const exist = await Post.findOne({ where: { slug: s }, attributes: ['id'] });
          // Return true if unique (doesn't exist or is the same post)
          return !exist || (exist as any).id === (post as any).id;
        });
      }
    }

    // Normalize optional fields - ensure proper UUID or null
    const safeAuthorId = author_id !== undefined ? (author_id || null) : (post as any).author_id;
    const safeCover = cover_asset_id !== undefined ? (cover_asset_id || null) : (post as any).cover_asset_id;
    // SEO can be object or null - Sequelize will handle JSONB conversion
    const safeSeo = seo !== undefined ? (seo !== null ? seo : null) : (post as any).seo;
    console.log('[updatePost] SEO data received:', safeSeo, 'Type:', typeof safeSeo);
    const safeReadTimeValue =
      read_time !== undefined
        ? typeof read_time === 'string'
          ? read_time.trim() || null
          : null
        : readTime !== undefined
        ? typeof readTime === 'string'
          ? readTime.trim() || null
          : null
        : (post as any).read_time;
    
    const finalPublishedAt = status === 'published' 
      ? (published_at ? new Date(published_at) : ((post as any).published_at || new Date())) 
      : (published_at ? new Date(published_at) : null);

    console.log('[updatePost] Updating post:', id, { status, author_id: safeAuthorId, cover_asset_id: safeCover });

    // Handle both HTML string and JSON content (backward compatibility)
    const updatedContent = content !== undefined ? content : (post as any).content;
    
    await post.update({
      title: title || (post as any).title,
      slug: nextSlug,
      excerpt: excerpt !== undefined ? excerpt : (post as any).excerpt,
      content: updatedContent,
      cover_asset_id: safeCover,
      status: status || (post as any).status,
      author_id: safeAuthorId,
      published_at: finalPublishedAt,
      seo: safeSeo,
      header_code: header_code !== undefined ? header_code : (post as any).header_code,
      read_time: safeReadTimeValue,
      is_featured: is_featured !== undefined ? Boolean(is_featured) : ((post as any).is_featured !== undefined ? (post as any).is_featured : true),
      updated_at: new Date(),
    });

    // Update topics
    if (topics) {
      const topicIds = await Topic.findAll({
        where: { id: topics },
        attributes: ['id'],
      });
      await (post as any).setTopics(topicIds);
    }

    // Update tags
    if (tags) {
      const tagIds = await Tag.findAll({
        where: { id: tags },
        attributes: ['id'],
      });
      await (post as any).setTags(tagIds);
    }

    console.log('[updatePost] Post updated successfully');
    
    // Log activity
    const postTitle = title || (post as any).title;
    await logActivity(req, 'update', 'post', id, postTitle, `Updated post "${postTitle}"`);
    
    res.json(post);
  } catch (error: any) {
    console.error('[updatePost] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to update post',
      message: error.message 
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postTitle = (post as any).title;
    
    await post.destroy();
    
    // Log activity
    await logActivity(req, 'delete', 'post', id, postTitle, `Deleted post "${postTitle}"`);
    
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

export const publishPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await post.update({
      status: 'published',
      published_at: new Date(),
      updated_at: new Date(),
    });

    // Log activity
    const postTitle = (post as any).title;
    await logActivity(req, 'publish', 'post', id, postTitle, `Published post "${postTitle}"`);

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish post' });
  }
};

