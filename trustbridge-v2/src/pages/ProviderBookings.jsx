import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import '../styles/ProviderDashboard.css';

const ProviderBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/bookings/provider', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="provider-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      <div className="dashboard-header">
        <h1>My Bookings</h1>
        <p>Manage your service bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No bookings yet</h3>
          <p>Your service bookings will appear here</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <h3>{booking.service?.name}</h3>
              <p>Customer: {booking.user?.name}</p>
              <p>Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
              <p>Status: {booking.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderBookings;
