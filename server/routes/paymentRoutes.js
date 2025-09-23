const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route tạo đơn thanh toán PayOS
router.post('/payos', paymentController.createPayOSPayment);

// Route kiểm tra trạng thái thanh toán PayOS
router.get('/payos/status/:orderCode', paymentController.getPayOSPaymentStatus);

// Route sync manual payment status (khi webhook không hoạt động)
router.post('/payos/sync/:orderCode', paymentController.syncPaymentStatus);

// Route nhận và xử lý webhook từ PayOS
router.post('/payos/webhook', paymentController.handlePayOSWebhook);

module.exports = router;
