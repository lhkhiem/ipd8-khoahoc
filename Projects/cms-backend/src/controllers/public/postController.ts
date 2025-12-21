import { Request, Response } from 'express';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../../config/database';

import Post from '../../models/Post';
import User from '../../models/User';

const DEFAULT_PAGE_SIZE = 10;

const formatPost = (post: any, tags: string[] = []) => {
  const plain = post.toJSON();
  
  // Tags từ bảng post_tags (tag_name, không phải tag_id)
  plain.tags = tags.map((tagName) => ({ name: tagName }));
  
  // SEO fields từ seo_title và seo_description (không phải JSONB)
  plain.metaTitle = plain.seo_title || plain.title || '';
  plain.metaDescription = plain.seo_description || plain.excerpt || '';
  plain.metaOgImage = plain.thumbnail_url || '';
  
  // Remove fields không còn dùng
  delete plain.read_time;
  delete plain.cover_asset;
  
  return plain;
};

export const listPublishedPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = req.query;
    const offset = ((Number(page) || 1) - 1) * (Number(pageSize) || DEFAULT_PAGE_SIZE);

    // Simple query - just get published posts
    const { count, rows } = await Post.findAndCountAll({
      where: { status: 'published' },
      offset,
      limit: Number(pageSize) || DEFAULT_PAGE_SIZE,
      order: [['created_at', 'DESC']],
    });

    // Fetch tags for each post (simplified - skip if no posts)
    let tagsByPostId: Record<string, string[]> = {};
    if (rows.length > 0) {
      try {
        const postIds = rows.map((p) => p.id);
        const placeholders = postIds.map((_, i) => `$${i + 1}`).join(',');
        const tagResults = await sequelize.query(
          `SELECT post_id, tag_name FROM post_tags WHERE post_id IN (${placeholders})`,
          {
            bind: postIds,
            type: QueryTypes.SELECT,
          }
        ) as any[];
        
        // Handle Sequelize query result format
        const tags = Array.isArray(tagResults) && tagResults.length > 0 && Array.isArray(tagResults[0])
          ? tagResults[0]
          : tagResults;
        
        tags.forEach((tr: any) => {
          if (tr && tr.post_id) {
            if (!tagsByPostId[tr.post_id]) {
              tagsByPostId[tr.post_id] = [];
            }
            tagsByPostId[tr.post_id].push(tr.tag_name);
          }
        });
      } catch (tagError: any) {
        console.warn('[public] Failed to fetch tags:', tagError?.message || tagError);
        // Continue without tags
      }
    }

    res.json({
      success: true,
      data: rows.map((post) => formatPost(post, tagsByPostId[post.id] || [])),
      total: count,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || DEFAULT_PAGE_SIZE,
    });
  } catch (error: any) {
    console.error('[public] listPublishedPosts error:', error);
    console.error('[public] listPublishedPosts error stack:', error.stack);
    res.status(500).json({ success: false, error: 'Failed to fetch posts', details: error.message });
  }
};

export const getPublishedPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({
      where: { slug, status: 'published' },
      include: [
        {
          model: User,
          as: 'author',
          required: false,
          attributes: ['id', 'name', 'avatar_url'],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Fetch tags for this post
    let tags: string[] = [];
    try {
      const tagResults = await sequelize.query(
        `SELECT tag_name FROM post_tags WHERE post_id = :postId`,
        {
          replacements: { postId: post.id },
          type: QueryTypes.SELECT,
        }
      ) as any[];
      
      // Sequelize returns array of arrays for SELECT queries
      tags = Array.isArray(tagResults) && tagResults.length > 0
        ? (Array.isArray(tagResults[0]) ? tagResults[0] : tagResults).map((tr: any) => tr.tag_name || tr)
        : [];
    } catch (tagError) {
      console.warn('[public] Failed to fetch tags:', tagError);
      // Continue without tags
    }

    res.json({ success: true, data: formatPost(post, tags) });
  } catch (error: any) {
    console.error('[public] getPublishedPostBySlug error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch post', details: error.message });
  }
};


