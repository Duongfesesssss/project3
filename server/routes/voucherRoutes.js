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

// Routes cho admin
router.get('/', getVouchers);
router.post('/datatable', getVoucherDatatable);
router.post('/', createVoucher);
router.put('/:id', updateVoucher);
router.delete('/:id', deleteVoucher);

// Route cho user áp dụng voucher
router.post('/apply', applyVoucher);

module.exports = router; 