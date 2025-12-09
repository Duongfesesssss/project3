/*
Chạy bù sold_quantity / sales_count cho các đơn đã thanh toán nhưng chưa áp dụng.
Run: node server/scripts/applySalesForPaidOrders.js
Env: DATABASE_URL
*/
require('dotenv').config();
const mongoose = require('mongoose');
const { connectToDB } = require('../db');
const Order = require('../models/orderModel');
const { applySalesForOrder } = require('../services/orderInventoryService');

const TARGET_STATUSES = ['paid', 'processing', 'shipped', 'delivered'];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Thiếu biến môi trường DATABASE_URL. Hãy set DATABASE_URL hoặc tạo file .env trước khi chạy.');
    process.exit(1);
  }
  await connectToDB();
  const cursor = Order.find({ status: { $in: TARGET_STATUSES }, sales_applied: { $ne: true } }).cursor();
  let total = 0;
  let applied = 0;
  for await (const order of cursor) {
    total += 1;
    try {
      const result = await applySalesForOrder(order._id);
      if (result.applied) applied += 1;
      console.log(`Order ${order._id} -> applied: ${result.applied}, reason: ${result.reason || 'ok'}`);
    } catch (err) {
      console.error(`Order ${order._id} lỗi:`, err.message);
    }
  }
  console.log(`Done. Checked ${total}, applied ${applied}.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
