const express = require('express');
const { getAllBooks, getAllGenres } = require('../controllers/bookController');
const router = express.Router();

// Route lấy tất cả sách
router.get('/', getAllBooks);

// Route lấy sách theo thể loại
router.get('/genres', getAllGenres);

module.exports = router;
