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

// Routes cho admin
router.get('/', getAllPublishers);
router.post('/datatable', getPublisherDatatable);
router.get('/:id', getPublisherById);
router.post('/', createPublisher);
router.put('/', updatePublisher);
router.delete('/', deletePublisher);

module.exports = router;