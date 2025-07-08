const express = require('express');
const router = express.Router();
const {
  getAllPublishers,
  getPublisherById,
  getPublisherDatatable,
  createPublisher,
  deletePublisher,
  updatePublisher
} = require('../controllers/publisherController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Routes cho admin
router.get('/', authenticate, authorize(['admin']), getAllPublishers);
router.post('/datatable', authenticate, authorize(['admin']), getPublisherDatatable);
router.get('/:id', authenticate, authorize(['admin']), getPublisherById);
router.post('/', authenticate, authorize(['admin']), createPublisher);
router.put('/', authenticate, authorize(['admin']), updatePublisher);
router.delete('/', authenticate, authorize(['admin']), deletePublisher);

module.exports = router;