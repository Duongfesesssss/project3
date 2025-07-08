const express = require('express');
const router = express.Router();
const {
  getAllSuppliers,
  getSupplierById,
  getSupplierDatatable,
  createSupplier,
  deleteSupplier,
  updateSupplier
} = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Routes cho admin
router.get('/', authenticate, authorize(['admin']), getAllSuppliers);
router.post('/datatable', authenticate, authorize(['admin']), getSupplierDatatable);
router.get('/:id', authenticate, authorize(['admin']), getSupplierById);
router.post('/', authenticate, authorize(['admin']), createSupplier);
router.put('/', authenticate, authorize(['admin']), updateSupplier);
router.delete('/', authenticate, authorize(['admin']), deleteSupplier);

module.exports = router; 