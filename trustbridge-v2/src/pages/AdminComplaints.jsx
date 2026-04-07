import { useState, useEffect } from 'react';
import axios from '../api/axios';
import '../styles/AdminDashboard.css';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/admin/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Manage Complaints</h1>
        <p>View and resolve user complaints</p>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No complaints found</h3>
          <p>User complaints will appear here</p>
        </div>
      ) : (
        <div className="complaints-list">
          {complaints.map(complaint => (
            <div key={complaint._id} className="complaint-card">
              <h3>{complaint.title}</h3>
              <p>{complaint.description}</p>
              <p>Status: {complaint.status}</p>
              <p>From: {complaint.user?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
