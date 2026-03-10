const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');

// @desc    Create new forum post
// @route   POST /api/forum/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await ForumPost.create({
      title,
      content,
      category: category || 'General',
      tags: tags || [],
      author: req.user._id
    });

    const populatedPost = await ForumPost.findById(post._id)
      .populate('author', 'name email trustScore');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all forum posts with filtering
// @route   GET /api/forum/posts
// @access  Public
const getAllPosts = async (req, res) => {
  try {
    const { category, search, sortBy = 'recent' } = req.query;

    let query = {};

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search in title, content, and tags
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    let sortOption = {};
    switch (sortBy) {
      case 'popular':
        sortOption = { likesCount: -1, createdAt: -1 };
        break;
      case 'discussed':
        sortOption = { commentsCount: -1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortOption = { isPinned: -1, createdAt: -1 };
    }

    const posts = await ForumPost.find(query)
      .populate('author', 'name email trustScore')
      .sort(sortOption)
      .limit(50);

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single post with comments
// @route   GET /api/forum/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name email trustScore');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await ForumComment.find({ post: req.params.id })
      .populate('author', 'name email trustScore')
      .sort('createdAt');

    res.json({ post, comments });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update post
// @route   PUT /api/forum/posts/:id
// @access  Private (Author only)
const updatePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { title, content, category, tags } = req.body;

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags) post.tags = tags;

    await post.save();

    const updatedPost = await ForumPost.findById(post._id)
      .populate('author', 'name email trustScore');

    res.json(updatedPost);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/forum/posts/:id
// @access  Private (Author or ADMIN)
const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is author or admin
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete all comments for this post
    await ForumComment.deleteMany({ post: req.params.id });

    await ForumPost.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post and associated comments deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Like/Unlike post
// @route   PUT /api/forum/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.json({ 
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      likesCount: post.likesCount,
      isLiked: likeIndex === -1
    });
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
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.isLocked) {
      return res.status(403).json({ message: 'This post is locked and cannot accept new comments' });
    }

    const comment = await ForumComment.create({
      post: req.params.id,
      author: req.user._id,
      content
    });

    // Update post comments count
    post.commentsCount += 1;
    await post.save();

    const populatedComment = await ForumComment.findById(comment._id)
      .populate('author', 'name email trustScore');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/forum/comments/:id
// @access  Private (Author or ADMIN)
const deleteComment = async (req, res) => {
  try {
    const comment = await ForumComment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is author or admin
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    const postId = comment.post;
    await ForumComment.findByIdAndDelete(req.params.id);

    // Update post comments count
    const post = await ForumPost.findById(postId);
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Like/Unlike comment
// @route   PUT /api/forum/comments/:id/like
// @access  Private
const toggleLikeComment = async (req, res) => {
  try {
    const comment = await ForumComment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = req.user._id;
    const likeIndex = comment.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({ 
      message: likeIndex > -1 ? 'Comment unliked' : 'Comment liked',
      likesCount: comment.likesCount,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Toggle like comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Pin/Unpin post (ADMIN only)
// @route   PUT /api/forum/posts/:id/pin
// @access  Private (ADMIN)
const togglePinPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({ 
      message: post.isPinned ? 'Post pinned' : 'Post unpinned',
      isPinned: post.isPinned
    });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Lock/Unlock post (ADMIN only)
// @route   PUT /api/forum/posts/:id/lock
// @access  Private (ADMIN)
const toggleLockPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isLocked = !post.isLocked;
    await post.save();

    res.json({ 
      message: post.isLocked ? 'Post locked' : 'Post unlocked',
      isLocked: post.isLocked
    });
  } catch (error) {
    console.error('Toggle lock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
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
};
