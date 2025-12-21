// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import '../utils/loadEnv';

import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

// SECURITY: Validate tất cả database config variables
if (!process.env.DB_HOST) {
  throw new Error('DB_HOST environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_PORT) {
  throw new Error('DB_PORT environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_USER) {
  throw new Error('DB_USER environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_NAME) {
  throw new Error('DB_NAME environment variable is required. Please set it in .env.local file.');
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seed() {
  try {
    console.log('Starting seeding...');

    // Create admin user
    // SECURITY: Require ADMIN_SEED_PASSWORD from environment
    const adminPassword = process.env.ADMIN_SEED_PASSWORD;
    if (!adminPassword) {
      throw new Error(
        'ADMIN_SEED_PASSWORD environment variable is required for seeding. ' +
        'Please set a strong password in your .env.local file. ' +
        'Example: ADMIN_SEED_PASSWORD=your_strong_password_here'
      );
    }
    if (adminPassword.length < 8) {
      throw new Error('ADMIN_SEED_PASSWORD must be at least 8 characters long');
    }
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await pool.query(`
      INSERT INTO users (email, password_hash, name, status)
      VALUES ('admin@pressup.com', $1, 'Admin User', 'active')
      ON CONFLICT (email) DO NOTHING
    `, [passwordHash]);

    // Create sample topics
    await pool.query(`
      INSERT INTO topics (name, slug, description)
      VALUES 
        ('Technology', 'technology', 'Latest tech news and updates'),
        ('Business', 'business', 'Business and entrepreneurship'),
        ('Lifestyle', 'lifestyle', 'Lifestyle and wellness')
      ON CONFLICT (slug) DO NOTHING
    `);

    // Create sample tags
    await pool.query(`
      INSERT INTO tags (name, slug)
      VALUES 
        ('Web Development', 'web-development'),
        ('AI', 'ai'),
        ('Marketing', 'marketing'),
        ('Health', 'health')
      ON CONFLICT (slug) DO NOTHING
    `);

    // Seed product categories for storefront testing
    const productCategories = [
      { name: 'Skincare', slug: 'skincare', description: 'Professional-grade serums, cleansers, and moisturizers.' },
      { name: 'Body Care', slug: 'body-care', description: 'Massage oils, exfoliants, and nourishing treatments.' },
      { name: 'Spa Equipment', slug: 'spa-equipment', description: 'High-performance devices and professional spa tools.' },
      { name: 'Aromatherapy', slug: 'aromatherapy', description: 'Diffusers and essential oils for calming treatments.' },
      { name: 'Treatments', slug: 'treatments', description: 'Targeted solutions for facials and specialty services.' },
    ];

    const categoryMap: Record<string, string> = {};
    for (const category of productCategories) {
      const result = await pool.query(
        `
          INSERT INTO product_categories (name, slug, description)
          VALUES ($1, $2, $3)
          ON CONFLICT (slug) DO UPDATE
          SET name = EXCLUDED.name,
              description = EXCLUDED.description,
              updated_at = NOW()
          RETURNING id
        `,
        [category.name, category.slug, category.description]
      );
      const categoryId = result.rows[0]?.id;
      if (categoryId) {
        categoryMap[category.slug] = categoryId;
      }
    }

    console.log('Seeded product categories.');

    // Seed brands commonly used by sample products
    const brandSeeds = [
      {
        name: 'Lumina Skin Labs',
        slug: 'lumina-skin',
        description: 'Advanced cosmeceutical skincare formulated for spa professionals.',
        website: 'https://example.com/lumina-skin',
        is_featured: true,
      },
      {
        name: 'PureBody Naturals',
        slug: 'purebody-naturals',
        description: 'Massage and body care essentials crafted with plant-powered ingredients.',
        website: 'https://example.com/purebody',
        is_featured: false,
      },
      {
        name: 'TheraTech Pro',
        slug: 'theratech-pro',
        description: 'Professional spa equipment engineered for high-touch service menus.',
        website: 'https://example.com/theratech',
        is_featured: true,
      },
      {
        name: 'AromaWave Studio',
        slug: 'aromawave',
        description: 'Atmosphere-enhancing aromatherapy blends and diffusion systems.',
        website: 'https://example.com/aromawave',
        is_featured: false,
      },
    ];

    const brandMap: Record<string, string> = {};
    for (const brand of brandSeeds) {
      const result = await pool.query(
        `
          INSERT INTO brands (name, slug, description, website, is_featured)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (slug) DO UPDATE
          SET name = EXCLUDED.name,
              description = EXCLUDED.description,
              website = EXCLUDED.website,
              is_featured = EXCLUDED.is_featured,
              updated_at = NOW()
          RETURNING id
        `,
        [brand.name, brand.slug, brand.description, brand.website, brand.is_featured]
      );
      const brandId = result.rows[0]?.id;
      if (brandId) {
        brandMap[brand.slug] = brandId;
      }
    }

    console.log('Seeded brands for sample products.');

    // Prepare media assets used by the demo products (hosted remotely)
    const assetSeeds = [
      {
        key: 'vitamin-c-serum',
        url: 'https://images.unsplash.com/photo-1612810806695-30ba221d254b?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1612810806695-30ba221d254b?auto=format&fit=crop&w=300&q=70',
        width: 900,
        height: 1200,
        format: 'jpg',
      },
      {
        key: 'massage-oil',
        url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=300&q=70',
        width: 900,
        height: 1200,
        format: 'jpg',
      },
      {
        key: 'facial-steamer',
        url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4f83e?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4f83e?auto=format&fit=crop&w=300&q=70',
        width: 900,
        height: 1200,
        format: 'jpg',
      },
      {
        key: 'aroma-diffuser',
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=70',
        width: 900,
        height: 1200,
        format: 'jpg',
      },
    ];

    const assetMap: Record<string, string> = {};
    for (const asset of assetSeeds) {
      const existing = await pool.query(
        `SELECT id FROM assets WHERE url = $1 LIMIT 1`,
        [asset.url]
      );

      let assetId = existing.rows[0]?.id;
      if (!assetId) {
        const sizes = asset.thumbUrl
          ? {
              thumb: { url: asset.thumbUrl },
              medium: { url: asset.url },
            }
          : null;

        const inserted = await pool.query(
          `
            INSERT INTO assets (type, provider, url, cdn_url, width, height, format, sizes)
            VALUES ('image', 'remote', $1, $2, $3, $4, $5, $6)
            RETURNING id
          `,
          [
            asset.url,
            asset.url,
            asset.width || null,
            asset.height || null,
            asset.format || null,
            sizes ? JSON.stringify(sizes) : null,
          ]
        );
        assetId = inserted.rows[0]?.id;
      }

      if (assetId) {
        assetMap[asset.key] = assetId;
      }
    }

    console.log('Prepared media assets for sample products.');

    const productSeeds = [
      {
        name: 'Radiant Vitamin C Serum',
        slug: 'radiant-vitamin-c-serum',
        description: 'Brightening serum that boosts luminosity and targets dark spots.',
        content: {
          summary: 'A professional-grade serum with stabilized vitamin C for visible glow and antioxidant protection.',
          usage: 'Apply 2-3 drops to cleansed skin before moisturizer. Use SPF during the day.',
          highlights: [
            '20% stabilized vitamin C complex',
            'Hyaluronic acid base to hydrate without heaviness',
            'Dermatologist tested and spa-professional approved',
          ],
        },
        price: 68.0,
        compare_price: 78.0,
        stock: 120,
        sku: 'SKU-SERUM-001',
        status: 'published',
        is_featured: true,
        is_best_seller: true,
        primaryCategory: 'skincare',
        extraCategories: ['treatments'],
        brand: 'lumina-skin',
        thumbnailKey: 'vitamin-c-serum',
        galleryKeys: ['vitamin-c-serum'],
        seo: {
          title: 'Radiant Vitamin C Serum',
          description: 'Brightening vitamin C serum designed for spa-level facial treatments.',
        },
        attributes: [
          { name: 'Skin Type', value: 'All skin types' },
          { name: 'Key Ingredients', value: '20% Vitamin C, Hyaluronic Acid, Ferulic Acid' },
          { name: 'Size', value: '30 ml' },
        ],
        published_at: '2024-09-15T09:00:00Z',
      },
      {
        name: 'Deep Restore Massage Oil',
        slug: 'deep-restore-massage-oil',
        description: 'Botanical massage oil that delivers glide while nourishing the skin.',
        content: {
          summary: 'Cold-pressed oils blended with calming botanicals for restorative massage rituals.',
          usage: 'Warm between palms and apply to desired areas. Ideal for deep tissue techniques.',
          highlights: [
            'Infused with lavender and chamomile extracts',
            'Non-greasy finish with long-lasting slip',
            'Free from mineral oil and artificial fragrance',
          ],
        },
        price: 42.0,
        compare_price: 49.0,
        stock: 80,
        sku: 'SKU-OIL-204',
        status: 'published',
        is_featured: false,
        is_best_seller: true,
        primaryCategory: 'body-care',
        extraCategories: ['treatments'],
        brand: 'purebody-naturals',
        thumbnailKey: 'massage-oil',
        galleryKeys: ['massage-oil'],
        seo: {
          title: 'Deep Restore Massage Oil',
          description: 'Plant-powered massage oil ideal for restorative body treatments.',
        },
        attributes: [
          { name: 'Aroma', value: 'Lavender & Chamomile' },
          { name: 'Texture', value: 'Lightweight oil with slow absorption' },
          { name: 'Size', value: '500 ml' },
        ],
        published_at: '2024-09-18T09:00:00Z',
      },
      {
        name: 'Pro Facial Steamer Elite',
        slug: 'pro-facial-steamer-elite',
        description: 'High-output facial steamer with adjustable ozone and essential oil basket.',
        content: {
          summary: 'Deliver consistent steam output to prep skin for extractions and targeted treatments.',
          usage: 'Fill with distilled water, allow to heat for 7 minutes, and position 12 inches from the client.',
          highlights: [
            'Adjustable arm with 360° rotation',
            'Digital timer with auto-shutoff safety',
            'Ozone function to purify steam output',
          ],
        },
        price: 389.0,
        compare_price: 429.0,
        stock: 25,
        sku: 'SKU-STEAMER-310',
        status: 'published',
        is_featured: true,
        is_best_seller: false,
        primaryCategory: 'spa-equipment',
        brand: 'theratech-pro',
        thumbnailKey: 'facial-steamer',
        galleryKeys: ['facial-steamer'],
        seo: {
          title: 'Pro Facial Steamer Elite',
          description: 'Professional facial steamer with ozone control for treatment rooms.',
        },
        attributes: [
          { name: 'Water Capacity', value: '1.0 liter' },
          { name: 'Electrical', value: '110V / 60Hz' },
          { name: 'Warranty', value: '2 years' },
        ],
        published_at: '2024-09-20T09:00:00Z',
      },
      {
        name: 'Calming Aura Aroma Diffuser',
        slug: 'calming-aura-aroma-diffuser',
        description: 'Ultrasonic diffuser that gently scents treatment spaces with calming essential oils.',
        content: {
          summary: 'Create an immersive experience with whisper-quiet diffusion and ambient lighting.',
          usage: 'Add water to reservoir with 5-7 drops of essential oil. Select light mode and diffusion cycle.',
          highlights: [
            '4 timing modes with auto-shutoff',
            'Multicolor ambient lighting with dimming control',
            'BPA-free water tank and silent operation',
          ],
        },
        price: 79.0,
        compare_price: 92.0,
        stock: 60,
        sku: 'SKU-DIFFUSER-112',
        status: 'published',
        is_featured: false,
        is_best_seller: true,
        primaryCategory: 'aromatherapy',
        brand: 'aromawave',
        thumbnailKey: 'aroma-diffuser',
        galleryKeys: ['aroma-diffuser'],
        seo: {
          title: 'Calming Aura Aroma Diffuser',
          description: 'Quiet ultrasonic diffuser ideal for spa relaxation lounges.',
        },
        attributes: [
          { name: 'Run Time', value: 'Up to 8 hours' },
          { name: 'Tank Capacity', value: '200 ml' },
          { name: 'Light Modes', value: '7 colors with soft white option' },
        ],
        published_at: '2024-09-25T09:00:00Z',
      },
    ];

    for (const product of productSeeds) {
      const primaryCategoryId = product.primaryCategory
        ? categoryMap[product.primaryCategory]
        : null;
      if (!primaryCategoryId) {
        console.warn(`[seed] Skipping product ${product.name} because primary category is missing.`);
        continue;
      }

      const brandId = product.brand ? brandMap[product.brand] : null;
      const thumbnailId = product.thumbnailKey ? assetMap[product.thumbnailKey] || null : null;

      const result = await pool.query(
        `
          INSERT INTO products (
            name, slug, description, content, category_id, brand_id,
            sku, price, compare_price, stock, status,
            is_featured, is_best_seller, thumbnail_id, seo, published_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11,
            $12, $13, $14, $15, $16
          )
          ON CONFLICT (slug) DO UPDATE
          SET description = EXCLUDED.description,
              content = EXCLUDED.content,
              category_id = EXCLUDED.category_id,
              brand_id = EXCLUDED.brand_id,
              sku = EXCLUDED.sku,
              price = EXCLUDED.price,
              compare_price = EXCLUDED.compare_price,
              stock = EXCLUDED.stock,
              status = EXCLUDED.status,
              is_featured = EXCLUDED.is_featured,
              is_best_seller = EXCLUDED.is_best_seller,
              thumbnail_id = EXCLUDED.thumbnail_id,
              seo = EXCLUDED.seo,
              published_at = EXCLUDED.published_at,
              updated_at = NOW()
          RETURNING id
        `,
        [
          product.name,
          product.slug,
          product.description,
          product.content ? JSON.stringify(product.content) : null,
          primaryCategoryId,
          brandId,
          product.sku || null,
          product.price,
          product.compare_price || null,
          product.stock,
          product.status,
          product.is_featured,
          product.is_best_seller,
          thumbnailId,
          product.seo ? JSON.stringify(product.seo) : null,
          product.published_at || new Date().toISOString(),
        ]
      );

      const productId = result.rows[0]?.id;
      if (!productId) {
        console.warn(`[seed] Failed to create product ${product.name}`);
        continue;
      }

      const categorySlugs = [product.primaryCategory, ...(product.extraCategories || [])];
      for (const slug of categorySlugs) {
        const categoryId = categoryMap[slug];
        if (!categoryId) continue;

        await pool.query(
          `
            INSERT INTO product_product_categories (product_id, category_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `,
          [productId, categoryId]
        );
      }

      if (product.galleryKeys && product.galleryKeys.length > 0) {
        const existingImages = await pool.query(
          `SELECT COUNT(*)::int AS count FROM product_images WHERE product_id = $1`,
          [productId]
        );

        const imageCount = parseInt(existingImages.rows[0]?.count ?? '0', 10);

        if (imageCount === 0) {
          for (let index = 0; index < product.galleryKeys.length; index++) {
            const key = product.galleryKeys[index];
            const assetId = assetMap[key];
            if (!assetId) continue;

            await pool.query(
              `
                INSERT INTO product_images (id, product_id, asset_id, sort_order)
                VALUES (uuid_generate_v4(), $1, $2, $3)
              `,
              [productId, assetId, index]
            );
          }
        }
      }

      if (product.attributes && product.attributes.length > 0) {
        for (const attr of product.attributes) {
          const exists = await pool.query(
            `
              SELECT 1
              FROM product_attributes
              WHERE product_id = $1 AND name = $2
              LIMIT 1
            `,
            [productId, attr.name]
          );

          if (exists.rows.length === 0) {
            await pool.query(
              `
                INSERT INTO product_attributes (id, product_id, name, value)
                VALUES (uuid_generate_v4(), $1, $2, $3)
              `,
              [productId, attr.name, attr.value]
            );
          }
        }
      }
    }

    console.log('Seeded sample products for storefront testing.');

    // Seed testimonials mặc định cho homepage (chỉ chèn nếu chưa có)
    const testimonials = [
      {
        customer_name: 'Laura W.',
        customer_title: 'Esthetician',
        customer_initials: 'LW',
        testimonial_text:
          'I have been dealing with Digital PressUp for over 10 years and have never been disappointed in a product or their great customer service. Thank you for making my job easier as a Clinic Esthetician.',
        rating: 5,
        sort_order: 0,
        is_featured: true,
      },
      {
        customer_name: 'Kiara H.',
        customer_title: 'Owner/Operator',
        customer_initials: 'KH',
        testimonial_text:
          'All your needs in one place like being at a party store! Amazing selection and fast shipping. Highly recommend Digital PressUp!',
        rating: 5,
        sort_order: 1,
        is_featured: true,
      },
      {
        customer_name: 'Sarah M.',
        customer_title: 'Spa Director',
        customer_initials: 'SM',
        testimonial_text:
          'Outstanding quality and service! The educational resources have been invaluable for my team. We trust Digital PressUp for all our spa supplies.',
        rating: 5,
        sort_order: 2,
        is_featured: true,
      },
    ];

    for (const testimonial of testimonials) {
      const exists = await pool.query(
        `
          SELECT 1 FROM testimonials
          WHERE customer_name = $1 AND testimonial_text = $2
          LIMIT 1
        `,
        [testimonial.customer_name, testimonial.testimonial_text]
      );

      if (exists.rows.length === 0) {
        await pool.query(
          `
            INSERT INTO testimonials (
              id, customer_name, customer_title, customer_initials,
              testimonial_text, rating, is_featured, sort_order, is_active
            )
            VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, TRUE)
          `,
          [
            testimonial.customer_name,
            testimonial.customer_title,
            testimonial.customer_initials,
            testimonial.testimonial_text,
            testimonial.rating,
            testimonial.is_featured,
            testimonial.sort_order,
          ]
        );
      }
    }

    console.log('Seeded default testimonials for homepage.');

    // Ensure Learning Library topic exists (dùng cho phần blog)
    const learningTopicResult = await pool.query(
      `
        INSERT INTO topics (id, name, slug, description)
        VALUES (uuid_generate_v4(), 'Learning Library', 'learning-library', 'Curated resources and articles for professionals')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `
    );
    const learningTopicId =
      learningTopicResult.rows[0]?.id ||
      (await pool.query(`SELECT id FROM topics WHERE slug = 'learning-library' LIMIT 1`)).rows[0].id;

    // Lấy id admin (đã seed phía trên) để gán làm author cho bài viết
    const adminResult = await pool.query(
      `SELECT id FROM users WHERE email = 'admin@pressup.com' LIMIT 1`
    );
    const adminId = adminResult.rows[0]?.id || null;

    const learningPosts = [
      {
        title: 'Building a Lash & Brow Bar Clients Can\'t Resist',
        slug: 'building-a-lash-brow-bar-clients-cant-resist',
        excerpt:
          'Soft clients will beat a path to your door for beautiful brows. Learn five reasons to add lash and brow services to your menu.',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Want to attract more lash & brow clients? Explore five actionable strategies to elevate your services and create repeat customers.',
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'From designing irresistible service packages to building post-care education, this guide helps you grow a loyal clientele.',
                },
              ],
            },
          ],
        },
        readTime: '5 min read',
        category: 'Lash & Brow',
        publishedAt: '2024-11-05T09:00:00Z',
        imageUrl: 'https://images.unsplash.com/photo-1692710799704-26e80aa78e66?w=800&h=500',
      },
      {
        title: 'How Massage Therapists Can Reduce Burnout',
        slug: 'how-massage-therapists-can-reduce-burnout',
        excerpt:
          'Balancing the physical and emotional demands of massage therapy can be challenging. Discover techniques to stay energized and inspired.',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Burnout is common in the massage world. Learn how to create sustainable routines, protect your energy, and reconnect with your passion.',
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'We cover self-care rituals, scheduling tactics, and client communication tips to help you stay balanced.',
                },
              ],
            },
          ],
        },
        readTime: '7 min read',
        category: 'Massage',
        publishedAt: '2024-11-12T09:00:00Z',
        imageUrl: 'https://images.unsplash.com/photo-1519120126473-6010d3c6af6b?w=800&h=500',
      },
    ];

    for (const post of learningPosts) {
      const insertedPost = await pool.query(
        `
          INSERT INTO posts (
            id, title, slug, excerpt, content, status, author_id, published_at, seo, read_time, created_at, updated_at
          )
          VALUES (
            uuid_generate_v4(), $1::text, $2::text, $3::text, $4::jsonb, 'published', $5::uuid, $6::timestamptz,
            jsonb_build_object('title', $1::text, 'description', $3::text), $7::text, NOW(), NOW()
          )
          ON CONFLICT (slug) DO NOTHING
          RETURNING id
        `,
        [
          post.title,
          post.slug,
          post.excerpt,
          JSON.stringify({
            ...post.content,
            meta: {
              readTime: post.readTime,
              category: post.category,
              imageUrl: post.imageUrl,
            },
          }),
          adminId,
          post.publishedAt,
          post.readTime,
        ]
      );

      const postId =
        insertedPost.rows[0]?.id ||
        (await pool.query(`SELECT id FROM posts WHERE slug = $1`, [post.slug])).rows[0].id;

      await pool.query(
        `
          INSERT INTO post_topics (post_id, topic_id)
          VALUES ($1, $2)
          ON CONFLICT (post_id, topic_id) DO NOTHING
        `,
        [postId, learningTopicId]
      );
    }

    console.log('Seeded Learning Library posts tied to the Learning Library topic.');

    // Seed homepage metrics (quản lý qua Settings)
    const homepageMetrics = {
      activeCustomers: '84,000+',
      countriesServed: '47',
      yearsInBusiness: '40+',
    };

    await pool.query(
      `
        INSERT INTO settings (namespace, value, updated_at)
        VALUES ('homepage_metrics', $1::jsonb, NOW())
        ON CONFLICT (namespace) DO UPDATE
        SET value = EXCLUDED.value, updated_at = NOW()
      `,
      [JSON.stringify(homepageMetrics)]
    );

    console.log('Seeded homepage metrics settings.');

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();