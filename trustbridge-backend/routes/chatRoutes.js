const express = require('express');
const {
  startChat,
  sendMessage,
  getUserChats,
  getLocalChats,
  resolveChat
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/start', protect, authorize('USER'), startChat);
router.post('/message', protect, sendMessage);
router.get('/user', protect, authorize('USER'), getUserChats);
router.get('/local', protect, authorize('LOCAL'), getLocalChats);
router.put('/:id/resolve', protect, resolveChat);

module.exports = router;
