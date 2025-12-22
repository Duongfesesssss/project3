const express = require('express');
const { createThread, listThreads, getMessages } = require('../controllers/supportController');

const router = express.Router();

router.post('/threads', createThread);
router.get('/threads', listThreads);
router.get('/threads/:id/messages', getMessages);

module.exports = router;
