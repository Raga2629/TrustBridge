const express = require('express');
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost,
  addComment,
  deleteComment,
  toggleLikeComment,
  togglePinPost,
  toggleLockPost
} = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Post routes
router.post('/posts', protect, createPost);
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostById);
router.put('/posts/:id', protect, updatePost);
router.delete('/posts/:id', protect, deletePost);
router.put('/posts/:id/like', protect, toggleLikePost);

// Admin post moderation
router.put('/posts/:id/pin', protect, authorize('ADMIN'), togglePinPost);
router.put('/posts/:id/lock', protect, authorize('ADMIN'), toggleLockPost);

// Comment routes
router.post('/posts/:id/comments', protect, addComment);
router.delete('/comments/:id', protect, deleteComment);
router.put('/comments/:id/like', protect, toggleLikeComment);

module.exports = router;
