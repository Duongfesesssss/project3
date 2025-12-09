const { Book } = require('../models/bookModel');
const Order = require('../models/orderModel');

// Cập nhật tồn kho và số lượng bán cho đơn đã thanh toán, tránh áp dụng lặp
async function applySalesForOrder(orderId) {
  if (!orderId) return { applied: false, reason: 'missing-order-id' };

  // Lấy đơn chưa áp dụng sales để tránh đếm trùng
  const order = await Order.findOne({ _id: orderId, sales_applied: { $ne: true } }).lean();
  if (!order) return { applied: false, reason: 'already-applied-or-not-found' };

  for (const item of order.items || []) {
    if (!item?.book_id || !item?.quantity) continue;
    const book = await Book.findById(item.book_id);
    if (!book) continue;

    const qty = Math.max(0, item.quantity);
    book.sold_quantity = (book.sold_quantity || 0) + qty;
    book.sales_count = (book.sales_count || 0) + qty;
    const currentStock = Number.isFinite(book.stock_quantity) ? book.stock_quantity : 0;
    book.stock_quantity = Math.max(0, currentStock - qty);
    book.markModified('stock_quantity');
    await book.save();
  }

  await Order.updateOne({ _id: order._id }, { sales_applied: true, updated_at: new Date() });
  return { applied: true };
}

module.exports = { applySalesForOrder };
