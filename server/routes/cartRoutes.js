const express = require('express');
const router = express.Router();
const {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validation');

// Lấy giỏ hàng của user
router.get('/:user_id', authenticate, getCartByUserId);

// Thêm sách vào giỏ hàng
router.post('/add', authenticate, validate(schemas.cart), addToCart);

// Cập nhật số lượng sách trong giỏ hàng
router.put('/update', authenticate, validate(schemas.cart), updateCartItem);

// Xóa sách khỏi giỏ hàng
router.delete('/remove', authenticate, removeFromCart);

// Xóa toàn bộ giỏ hàng
router.delete('/clear/:user_id', authenticate, clearCart);

module.exports = router; 