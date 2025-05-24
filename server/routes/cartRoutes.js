const express = require('express');
const router = express.Router();
const {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// Lấy giỏ hàng của user
router.get('/:user_id', getCartByUserId);

// Thêm sách vào giỏ hàng
router.post('/add', addToCart);

// Cập nhật số lượng sách trong giỏ hàng
router.put('/update', updateCartItem);

// Xóa sách khỏi giỏ hàng
router.delete('/remove', removeFromCart);

// Xóa toàn bộ giỏ hàng
router.delete('/clear/:user_id', clearCart);

module.exports = router; 