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
const { authenticateToken, staffAndAdmin } = require('../middlewares/roleMiddleware');

// ========== PUBLIC ROUTES ==========
// Route cho user áp dụng voucher
router.post('/apply', applyVoucher);

// ========== STAFF & ADMIN ROUTES ==========
router.use(authenticateToken);

// ✅ STAFF VÀ ADMIN: Quản lý voucher
router.get('/', staffAndAdmin, getVouchers);
router.post('/datatable', staffAndAdmin, getVoucherDatatable);
router.post('/', staffAndAdmin, createVoucher);
router.put('/:id', staffAndAdmin, updateVoucher);
router.delete('/:id', staffAndAdmin, deleteVoucher);

module.exports = router; 