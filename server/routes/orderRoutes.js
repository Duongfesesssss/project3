const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getUserOrders, 
  getOrderDetail, 
  updateOrderStatus,
  getOrderDatatable,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validation');

// Routes cho admin
router.get('/datatable', authenticate, authorize(['admin']), getOrderDatatable);
router.put('/update/:order_id', authenticate, authorize(['admin']), updateOrder);
router.delete('/delete/:order_id', authenticate, authorize(['admin']), deleteOrder);

// Routes cho user
router.post('/create', authenticate, validate(schemas.order), createOrder);
router.get('/user/:user_id', authenticate, getUserOrders);
router.get('/:order_id', authenticate, getOrderDetail);
router.patch('/:order_id/status', authenticate, authorize(['admin']), updateOrderStatus);

module.exports = router; 