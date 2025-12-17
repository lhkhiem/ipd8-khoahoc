/**
 * Script to find and fix stuck ZaloPay orders
 * 
 * Stuck orders are orders where:
 * - Payment was successful (has zp_trans_id) but payment_status is not 'paid'
 * - This can happen if callback succeeded but database update failed
 * 
 * Usage:
 *   npx ts-node src/scripts/fixStuckZaloPayOrders.ts [--dry-run] [--refund]
 */

// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import '../utils/loadEnv';

import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { queryZaloPayOrder } from '../services/zalopay';

const DRY_RUN = process.argv.includes('--dry-run');
const AUTO_REFUND = process.argv.includes('--refund');

interface StuckOrder {
  id: string;
  order_number: string;
  total: number;
  payment_status: string;
  zp_app_trans_id: string;
  zp_trans_id: number | null;
  created_at: Date;
  customer_email: string;
  customer_name: string;
}

async function findStuckOrders(): Promise<StuckOrder[]> {
  const query = `
    SELECT 
      id, order_number, total, payment_status,
      zp_app_trans_id, zp_trans_id,
      created_at, customer_email, customer_name
    FROM orders
    WHERE payment_method = 'zalopay'
      AND zp_app_trans_id IS NOT NULL
      AND (
        (zp_trans_id IS NOT NULL AND payment_status != 'paid')
        OR (payment_status = 'pending' AND created_at < NOW() - INTERVAL '1 hour')
      )
    ORDER BY created_at DESC
    LIMIT 100
  `;

  const orders: StuckOrder[] = await sequelize.query(query, {
    type: QueryTypes.SELECT
  });

  return orders;
}

async function fixOrder(order: StuckOrder): Promise<{ success: boolean; message: string }> {
  try {
    // Query ZaloPay to check actual payment status
    const queryResult = await queryZaloPayOrder(order.zp_app_trans_id);
    
    const isPaid = queryResult.return_code === 1;
    const zp_trans_id = queryResult.zp_trans_id || order.zp_trans_id;

    if (!isPaid) {
      return {
        success: false,
        message: `Payment not successful. return_code: ${queryResult.return_code}, message: ${queryResult.return_message}`
      };
    }

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would update order ${order.order_number}:`, {
        current_status: order.payment_status,
        new_status: 'paid',
        zp_trans_id,
      });
      return { success: true, message: 'Dry run - would update' };
    }

    // Update order to paid
    const updateQuery = `
      UPDATE orders
      SET zp_trans_id = :zp_trans_id,
          payment_status = 'paid',
          payment_transaction_id = :zp_trans_id::text,
          status = CASE
            WHEN status = 'pending' THEN 'processing'
            ELSE status
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = :order_id
    `;

    await sequelize.query(updateQuery, {
      replacements: {
        order_id: order.id,
        zp_trans_id: zp_trans_id,
      },
      type: QueryTypes.UPDATE
    });

    console.log(`✅ Fixed order ${order.order_number}:`, {
      order_id: order.id,
      zp_trans_id,
      previous_status: order.payment_status,
      new_status: 'paid',
    });

    return { success: true, message: 'Order updated to paid' };
  } catch (error: any) {
    console.error(`❌ Error fixing order ${order.order_number}:`, error.message);
    return { success: false, message: error.message };
  }
}

async function main() {
  console.log('🔍 Finding stuck ZaloPay orders...');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  if (AUTO_REFUND) {
    console.log('⚠️  AUTO REFUND enabled - will refund orders that cannot be fixed');
  }

  const stuckOrders = await findStuckOrders();
  
  if (stuckOrders.length === 0) {
    console.log('✅ No stuck orders found');
    return;
  }

  console.log(`\nFound ${stuckOrders.length} potentially stuck orders:\n`);

  let fixed = 0;
  let failed = 0;
  const refundCandidates: StuckOrder[] = [];

  for (const order of stuckOrders) {
    console.log(`\n📦 Order ${order.order_number}:`);
    console.log(`   Status: ${order.payment_status}`);
    console.log(`   ZP Trans ID: ${order.zp_trans_id || 'N/A'}`);
    console.log(`   ZP App Trans ID: ${order.zp_app_trans_id}`);
    console.log(`   Amount: ${order.total} VND`);
    console.log(`   Customer: ${order.customer_name} (${order.customer_email})`);

    const result = await fixOrder(order);
    
    if (result.success) {
      fixed++;
      console.log(`   ✅ ${result.message}`);
    } else {
      failed++;
      console.log(`   ❌ ${result.message}`);
      
      // If payment was successful but we can't fix it, mark for refund
      if (AUTO_REFUND && order.zp_trans_id) {
        refundCandidates.push(order);
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total: ${stuckOrders.length}`);
  console.log(`   Fixed: ${fixed}`);
  console.log(`   Failed: ${failed}`);
  
  if (refundCandidates.length > 0) {
    console.log(`\n⚠️  ${refundCandidates.length} orders may need manual refund:`);
    refundCandidates.forEach(order => {
      console.log(`   - ${order.order_number} (${order.total} VND, zp_trans_id: ${order.zp_trans_id})`);
    });
    console.log(`\n   Use: POST /api/payments/zalopay/refund with orderId`);
  }
}

main()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

