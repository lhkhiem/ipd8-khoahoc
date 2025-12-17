// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import '../utils/loadEnv';

import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

async function findZaloPayOrder() {
  const searchTerm = process.argv[2]; // app_trans_id hoặc order_number

  if (!searchTerm) {
    console.error('❌ Usage: ts-node findZaloPayOrder.ts <app_trans_id_or_order_number>');
    console.error('Example: ts-node findZaloPayOrder.ts "251129_ORDMIIH5E5273P61"');
    console.error('Example: ts-node findZaloPayOrder.ts "ORD-MIIH5E52-73P61"');
    process.exit(1);
  }

  console.log('🔍 Searching for ZaloPay order...');
  console.log('Search term:', searchTerm);
  console.log('');

  try {
    // Search by app_trans_id or order_number
    const searchQuery = `
      SELECT 
        id, order_number, payment_status, status, total,
        zp_app_trans_id, zp_trans_id, payment_method,
        customer_name, customer_email, customer_phone,
        created_at, updated_at
      FROM orders
      WHERE zp_app_trans_id LIKE :search
         OR order_number LIKE :search
         OR order_number LIKE :search2
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const orders: any = await sequelize.query(searchQuery, {
      replacements: { 
        search: `%${searchTerm}%`,
        search2: `%${searchTerm.replace(/_/g, '-')}%`
      },
      type: QueryTypes.SELECT
    });

    if (!orders || orders.length === 0) {
      console.log('❌ No orders found');
      console.log('');
      console.log('📋 Recent ZaloPay orders (last 10):');
      
      const recentQuery = `
        SELECT 
          id, order_number, payment_status, status, total,
          zp_app_trans_id, payment_method, created_at
        FROM orders
        WHERE payment_method = 'zalopay'
        ORDER BY created_at DESC
        LIMIT 10
      `;
      const recentOrders: any = await sequelize.query(recentQuery, {
        type: QueryTypes.SELECT
      });

      if (recentOrders && recentOrders.length > 0) {
        recentOrders.forEach((o: any, i: number) => {
          console.log(`\n${i + 1}. Order: ${o.order_number}`);
          console.log(`   ID: ${o.id}`);
          console.log(`   App Trans ID: ${o.zp_app_trans_id || 'N/A'}`);
          console.log(`   Payment Status: ${o.payment_status}`);
          console.log(`   Status: ${o.status}`);
          console.log(`   Total: ${o.total} ₫`);
          console.log(`   Created: ${o.created_at}`);
        });
      } else {
        console.log('   No ZaloPay orders found');
      }

      await sequelize.close();
      process.exit(1);
    }

    console.log(`✅ Found ${orders.length} order(s):\n`);

    orders.forEach((order: any, i: number) => {
      console.log(`${i + 1}. Order Details:`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Order Number: ${order.order_number}`);
      console.log(`   App Trans ID: ${order.zp_app_trans_id || 'N/A'}`);
      console.log(`   Payment Status: ${order.payment_status}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total: ${order.total} ₫`);
      console.log(`   Payment Method: ${order.payment_method}`);
      console.log(`   Customer: ${order.customer_name} (${order.customer_email})`);
      console.log(`   Created: ${order.created_at}`);
      console.log(`   Updated: ${order.updated_at}`);
      console.log('');
    });

    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await sequelize.close();
    process.exit(1);
  }
}

findZaloPayOrder();

