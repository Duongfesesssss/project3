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

// Routes cho admin
router.get('/', getAllSuppliers);
router.post('/datatable', getSupplierDatatable);
router.get('/:id', getSupplierById);
router.post('/', createSupplier);
router.put('/', updateSupplier);
router.delete('/', deleteSupplier);

module.exports = router; 