import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { normalizeMediaUrl } from '../../utils/domainUtils';

type RawProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  content?: unknown;
  price: string | number;
  compare_price: string | number | null;
  stock: number | null;
  is_featured: boolean;
  is_best_seller: boolean;
  created_at: string;
  published_at: string | null;
  brand_id: string | null;
  brand_name: string | null;
  brand_slug: string | null;
  thumbnail_url: string | null;
  thumbnail_cdn_url: string | null;
  average_rating: string | number | null;
  review_count: string | number | null;
  categories_json?: string | null;
};

const parseCsvParam = (input: unknown): string[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input
      .flatMap((value) => String(value).split(','))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return String(input)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const clampNumber = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const parseJsonArray = (value: unknown): any[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

const buildPriceConditions = (
  ranges: string[],
  replacements: Record<string, unknown>
) => {
  const conditions: string[] = [];

  ranges.forEach((range, index) => {
    // Handle ranges ending with '+' (e.g., '1000000+', '5000000+')
    if (range.endsWith('+')) {
      const minRaw = range.slice(0, -1); // Remove the '+'
      const min = Number(minRaw);
      if (Number.isFinite(min)) {
        replacements[`priceMin${index}`] = min;
        conditions.push(`p.price >= :priceMin${index}`);
      }
      return;
    }

    // Handle ranges with '-' (e.g., '200000-500000')
    const [minRaw, maxRaw] = range.split('-').map((value) => value.trim());
    const min = Number(minRaw);
    const max = Number(maxRaw);

    if (Number.isFinite(min) && Number.isFinite(max)) {
      replacements[`priceMin${index}`] = min;
      replacements[`priceMax${index}`] = max;
      conditions.push(`(p.price >= :priceMin${index} AND p.price < :priceMax${index})`);
    } else if (Number.isFinite(min) && !Number.isFinite(max)) {
      replacements[`priceMin${index}`] = min;
      conditions.push(`p.price >= :priceMin${index}`);
    } else if (!Number.isFinite(min) && Number.isFinite(max)) {
      replacements[`priceMax${index}`] = max;
      conditions.push(`p.price < :priceMax${index}`);
    }
  });

  return conditions;
};

const buildOrderClause = (sort: string) => {
  switch (sort) {
    case 'price-asc':
      return 'ORDER BY p.price ASC NULLS LAST';
    case 'price-desc':
      return 'ORDER BY p.price DESC NULLS LAST';
    case 'name-asc':
      return 'ORDER BY p.name ASC';
    case 'rating':
      return 'ORDER BY average_rating DESC NULLS LAST, review_count DESC NULLS LAST';
    case 'newest':
      return 'ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC';
    default:
      return 'ORDER BY p.is_featured DESC, p.created_at DESC';
  }
};

export const listProducts = async (req: Request, res: Response) => {
  try {
    const pageRaw = Number(req.query.page) || 1;
    const pageSizeRaw = Number(req.query.pageSize) || 20;
    const searchQuery =
      typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const categorySlugs = parseCsvParam(req.query.category);
    const brandSlugs = parseCsvParam(req.query.brand);
    const priceRanges = parseCsvParam(req.query.price);
    const availabilityFilters = parseCsvParam(req.query.availability);
    const specialFilters = parseCsvParam(req.query.special);
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'featured';

    const page = clampNumber(pageRaw, 1, 500);
    const pageSize = clampNumber(pageSizeRaw, 1, 100);
    const offset = (page - 1) * pageSize;

    const replacements: Record<string, unknown> = {
      limit: pageSize,
      offset,
    };

    const whereClauses: string[] = [`p.status = 'published'`];

    if (searchQuery) {
      whereClauses.push(
        `(p.name ILIKE :search OR p.description ILIKE :search OR p.sku ILIKE :search)`
      );
      replacements.search = `%${searchQuery}%`;
    }

    if (categorySlugs.length > 0) {
      whereClauses.push(`EXISTS (
        SELECT 1
        FROM product_product_categories ppc2
        JOIN product_categories c2 ON c2.id = ppc2.category_id
        WHERE ppc2.product_id = p.id
          AND c2.slug = ANY(string_to_array(:categorySlugs, ','))
      )`);
      replacements.categorySlugs = categorySlugs.join(',');
    }

    if (brandSlugs.length > 0) {
      whereClauses.push(`EXISTS (
        SELECT 1
        FROM brands b2
        WHERE b2.id = p.brand_id
          AND b2.slug = ANY(string_to_array(:brandSlugs, ','))
      )`);
      replacements.brandSlugs = brandSlugs.join(',');
    }

    if (priceRanges.length > 0) {
      const priceConditions = buildPriceConditions(priceRanges, replacements);
      if (priceConditions.length > 0) {
        whereClauses.push(`(${priceConditions.join(' OR ')})`);
      }
    }

    const includesInStock = availabilityFilters.includes('in-stock');
    const includesOutOfStock = availabilityFilters.includes('out-of-stock');
    if (includesInStock && !includesOutOfStock) {
      whereClauses.push('COALESCE(p.stock, 0) > 0');
    } else if (includesOutOfStock && !includesInStock) {
      whereClauses.push('COALESCE(p.stock, 0) <= 0');
    }

    const specialConditions: string[] = [];
    if (specialFilters.includes('on-sale')) {
      specialConditions.push('(p.compare_price IS NOT NULL AND p.compare_price > p.price)');
    }
    if (specialFilters.includes('best-seller')) {
      specialConditions.push('p.is_best_seller = TRUE');
    }
    if (specialFilters.includes('featured')) {
      specialConditions.push('p.is_featured = TRUE');
    }
    if (specialFilters.includes('new')) {
      specialConditions.push("p.published_at >= NOW() - INTERVAL '30 days'");
    }
    if (specialConditions.length > 0) {
      whereClauses.push(`(${specialConditions.join(' OR ')})`);
    }

    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const orderClause = buildOrderClause(sort);

    const listQuery = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.description,
        p.price,
        p.compare_price,
        p.stock,
        p.is_featured,
        p.is_best_seller,
        p.created_at,
        p.published_at,
        b.id as brand_id,
        b.name as brand_name,
        b.slug as brand_slug,
        thumb.url as thumbnail_url,
        thumb.cdn_url as thumbnail_cdn_url,
        (
          SELECT COALESCE(
            json_agg(
              jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'slug', c.slug
              )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::json
          )
          FROM product_product_categories ppc
          JOIN product_categories c ON c.id = ppc.category_id
          WHERE ppc.product_id = p.id
        ) AS categories_json,
        (
          SELECT COALESCE(AVG(pr.rating)::numeric, 0)::float
          FROM product_reviews pr
          WHERE pr.product_id = p.id AND pr.status = 'approved'
        ) AS average_rating,
        (
          SELECT COUNT(*)
          FROM product_reviews pr
          WHERE pr.product_id = p.id AND pr.status = 'approved'
        ) AS review_count
      FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id
      LEFT JOIN assets thumb ON thumb.id = p.thumbnail_id
      ${whereClause}
      ${orderClause}
      LIMIT :limit OFFSET :offset
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT p.id)::int AS total
      FROM products p
      ${whereClause}
    `;

    const [items, countRows] = await Promise.all([
      sequelize.query<RawProductRow>(listQuery, {
        replacements,
        type: QueryTypes.SELECT,
      }),
      sequelize.query<{ total: number }>(countQuery, {
        replacements,
        type: QueryTypes.SELECT,
      }),
    ]);

    const total = countRows?.[0]?.total ?? 0;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    const data = items.map((row) => {
      const categories = parseJsonArray(row.categories_json);
      const thumbnailUrl =
        normalizeMediaUrl(row.thumbnail_cdn_url) ||
        normalizeMediaUrl(row.thumbnail_url);
      const price = Number(row.price);
      const comparePrice =
        row.compare_price !== null && row.compare_price !== undefined
          ? Number(row.compare_price)
          : null;
      const stock = row.stock ?? 0;

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        sku: row.sku,
        description: row.description,
        price,
        comparePrice,
        stock,
        isFeatured: Boolean(row.is_featured),
        isBestSeller: Boolean(row.is_best_seller),
        createdAt: row.created_at,
        publishedAt: row.published_at,
        thumbnailUrl,
        brand: row.brand_id
          ? {
              id: row.brand_id,
              name: row.brand_name,
              slug: row.brand_slug,
            }
          : null,
        categories,
        rating:
          row.average_rating !== null && row.average_rating !== undefined
            ? Number(row.average_rating)
            : 0,
        reviewCount:
          row.review_count !== null && row.review_count !== undefined
            ? Number(row.review_count)
            : 0,
        variantCount: 0,
      };
    });

    res.json({
      success: true,
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('[public][listProducts] failed', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error?.message ?? 'unknown-error',
    });
  }
};

export const getProductDetail = async (req: Request, res: Response) => {
  try {
    const { slug: identifier } = req.params;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Product slug is required',
      });
    }

    const productQuery = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.description,
        p.content,
        p.price,
        p.compare_price,
        p.stock,
        p.is_featured,
        p.is_best_seller,
        p.created_at,
        p.published_at,
        b.id as brand_id,
        b.name as brand_name,
        b.slug as brand_slug,
        thumb.url as thumbnail_url,
        thumb.cdn_url as thumbnail_cdn_url,
        (
          SELECT COALESCE(
            json_agg(
              jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'slug', c.slug
              )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::json
          )
          FROM product_product_categories ppc
          JOIN product_categories c ON c.id = ppc.category_id
          WHERE ppc.product_id = p.id
        ) AS categories_json,
        (
          SELECT COALESCE(AVG(pr.rating)::numeric, 0)::float
          FROM product_reviews pr
          WHERE pr.product_id = p.id AND pr.status = 'approved'
        ) AS average_rating,
        (
          SELECT COUNT(*)
          FROM product_reviews pr
          WHERE pr.product_id = p.id AND pr.status = 'approved'
        ) AS review_count
      FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id
      LEFT JOIN assets thumb ON thumb.id = p.thumbnail_id
      WHERE p.status = 'published'
        AND (p.slug = :identifier OR p.sku = :identifier)
      LIMIT 1
    `;

    const productRows = await sequelize.query<RawProductRow>(productQuery, {
      replacements: { identifier },
      type: QueryTypes.SELECT,
    });

    if (!productRows.length) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const product = productRows[0];
    const productId = product.id;

    const parsedContent =
      typeof product.content === 'string'
        ? (() => {
            try {
              return JSON.parse(product.content);
            } catch (error) {
              return null;
            }
          })()
        : product.content ?? null;

    const imagesQuery = `
      SELECT
        pi.id,
        pi.sort_order,
        a.url,
        a.cdn_url,
        a.width,
        a.height,
        a.format
      FROM product_images pi
      JOIN assets a ON a.id = pi.asset_id
      WHERE pi.product_id = :productId
      ORDER BY pi.sort_order ASC, pi.created_at ASC
    `;

    const attributesQuery = `
      SELECT id, name, value
      FROM product_attributes
      WHERE product_id = :productId
      ORDER BY name ASC
    `;

    const relatedQuery = `
      SELECT DISTINCT
        rp.id,
        rp.name,
        rp.slug,
        rp.price,
        rp.compare_price,
        rp.stock,
        rp.is_featured,
        rp.is_best_seller,
        rp.created_at,
        thumb.url as thumbnail_url,
        thumb.cdn_url as thumbnail_cdn_url
      FROM products rp
      LEFT JOIN product_product_categories rppc ON rppc.product_id = rp.id
      LEFT JOIN assets thumb ON thumb.id = rp.thumbnail_id
      WHERE rp.id <> :productId
        AND rp.status = 'published'
        ${
          parseJsonArray(product.categories_json).length
            ? 'AND rppc.category_id = ANY(string_to_array(:categoryIds, \',\')::uuid[])'
            : ''
        }
      ORDER BY rp.is_featured DESC, rp.created_at DESC
      LIMIT 8
    `;

    const [imageRows, attributeRows, relatedRows] = await Promise.all([
      sequelize.query<{
        id: string;
        sort_order: number;
        url: string | null;
        cdn_url: string | null;
        width: number | null;
        height: number | null;
        format: string | null;
      }>(imagesQuery, {
        replacements: { productId },
        type: QueryTypes.SELECT,
      }),
      sequelize.query<{
        id: string;
        name: string;
        value: string;
      }>(attributesQuery, {
        replacements: { productId },
        type: QueryTypes.SELECT,
      }),
      sequelize.query<{
        id: string;
        name: string;
        slug: string;
        price: string | number;
        compare_price: string | number | null;
        stock: number | null;
        is_featured: boolean;
        is_best_seller: boolean;
        thumbnail_url: string | null;
        thumbnail_cdn_url: string | null;
      }>(relatedQuery, {
        replacements: {
          productId,
          categoryIds: parseJsonArray(product.categories_json)
            .map((item: any) => item?.id)
            .filter(Boolean)
            .join(','),
        },
        type: QueryTypes.SELECT,
      }),
    ]);

    const categories = parseJsonArray(product.categories_json);

    const detail = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      content: parsedContent,
      price: Number(product.price),
      comparePrice:
        product.compare_price !== null && product.compare_price !== undefined
          ? Number(product.compare_price)
          : null,
      stock: product.stock ?? 0,
      isFeatured: Boolean(product.is_featured),
      isBestSeller: Boolean(product.is_best_seller),
      createdAt: product.created_at,
      publishedAt: product.published_at,
      variantCount: 0,
      selectedVariantId: null,
      selectedVariantSlug: null,
      variants: [],
      options: [],
      thumbnailUrl:
        normalizeMediaUrl(product.thumbnail_cdn_url) ||
        normalizeMediaUrl(product.thumbnail_url),
      brand: product.brand_id
        ? {
            id: product.brand_id,
            name: product.brand_name,
            slug: product.brand_slug,
          }
        : null,
      categories,
      rating:
        product.average_rating !== null && product.average_rating !== undefined
          ? Number(product.average_rating)
          : 0,
      reviewCount:
        product.review_count !== null && product.review_count !== undefined
          ? Number(product.review_count)
          : 0,
      images: imageRows.map((image) => ({
        id: image.id,
        sortOrder: image.sort_order,
        url:
          normalizeMediaUrl(image.cdn_url) ||
          normalizeMediaUrl(image.url),
        width: image.width,
        height: image.height,
        format: image.format,
      })),
      attributes: attributeRows.map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        value: attribute.value,
      })),
      relatedProducts: relatedRows.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        price: Number(item.price),
        comparePrice:
          item.compare_price !== null && item.compare_price !== undefined
            ? Number(item.compare_price)
            : null,
        isFeatured: Boolean(item.is_featured),
        isBestSeller: Boolean(item.is_best_seller),
        thumbnailUrl:
          normalizeMediaUrl(item.thumbnail_cdn_url) ||
          normalizeMediaUrl(item.thumbnail_url),
        stock:
          typeof item.stock === 'number' && Number.isFinite(item.stock)
            ? Number(item.stock)
            : 0,
      })),
    };

    res.json({
      success: true,
      data: detail,
    });
  } catch (error: any) {
    console.error('[public][getProductDetail] failed', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product detail',
      error: error?.message ?? 'unknown-error',
    });
  }
};

