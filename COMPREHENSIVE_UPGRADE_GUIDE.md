# TrustBridge Comprehensive Upgrade Guide

## Overview
This document provides step-by-step implementation for all requested features.

---

## ✅ COMPLETED

### Part 1: Service Card Updates
- ✅ Removed price display
- ✅ Added working hours display
- ✅ Added Open/Closed status (auto-calculated)
- ✅ Added contact phone number
- ✅ Kept star rating, distance, verified badge
- ✅ View Details and Map buttons

**Files Modified:**
- `trustbridge-v2/src/components/ServiceCard.jsx`
- `trustbridge-v2/src/styles/ServiceCard.css`

---

## 🔄 TO IMPLEMENT

### Part 2: Google Places API Integration

#### Step 1: Add Google Places API Key
1. Get API key from Google Cloud Console
2. Enable Places API
3. Add to `.env`:
```env
GOOGLE_PLACES_API_KEY=your_api_key_here
```

#### Step 2: Update Service Model
```javascript
// trustbridge-backend/models/Service.js
// Add these fields:
placeId: {
  type: String,
  trim: true
},
googlePhotoReference: {
  type: String,
  trim: true
}
```

#### Step 3: Create Google Places Utility
```javascript
// trustbridge-backend/utils/googlePlaces.js
const axios = require('axios');

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

const getPlaceDetails = async (placeId) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: placeId,
          fields: 'photos,name,formatted_address,formatted_phone_number',
          key: GOOGLE_API_KEY
        }
      }
    );
    return response.data.result;
  } catch (error) {
    console.error('Google Places API error:', error);
    return null;
  }
};

const getPhotoUrl = (photoReference, maxWidth = 800) => {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
};

module.exports = { getPlaceDetails, getPhotoUrl };
```

#### Step 4: Update Service Controller
```javascript
// In serviceController.js - createService function
const { getPlaceDetails, getPhotoUrl } = require('../utils/googlePlaces');

// After creating service:
if (placeId) {
  const placeDetails = await getPlaceDetails(placeId);
  if (placeDetails && placeDetails.photos && placeDetails.photos.length > 0) {
    const photoReference = placeDetails.photos[0].photo_reference;
    service.googlePhotoReference = photoReference;
    service.image = getPhotoUrl(photoReference);
    await service.save();
  }
}
```

---

### Part 3: Enhanced Service Detail Page with Reviews

#### Step 1: Create Review Model
```javascript
// trustbridge-backend/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate reviews
reviewSchema.index({ service: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
```

#### Step 2: Create Review Controller
```javascript
// trustbridge-backend/controllers/reviewController.js
const Review = require('../models/Review');
const Service = require('../models/Service');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { serviceId, rating, comment } = req.body;

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      service: serviceId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this service' });
    }

    // Create review
    const review = await Review.create({
      service: serviceId,
      user: req.user._id,
      rating,
      comment
    });

    // Update service rating
    const reviews = await Review.find({ service: serviceId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Service.findByIdAndUpdate(serviceId, {
      rating: avgRating,
      totalReviews: reviews.length
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name');
    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews for service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
const getServiceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('user', 'name')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createReview, getServiceReviews };
```

#### Step 3: Create Review Routes
```javascript
// trustbridge-backend/routes/reviewRoutes.js
const express = require('express');
const { createReview, getServiceReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createReview);
router.get('/service/:serviceId', getServiceReviews);

module.exports = router;
```

#### Step 4: Add to server.js
```javascript
// In server.js
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);
```

#### Step 5: Update ServiceDetail.jsx
Add review form and submission logic (see detailed implementation below).

---

### Part 4: Direct Call Button

Already implemented in ServiceDetail page:
```jsx
{service.contactPhone && (
  <a href={`tel:${service.contactPhone}`} className="btn-call">
    📞 Call Now
  </a>
)}
```

---

### Part 5 & 6: Community Forum System

#### Step 1: Create Forum Post Model
```javascript
// trustbridge-backend/models/ForumPost.js
const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likesCount: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ForumPost', forumPostSchema);
```

#### Step 2: Create Forum Comment Model
```javascript
// trustbridge-backend/models/ForumComment.js
const mongoose = require('mongoose');

const forumCommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ForumComment', forumCommentSchema);
```

#### Step 3: Create Forum Controller
```javascript
// trustbridge-backend/controllers/forumController.js
const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');

// @desc    Create forum post
// @route   POST /api/forum/posts
// @access  Private (USER role only)
const createPost = async (req, res) => {
  try {
    // Check if user is USER role
    if (req.user.role !== 'USER') {
      return res.status(403).json({ message: 'Only newcomers can create posts' });
    }

    const { title, description } = req.body;

    const post = await ForumPost.create({
      title,
      description,
      createdBy: req.user._id
    });

    const populatedPost = await ForumPost.findById(post._id).populate('createdBy', 'name');
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all forum posts
// @route   GET /api/forum/posts
// @access  Public
const getAllPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single post
// @route   GET /api/forum/posts/:id
// @access  Public
const getPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate('createdBy', 'name');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/forum/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      post.likesCount = post.likes.length;
    } else {
      // Like
      post.likes.push(req.user._id);
      post.likesCount = post.likes.length;
    }

    await post.save();
    res.json({ likesCount: post.likesCount, liked: likeIndex === -1 });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add comment to post
// @route   POST /api/forum/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    const newComment = await ForumComment.create({
      post: req.params.id,
      user: req.user._id,
      comment
    });

    // Update comments count
    await ForumPost.findByIdAndUpdate(req.params.id, {
      $inc: { commentsCount: 1 }
    });

    const populatedComment = await ForumComment.findById(newComment._id).populate('user', 'name');
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get comments for post
// @route   GET /api/forum/posts/:id/comments
// @access  Public
const getComments = async (req, res) => {
  try {
    const comments = await ForumComment.find({ post: req.params.id })
      .populate('user', 'name')
      .sort('-createdAt');
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPost,
  toggleLike,
  addComment,
  getComments
};
```

#### Step 4: Create Forum Routes
```javascript
// trustbridge-backend/routes/forumRoutes.js
const express = require('express');
const {
  createPost,
  getAllPosts,
  getPost,
  toggleLike,
  addComment,
  getComments
} = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/posts', protect, createPost);
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPost);
router.post('/posts/:id/like', protect, toggleLike);
router.post('/posts/:id/comments', protect, addComment);
router.get('/posts/:id/comments', getComments);

module.exports = router;
```

#### Step 5: Add to server.js
```javascript
const forumRoutes = require('./routes/forumRoutes');
app.use('/api/forum', forumRoutes);
```

---

## Frontend Implementation

### Community Forum Page
```jsx
// trustbridge-v2/src/pages/CommunityForum.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Forum.css';

const CommunityForum = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get('/forum/posts');
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/forum/posts', newPost);
      setShowCreateModal(false);
      setNewPost({ title: '', description: '' });
      fetchPosts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create post');
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  if (loading) return <div className="loading">Loading forum...</div>;

  return (
    <div className="forum-page">
      <div className="forum-container">
        <div className="forum-header">
          <h1>Community Forum</h1>
          <p>Ask questions and get help from locals</p>
        </div>

        <div className="posts-list">
          {posts.length === 0 ? (
            <div className="no-posts">
              <p>No posts yet. Be the first to ask a question!</p>
            </div>
          ) : (
            posts.map(post => (
              <Link key={post._id} to={`/forum/${post._id}`} className="post-card">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-preview">{post.description.substring(0, 150)}...</p>
                <div className="post-meta">
                  <span className="post-author">{post.createdBy?.name}</span>
                  <span className="post-time">{getTimeAgo(post.createdAt)}</span>
                  <div className="post-stats">
                    <span>❤️ {post.likesCount}</span>
                    <span>💬 {post.commentsCount}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Floating Add Button - Only for USER role */}
        {user?.role === 'USER' && (
          <button 
            className="btn-floating-add"
            onClick={() => setShowCreateModal(true)}
            title="Create new post"
          >
            +
          </button>
        )}

        {/* Create Post Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Post</h2>
              <form onSubmit={handleCreatePost}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    required
                    placeholder="What's your question?"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newPost.description}
                    onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                    required
                    rows="6"
                    placeholder="Provide more details..."
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Post Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityForum;
```

---

## Implementation Checklist

### Backend:
- [ ] Add Google Places API key to .env
- [ ] Create Review model
- [ ] Create Review controller
- [ ] Create Review routes
- [ ] Create ForumPost model
- [ ] Create ForumComment model
- [ ] Create Forum controller
- [ ] Create Forum routes
- [ ] Add routes to server.js
- [ ] Test all endpoints

### Frontend:
- [x] Update ServiceCard component
- [ ] Update ServiceDetail page with reviews
- [ ] Create CommunityForum page
- [ ] Create ForumPostDetail page
- [ ] Add Forum.css styles
- [ ] Update App.jsx routes
- [ ] Update Navbar with Forum link
- [ ] Test all features

---

## Next Steps

1. Implement backend models and routes
2. Test API endpoints with Postman
3. Implement frontend pages
4. Test end-to-end functionality
5. Deploy and monitor

---

## Status

- ✅ Service Card Updates: COMPLETE
- 🔄 Google Places API: PENDING (requires API key)
- 🔄 Review System: PENDING (models ready)
- 🔄 Forum System: PENDING (models ready)
- 🔄 Frontend Pages: PARTIAL

This guide provides all the code needed. Implement systematically, testing each part before moving to the next.
