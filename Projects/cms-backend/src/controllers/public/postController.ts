import { Request, Response } from 'express';
import { Op } from 'sequelize';

import Post from '../../models/Post';
import Topic from '../../models/Topic';
import Tag from '../../models/Tag';
import Asset from '../../models/Asset';

const DEFAULT_PAGE_SIZE = 10;

interface SEOData {
  title?: string;
  description?: string;
  og_image?: string;
  keywords?: string[];
}

const formatPost = (post: any) => {
  const plain = post.toJSON();
  plain.topics = Array.isArray(plain.topics)
    ? plain.topics.map((t: any) => ({ id: t.id, name: t.name }))
    : [];
  plain.tags = Array.isArray(plain.tags)
    ? plain.tags.map((t: any) => ({ id: t.id, name: t.name }))
    : [];
  plain.readTime = plain.read_time;
  
  // Parse SEO data if it's a string
  let seoData: SEOData | null = null;
  if (plain.seo) {
    try {
      seoData = typeof plain.seo === 'string' ? JSON.parse(plain.seo) : plain.seo;
    } catch (e) {
      console.error('[formatPost] Failed to parse SEO data:', e);
      seoData = null;
    }
  }
  plain.seo = seoData;
  
  // Add computed meta fields for easier frontend usage
  // Priority: seo.title > post.title
  plain.metaTitle = seoData?.title || plain.title || '';
  plain.metaDescription = seoData?.description || plain.excerpt || '';
  plain.metaOgImage = seoData?.og_image || (plain.cover_asset?.cdn_url || plain.cover_asset?.url || '');
  plain.metaKeywords = seoData?.keywords || [];
  
  return plain;
};

export const listPublishedPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE, q, topic, tag, featured_only } = req.query;
    const offset = ((Number(page) || 1) - 1) * (Number(pageSize) || DEFAULT_PAGE_SIZE);

    const where: any = { status: 'published' };
    if (featured_only === 'true') {
      where.is_featured = true;
    }
    if (q && typeof q === 'string' && q.trim().length > 0) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { excerpt: { [Op.iLike]: `%${q}%` } },
        { content: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const topicFilter = topic && typeof topic === 'string' ? topic.split(',') : undefined;
    const tagFilter = tag && typeof tag === 'string' ? tag.split(',') : undefined;

    const { count, rows } = await Post.findAndCountAll({
      where,
      offset,
      limit: Number(pageSize) || DEFAULT_PAGE_SIZE,
      order: [
        ['is_featured', 'DESC'],
        ['published_at', 'DESC'],
      ],
      include: [
        {
          model: Asset,
          as: 'cover_asset',
          required: false,
          attributes: ['id', 'url', 'cdn_url', 'format', 'width', 'height', 'sizes'],
        },
        {
          model: Topic,
          as: 'topics',
          attributes: ['id', 'name'],
          through: { attributes: [] },
          ...(topicFilter ? { where: { id: topicFilter } } : {}),
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] },
          ...(tagFilter ? { where: { id: tagFilter } } : {}),
        },
      ],
      distinct: true,
    });

    res.json({
      success: true,
      data: rows.map(formatPost),
      total: count,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || DEFAULT_PAGE_SIZE,
    });
  } catch (error) {
    console.error('[public] listPublishedPosts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
};

export const getPublishedPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({
      where: { slug, status: 'published' },
      include: [
        {
          model: Asset,
          as: 'cover_asset',
          required: false,
          attributes: ['id', 'url', 'cdn_url', 'format', 'width', 'height', 'sizes'],
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
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, data: formatPost(post) });
  } catch (error) {
    console.error('[public] getPublishedPostBySlug error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch post' });
  }
};


