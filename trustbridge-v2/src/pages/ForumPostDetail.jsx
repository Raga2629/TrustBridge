import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/CommunityForum.css';

const ForumPostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  const fetchPostDetails = async () => {
    try {
      const { data } = await axios.get(`/forum/posts/${id}`);
      setPost(data.post);
      setComments(data.comments);
    } catch (err) {
      console.error('Failed to load post:', err);
      alert('Post not found');
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async () => {
    try {
      await axios.put(`/forum/posts/${id}/like`);
      fetchPostDetails();
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      await axios.post(`/forum/posts/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchPostDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await axios.put(`/forum/comments/${commentId}/like`);
      fetchPostDetails();
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await axios.delete(`/forum/comments/${commentId}`);
      fetchPostDetails();
      alert('Comment deleted successfully');
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`/forum/posts/${id}`);
      alert('Post deleted successfully');
      navigate('/forum');
    } catch (err) {
      alert('Failed to delete post');
    }
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
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="empty-state">
        <p>Post not found</p>
        <button onClick={() => navigate('/forum')} className="btn-back">
          Back to Forum
        </button>
      </div>
    );
  }

  return (
    <div className="forum-post-detail">
      <button className="btn-back" onClick={() => navigate('/forum')}>
        ← Back to Forum
      </button>

      {/* Post Content */}
      <div className="post-detail-card">
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

        <h1 className="post-title">{post.title}</h1>

        <div className="post-author-section">
          <div className="author-avatar large">
            {post.author?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="author-details">
            <span className="author-name">{post.author?.name}</span>
            <span className="author-meta">
              Trust Score: {post.author?.trustScore} • Posted on {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="post-content">
          {post.content}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="post-actions-bar">
          <button 
            className={`action-btn ${post.likes?.includes(user?._id) ? 'liked' : ''}`}
            onClick={handleLikePost}
          >
            👍 {post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}
          </button>
          <span className="action-btn disabled">
            💬 {post.commentsCount} {post.commentsCount === 1 ? 'Comment' : 'Comments'}
          </span>
          {(post.author?._id === user?._id || user?.role === 'ADMIN') && (
            <button className="action-btn delete" onClick={handleDeletePost}>
              🗑️ Delete Post
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h2>Comments ({comments.length})</h2>

        {/* Add Comment Form */}
        {!post.isLocked ? (
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={4}
              required
            />
            <button type="submit" className="btn-submit">
              Post Comment
            </button>
          </form>
        ) : (
          <div className="locked-message">
            🔒 This post is locked. No new comments can be added.
          </div>
        )}

        {/* Comments List */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="empty-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment._id} className="comment-card">
                <div className="comment-header">
                  <div className="comment-author">
                    <div className="author-avatar small">
                      {comment.author?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="author-info">
                      <span className="author-name">{comment.author?.name}</span>
                      <span className="comment-time">
                        {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                        {new Date(comment.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {(comment.author?._id === user?._id || user?.role === 'ADMIN') && (
                    <button 
                      className="btn-delete-comment" 
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <p className="comment-content">{comment.content}</p>

                <div className="comment-actions">
                  <button 
                    className={`like-btn ${comment.likes?.includes(user?._id) ? 'liked' : ''}`}
                    onClick={() => handleLikeComment(comment._id)}
                  >
                    👍 {comment.likesCount}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumPostDetail;
