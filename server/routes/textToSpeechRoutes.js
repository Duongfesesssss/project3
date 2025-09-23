const express = require('express');
const router = express.Router();
const textToSpeechController = require('../controllers/textToSpeechController');

// API tạo audio từ text (không cần auth cho demo)
router.post('/synthesize', textToSpeechController.generateAudioFromBookDescription);

// API lấy danh sách giọng đọc
router.get('/voices', textToSpeechController.getVoices);

// API kiểm tra kết nối AWS
router.get('/test', textToSpeechController.testConnection);

module.exports = router;