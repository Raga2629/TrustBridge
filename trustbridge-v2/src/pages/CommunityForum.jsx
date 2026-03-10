import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/CommunityForum.css';

const CommunityForum = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General',
    tags: ''
  });

  const categories = ['All', 'General', 'LocalTips', 'Events', 'Safety', 'Recommendations', 'Questions'];

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, sortBy, searchQuery]);

  const fetchPosts = async () => {
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (sortBy) params.sortBy = sortBy;
      if (searchQuery) params.search = searchQuery;

      const { data } = await axios.get('/forum/posts', { params });
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!newPost.title || !newPost.title.trim()) {
      alert('Title is required');
      return;
    }

    if (!newPost.content || !newPost.content.trim()) {
      alert('Content is required');
      return;
    }

    try {
      const postData = {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category,
        tags: newPost.tags ? newPost.tags.split(',').map(t => t.trim()).filter(t => t) : []
      };

      await axios.post('/forum/posts', postData);
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', category: 'General', tags: '' });
      fetchPosts();
      alert('Post created successfully!');
    } catch (err) {
      console.error('Create post error:', err);
      alert(err.response?.data?.message || 'Failed to create post');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await axios.put(`/forum/posts/${postId}/like`);
      fetchPosts();
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`/forum/posts/${postId}`);
      fetchPosts();
      alert('Post deleted successfully');
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const handleViewPost = (postId) => {
    navigate(`/forum/posts/${postId}`);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      General: '💬',
      LocalTips: '💡',
      Events: '📅',
      Safety: '🛡️',
      Recommendations: '⭐',
      Questions: '❓'
    };
    return icons[category] || '💬';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading forum...</p>
      </div>
    );
  }

  return (
    <div className="community-forum">
      {/* Header */}
      <div className="forum-header">
        <div>
          <h1>Community Forum 💬</h1>
          <p className="forum-subtitle">Connect, share, and learn from the community</p>
        </div>
        <button className="btn-create-post" onClick={() => setShowCreateModal(true)}>
          ➕ Create Post
        </button>
      </div>

      {/* Filters */}
      <div className="forum-filters">
        <div className="filter-section">
          <label>Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-section">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="discussed">Most Discussed</option>
          </select>
        </div>

        <div className="filter-section search-section">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>📭 No posts found</p>
            <button className="btn-create-post" onClick={() => setShowCreateModal(true)}>
              Create the first post
            </button>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <div key={post._id} className="post-card">
                {post.isPinned && (
                  <div className="pinned-badge">📌 Pinned</div>
                )}
                
                <div className="post-header">
                  <div className="post-category">
                    <span className="category-icon">{getCategoryIcon(post.category)}</span>
                    <span className="category-name">{post.category}</span>
                  </div>
                  {post.isLocked && (
                    <span className="locked-badge">🔒 Locked</span>
                  )}
                </div>

                <h3 className="post-title" onClick={() => handleViewPost(post._id)}>
                  {post.title}
                </h3>

                <p className="post-content-preview">
                  {post.content.substring(0, 200)}
                  {post.content.length > 200 && '...'}
                </p>

                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="post-footer">
                  <div className="post-author">
                    <div className="author-avatar">
                      {post.author?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="author-info">
                      <span className="author-name">{post.author?.name}</span>
                      <span className="post-time">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="post-stats">
                    <button 
                      className={`stat-btn ${post.likes?.includes(user?._id) ? 'liked' : ''}`}
                      onClick={() => handleLikePost(post._id)}
                    >
                      👍 {post.likesCount}
                    </button>
                    <button className="stat-btn" onClick={() => handleViewPost(post._id)}>
                      💬 {post.commentsCount}
                    </button>
                  </div>

                  <div className="post-actions">
                    <button 
                      className="btn-view" 
                      onClick={() => handleViewPost(post._id)}
                    >
                      View
                    </button>
                    {(post.author?._id === user?._id || user?.role === 'ADMIN') && (
                      <button 
                        className="btn-delete-small" 
                        onClick={() => handleDeletePost(post._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Post</h3>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Enter post title"
                  maxLength={200}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  required
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Write your post content..."
                  rows={8}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  placeholder="e.g. bachupally, tips, newcomers"
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityForum;
