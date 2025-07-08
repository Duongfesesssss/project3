const express = require('express');
const router = express.Router();
const { 
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  applyVoucher,
  getVoucherDatatable
} = require('../controllers/voucherController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validation');

// Routes cho admin
router.get('/', authenticate, authorize(['admin']), getVouchers);
router.post('/datatable', authenticate, authorize(['admin']), getVoucherDatatable);
router.post('/', authenticate, authorize(['admin']), validate(schemas.voucher), createVoucher);
router.put('/:id', authenticate, authorize(['admin']), validate(schemas.voucher), updateVoucher);
router.delete('/:id', authenticate, authorize(['admin']), deleteVoucher);

// Route cho user áp dụng voucher
router.post('/apply', authenticate, applyVoucher);

module.exports = router; 