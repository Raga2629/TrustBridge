import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import '../styles/ProviderDashboard.css';

const ProviderReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/reviews/provider', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="provider-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      <div className="dashboard-header">
        <h1>My Reviews</h1>
        <p>See what customers are saying</p>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <h3>No reviews yet</h3>
          <p>Customer reviews will appear here</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <strong>{review.user?.name}</strong>
                <span className="rating">{'⭐'.repeat(review.rating)}</span>
              </div>
              <p>{review.comment}</p>
              <small>{new Date(review.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderReviews;
