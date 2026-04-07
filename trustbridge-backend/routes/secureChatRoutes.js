const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getConversation,
  getConversations,
  reportMessage,
  getVerifiedResidents,
  searchUsers,
  getUnreadCount
} = require('../controllers/secureChatController');

// All routes require authentication
router.use(protect);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// Send message
router.post('/send', sendMessage);

// Get all conversations
router.get('/conversations', getConversations);

// Get conversation with specific user
router.get('/conversation/:userId', getConversation);

// Report message
router.post('/report/:messageId', reportMessage);

// Get verified residents for chat
router.get('/residents', getVerifiedResidents);

// Search users (verified residents only)
router.get('/search-users', searchUsers);

module.exports = router;
