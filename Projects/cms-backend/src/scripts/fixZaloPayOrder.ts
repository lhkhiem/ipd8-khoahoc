// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import '../utils/loadEnv';

import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

async function fixZaloPayOrder() {
  const appTransId = process.argv[2]; // Lấy từ command line

  if (!appTransId) {
    console.error('❌ Usage: ts-node fixZaloPayOrder.ts <app_trans_id>');
    console.error('Example: ts-node fixZaloPayOrder.ts "251129_ORDMIIH5E5273P61"');
    process.exit(1);
  }

  console.log('🔧 Fixing ZaloPay order...');
  console.log('App Trans ID:', appTransId);
  console.log('');

  try {
    // Find order
    const orderQuery = `
      SELECT 
        id, order_number, payment_status, status, total,
        zp_app_trans_id, zp_trans_id
      FROM orders
      WHERE zp_app_trans_id = :app_trans_id
      LIMIT 1
    `;
    const orders: any = await sequelize.query(orderQuery, {
      replacements: { app_trans_id: appTransId },
      type: QueryTypes.SELECT
    });

    if (!orders || orders.length === 0) {
      console.error('❌ Order not found with app_trans_id:', appTransId);
      process.exit(1);
    }

    const order = orders[0];
    console.log('📦 Found order:');
    console.log('  ID:', order.id);
    console.log('  Order Number:', order.order_number);
    console.log('  Current Payment Status:', order.payment_status);
    console.log('  Current Status:', order.status);
    console.log('  Total:', order.total);
    console.log('  ZP Trans ID:', order.zp_trans_id || 'N/A');
    console.log('');

    // Update to paid
    const updateQuery = `
      UPDATE orders
      SET payment_status = 'paid',
          status = CASE
            WHEN status = 'pending' THEN 'processing'
            ELSE status
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = :order_id
    `;
    
    const updateResult: any = await sequelize.query(updateQuery, {
      replacements: { order_id: order.id },
      type: QueryTypes.UPDATE
    });

    const rowsAffected = updateResult[1] || 0;

    if (rowsAffected > 0) {
      console.log('✅ Order updated successfully!');
      console.log('  Payment Status: failed → paid');
      console.log('  Status:', order.status === 'pending' ? 'pending → processing' : 'unchanged');
      console.log('  Rows affected:', rowsAffected);
    } else {
      console.log('⚠️  No rows updated (order might already be paid)');
    }

    // Verify update
    const verifyQuery = `
      SELECT payment_status, status
      FROM orders
      WHERE id = :order_id
    `;
    const verifyResult: any = await sequelize.query(verifyQuery, {
      replacements: { order_id: order.id },
      type: QueryTypes.SELECT
    });

    if (verifyResult && verifyResult.length > 0) {
      console.log('');
      console.log('📋 Updated order status:');
      console.log('  Payment Status:', verifyResult[0].payment_status);
      console.log('  Status:', verifyResult[0].status);
    }

    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await sequelize.close();
    process.exit(1);
  }
}

fixZaloPayOrder();

