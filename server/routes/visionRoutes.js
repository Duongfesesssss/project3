const express = require('express');
const multer = require('multer');
const visionController = require('../controllers/visionController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('File không hợp lệ, chỉ nhận ảnh'));
  },
});

router.post('/search', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ status: 'ERROR', message: `Upload lỗi: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ status: 'ERROR', message: err.message });
    }
    return visionController.searchByCover(req, res, next);
  });
});

module.exports = router;
