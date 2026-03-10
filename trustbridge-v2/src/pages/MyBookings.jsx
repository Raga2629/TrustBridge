import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/Dashboard.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('/bookings/my');
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    
    try {
      await axios.put(`/bookings/${id}/cancel`);
      fetchBookings();
      alert('Booking cancelled');
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Bookings</h1>
        <p className="dashboard-subtitle">Manage your service bookings</p>
      </div>

      <div className="dashboard-section">
        {loading ? (
          <p className="loading">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No bookings yet</h3>
            <p>Start by browsing services and booking your first appointment</p>
            <Link to="/services" className="btn-primary">Browse Services</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.service?.name}</h3>
                  <span className={`status-badge ${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>
                <p><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {booking.bookingTime}</p>
                <p><strong>Category:</strong> {booking.service?.category}</p>
                <div className="booking-actions">
                  {booking.status === 'Pending' && (
                    <button onClick={() => handleCancelBooking(booking._id)} className="btn-cancel">
                      Cancel
                    </button>
                  )}
                  {booking.status === 'Completed' && (
                    <Link to={`/review/${booking.service._id}`} className="btn-review">
                      Leave Review
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
