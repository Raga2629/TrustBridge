import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getServiceImage } from '../assets/service-images/fallback-images';
import '../styles/ServiceDetail.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [bookingData, setBookingData] = useState({
    bookingDate: '',
    bookingTime: '',
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    reason: ''
  });

  useEffect(() => {
    fetchServiceDetails();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        customerName: user.name || '',
        customerPhone: user.phone || ''
      }));
    }
  }, [user]);

  const fetchServiceDetails = async () => {
    try {
      const { data } = await axios.get(`/services/${id}`);
      setService(data);
    } catch (err) {
      console.error('Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/reviews/service/${id}`);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post('/bookings', {
        serviceId: id,
        bookingDate: bookingData.bookingDate,
        bookingTime: bookingData.bookingTime
      });
      navigate('/booking-success', { state: { service, bookingData } });
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/reviews', {
        serviceId: id,
        rating: reviewData.rating,
        comment: reviewData.comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📝 Review response:', response.data);
      
      alert('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      
      // FORCE REFRESH: Always fetch fresh data after review
      console.log('🔄 Fetching fresh service data...');
      await Promise.all([
        fetchReviews(),
        fetchServiceDetails()
      ]);
      console.log('✅ Data refreshed!');
      
    } catch (err) {
      console.error('❌ Review submission error:', err);
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  const formatDistance = (distanceKm) => {
    const distance = parseFloat(distanceKm);
    if (isNaN(distance)) return null;
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)} km away`;
  };

  const getDirections = () => {
    if (service?.location?.coordinates) {
      const [lng, lat] = service.location.coordinates;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="error-container">
        <h2>Service not found</h2>
        <button onClick={() => navigate('/services')} className="btn-back">
          Back to Services
        </button>
      </div>
    );
  }

  const serviceImage = getServiceImage(service);
  const rating = service.rating || 0;
  // Calculate reviewCount dynamically - will update when service or reviews change
  const reviewCount = service.reviewCount || service.totalReviews || reviews.length || 0;
  const distance = formatDistance(service.distanceKm);

  return (
    <div className="service-detail-page">
      <div className="detail-container">
        {/* Top Section: Image and Info */}
        <div className="detail-top-section">
          {/* Left: Large Image */}
          <div className="detail-image-section">
            <img 
              src={serviceImage} 
              alt={service.name}
              className="detail-image"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop';
              }}
            />
          </div>

          {/* Right: Service Info */}
          <div className="detail-info-section">
            <h1 className="detail-title">{service.name}</h1>

            {/* Star Rating */}
            <div className="detail-rating">
              <div className="stars-large">
                {renderStars(rating)}
              </div>
              <span className="rating-number-large">{rating.toFixed(1)}</span>
              <span className="review-count-large">({reviewCount} reviews)</span>
            </div>

            {/* Category */}
            <div className="detail-meta-item">
              <span className="meta-label">Category:</span>
              <span className="category-badge-large">{service.category}</span>
            </div>

            {/* Location */}
            <div className="detail-meta-item">
              <span className="meta-label">Location:</span>
              <span className="meta-value">{service.area}, {service.city}</span>
            </div>

            {/* Distance */}
            {distance && (
              <div className="detail-meta-item">
                <span className="meta-label">Distance:</span>
                <span className="meta-value">{distance}</span>
              </div>
            )}

            {/* Working Hours */}
            {service.workingHours && (
              <div className="detail-meta-item">
                <span className="meta-label">Hours:</span>
                <span className="meta-value">{service.workingHours}</span>
              </div>
            )}

            {/* Contact */}
            {service.contactPhone && (
              <div className="detail-meta-item">
                <span className="meta-label">Contact:</span>
                <span className="meta-value">{service.contactPhone}</span>
                <a href={`tel:${service.contactPhone}`} className="btn-call-direct">
                  📞 Call Now
                </a>
              </div>
            )}

            {/* Get Directions Button */}
            <button onClick={getDirections} className="btn-directions">
              🗺️ Get Directions
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="detail-section">
          <h2 className="section-title">About</h2>
          <p className="about-text">{service.description}</p>
        </div>

        {/* Booking Section */}
        {user?.role === 'USER' && (
          <div className="detail-section booking-section">
            <h2 className="section-title">Book This Service</h2>
            <form onSubmit={handleBooking} className="booking-form-modern">
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={bookingData.bookingDate}
                    onChange={(e) => setBookingData({...bookingData, bookingDate: e.target.value})}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={bookingData.bookingTime}
                    onChange={(e) => setBookingData({...bookingData, bookingTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    value={bookingData.customerName}
                    onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={bookingData.customerPhone}
                    onChange={(e) => setBookingData({...bookingData, customerPhone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason (Optional)</label>
                <textarea
                  value={bookingData.reason}
                  onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                  rows="3"
                  placeholder="Briefly describe your requirements..."
                />
              </div>

              <button type="submit" className="btn-confirm-booking">
                Confirm Booking
              </button>
            </form>
          </div>
        )}

        {/* Reviews Section */}
        <div className="detail-section reviews-section-modern">
          <div className="reviews-header">
            <h2 className="section-title">Reviews</h2>
            {user?.role === 'USER' && (
              <button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn-add-review"
              >
                {showReviewForm ? 'Cancel' : '+ Write Review'}
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div className="form-group">
                <label>Rating</label>
                <div className="star-rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star-input ${reviewData.rating >= star ? 'active' : ''}`}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Share your experience with this service..."
                  rows="4"
                  required
                />
              </div>
              <button type="submit" className="btn-submit-review">
                Submit Review
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review._id} className="review-card-modern">
                  <div className="review-header-modern">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="reviewer-name">{review.user?.name || 'Anonymous'}</div>
                        <div className="review-time">{getTimeAgo(review.createdAt)}</div>
                      </div>
                    </div>
                    <div className="review-stars">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="review-text">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
