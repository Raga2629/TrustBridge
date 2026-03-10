import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import '../styles/BookingSuccess.css';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { service, bookingData } = location.state || {};

  useEffect(() => {
    if (!service || !bookingData) {
      navigate('/services');
    }
  }, [service, bookingData, navigate]);

  if (!service || !bookingData) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="booking-success-page">
      <div className="success-container">
        {/* Success Icon */}
        <div className="success-icon">
          <div className="checkmark-circle">
            <svg className="checkmark" viewBox="0 0 52 52">
              <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="success-title">Booking Confirmed!</h1>
        <p className="success-subtitle">Your appointment has been successfully scheduled</p>

        {/* Booking Details Card */}
        <div className="booking-details-card">
          <h3 className="card-title">Appointment Details</h3>
          
          <div className="detail-row">
            <span className="detail-label">Service</span>
            <span className="detail-value">{service.name}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span className="detail-value">{formatDate(bookingData.bookingDate)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Time</span>
            <span className="detail-value">{formatTime(bookingData.bookingTime)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Location</span>
            <span className="detail-value">{service.area}, {service.city}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Contact</span>
            <span className="detail-value">{service.contactPhone}</span>
          </div>

          <div className="status-badge-success">
            ✓ Confirmed
          </div>
        </div>

        {/* Action Buttons */}
        <div className="success-actions">
          <Link to="/my-bookings" className="btn-primary-action">
            View My Bookings
          </Link>
          <Link to="/dashboard" className="btn-secondary-action">
            Back to Dashboard
          </Link>
        </div>

        {/* Additional Info */}
        <div className="success-note">
          <p>📧 A confirmation email has been sent to your registered email address</p>
          <p>📱 You can manage your bookings from the "My Bookings" section</p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
