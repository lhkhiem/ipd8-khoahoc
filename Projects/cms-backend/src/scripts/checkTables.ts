import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

async function checkTables() {
  try {
    const rows = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('education_resources','value_props','testimonials')",
      { type: QueryTypes.SELECT }
    );

    console.log(rows);
  } catch (error) {
    console.error('Failed to check tables:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();



