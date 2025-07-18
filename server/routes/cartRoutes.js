const express = require('express');
const router = express.Router();
const {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { authenticateToken } = require('../middlewares/roleMiddleware');

// Lấy giỏ hàng của user - cần xác thực
router.get('/:user_id', authenticateToken, getCartByUserId);

// Thêm sách vào giỏ hàng - cần xác thực
router.post('/add', authenticateToken, addToCart);

// Cập nhật số lượng sách trong giỏ hàng - cần xác thực
router.put('/update', authenticateToken, updateCartItem);

// Xóa sách khỏi giỏ hàng - cần xác thực
router.delete('/remove', authenticateToken, removeFromCart);

// Xóa toàn bộ giỏ hàng - cần xác thực
router.delete('/clear/:user_id', authenticateToken, clearCart);

module.exports = router; 