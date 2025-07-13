const express = require('express');
const router = express.Router();
const {
    stockIn,
    stockOut,
    getBookTransactionHistory,
    getAllRecentTransactions
} = require('../controllers/stockTransactionController');

// ========== STOCK TRANSACTION ROUTES ==========

// Nhập hàng
router.post('/:bookId/stock-in', stockIn);

// Xuất hàng 
router.post('/:bookId/stock-out', stockOut);

// Lấy lịch sử giao dịch của một cuốn sách
router.get('/:bookId/history', getBookTransactionHistory);

// Lấy tất cả giao dịch gần đây (cho admin)
router.get('/all', getAllRecentTransactions);

module.exports = router;
