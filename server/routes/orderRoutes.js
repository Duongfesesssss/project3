const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getUserOrders, 
  getOrderDetail, 
  updateOrderStatus,
  getOrderDatatable,
  updateOrder,
  deleteOrder,
  updatePaymentStatus,
  getUserPaidOrders
} = require('../controllers/orderController');
const { authenticateToken, staffAndAdmin, adminOnly } = require('../middlewares/roleMiddleware');

// ========== PUBLIC/CUSTOMER ROUTES ==========
router.post('/create', createOrder); // Khách hàng tạo đơn hàng

// ========== AUTHENTICATED ROUTES ==========
router.use(authenticateToken);

// ✅ CUSTOMER: Xem đơn hàng của mình
router.get('/my-orders', getUserOrders); // Lấy đơn hàng của user hiện tại
router.get('/detail/:order_id', getOrderDetail); // Xem chi tiết đơn hàng
router.get('/my-paid-orders', getUserPaidOrders); // Lấy đơn hàng đã thanh toán của user hiện tại

// ✅ STAFF VÀ ADMIN: Quản lý đơn hàng
router.get('/datatable', staffAndAdmin, getOrderDatatable);
router.get('/user/:user_id', staffAndAdmin, getUserOrders);
router.get('/:order_id', staffAndAdmin, getOrderDetail);
router.patch('/:order_id/status', staffAndAdmin, updateOrderStatus);

// ✅ STAFF VÀ ADMIN: Cập nhật và xóa đơn hàng
router.put('/update/:order_id', staffAndAdmin, updateOrder);
router.delete('/delete/:order_id', staffAndAdmin, deleteOrder);

// ✅ PUBLIC: Cập nhật trạng thái thanh toán (được gọi từ webhook PayOS)
router.patch('/payment-status/:orderCode', updatePaymentStatus);

module.exports = router; 