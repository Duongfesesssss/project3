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

// Routes cho admin
router.get('/datatable', getOrderDatatable);
router.post('/create', createOrder);
router.put('/update/:order_id', updateOrder);
router.delete('/delete/:order_id', deleteOrder);

// Routes cho user
router.get('/user/:user_id', getUserOrders);
router.get('/:order_id', getOrderDetail);
router.patch('/:order_id/status', updateOrderStatus);

module.exports = router; 