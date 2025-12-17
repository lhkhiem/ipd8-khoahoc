import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

const INSERT_SQL = `
  INSERT INTO value_props (id, title, subtitle, icon_key, icon_color, icon_background, sort_order, is_active)
  VALUES
    (gen_random_uuid(), 'Free Shipping', 'On orders $749+', 'shipping', '#2563eb', '#bfdbfe', 0, TRUE),
    (gen_random_uuid(), 'Reduced Shipping', '$4.99 on orders $199+', 'dollar', '#10b981', '#bbf7d0', 1, TRUE),
    (gen_random_uuid(), 'Quality Guaranteed', 'Tested & approved', 'shield-check', '#a855f7', '#e9d5ff', 2, TRUE),
    (gen_random_uuid(), '40+ Years', 'Industry leader', 'award', '#f59e0b', '#fde68a', 3, TRUE),
    (gen_random_uuid(), 'Good Karma Rewards', 'Earn points on every purchase', 'heart', '#f43f5e', '#fecdd3', 4, TRUE),
    (gen_random_uuid(), 'Free Education', 'CEU courses available', 'book-open', '#3b82f6', '#bfdbfe', 5, TRUE);
`;

async function seedValueProps() {
  try {
    await sequelize.authenticate();

    const result = await sequelize.query<{ count: number }>(
      'SELECT COUNT(*)::int AS count FROM value_props',
      { type: QueryTypes.SELECT }
    );

    const count = (result[0] as unknown as { count: number })?.count ?? 0;

    if (count > 0) {
      console.log(`value_props already has ${count} rows. Skipping seed.`);
      return;
    }

    await sequelize.query(INSERT_SQL);
    console.log('Seeded value_props with default entries.');
  } catch (error) {
    console.error('Failed to seed value_props:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seedValueProps();


