import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/AdminServices.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch ALL services (pending + approved + rejected) for admin
      const { data } = await axios.get('/admin/all-services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      // Fallback: fetch pending + public services
      try {
        const token = localStorage.getItem('token');
        const [pendingRes, publicRes] = await Promise.all([
          axios.get('/services/admin/pending', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          axios.get('/services', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
        ]);
        const combined = [...pendingRes.data, ...publicRes.data];
        // Deduplicate by _id
        const unique = combined.filter((s, i, arr) => arr.findIndex(x => x._id === s._id) === i);
        setServices(unique);
      } catch (e) {
        setServices([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (serviceId) => {
    setActionLoading(serviceId + '_approve');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/services/${serviceId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
    } catch (e) {
      alert('Failed to approve: ' + (e.response?.data?.message || e.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (serviceId) => {
    const reason = prompt('Reason for rejection (shown to provider):');
    if (!reason) return;
    setActionLoading(serviceId + '_reject');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/services/${serviceId}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
    } catch (e) {
      alert('Failed to reject: ' + (e.response?.data?.message || e.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Permanently delete this service?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
    } catch (e) {
      alert('Failed to delete: ' + (e.response?.data?.message || e.message));
    }
  };

  const getStatusColor = (s) => {
    if (s.approvalStatus === 'approved' || s.verified) return '#10b981';
    if (s.approvalStatus === 'rejected') return '#ef4444';
    return '#f59e0b';
  };

  const getStatusLabel = (s) => {
    if (s.approvalStatus === 'approved' || s.verified) return '✅ Approved';
    if (s.approvalStatus === 'rejected') return '❌ Rejected';
    return '⏳ Pending Review';
  };

  const filtered = services.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'ALL') return matchSearch;
    if (filter === 'PENDING') return matchSearch && (s.approvalStatus === 'pending' || (!s.approvalStatus && !s.verified));
    if (filter === 'APPROVED') return matchSearch && (s.approvalStatus === 'approved' || s.verified);
    if (filter === 'REJECTED') return matchSearch && s.approvalStatus === 'rejected';
    return matchSearch;
  });

  const counts = {
    ALL: services.length,
    PENDING: services.filter(s => s.approvalStatus === 'pending' || (!s.approvalStatus && !s.verified)).length,
    APPROVED: services.filter(s => s.approvalStatus === 'approved' || s.verified).length,
    REJECTED: services.filter(s => s.approvalStatus === 'rejected').length,
  };

  if (loading) return (
    <div className="admin-services-page">
      <div className="loading-container"><div className="spinner"></div><p>Loading services...</p></div>
    </div>
  );

  return (
    <div className="admin-services-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>← Back</button>
            <div className="header-text">
              <h1>🏪 All Services</h1>
              <p>Review, approve or reject service listings</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-badge"><span className="stat-number">{counts.ALL}</span><span className="stat-label">Total</span></div>
            <div className="stat-badge" style={{background:'#fef3c7'}}><span className="stat-number" style={{color:'#d97706'}}>{counts.PENDING}</span><span className="stat-label">Pending</span></div>
            <div className="stat-badge verified"><span className="stat-number">{counts.APPROVED}</span><span className="stat-label">Approved</span></div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search by name, category, provider..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} className="search-input" />
          </div>
          <div className="filter-tabs">
            {['ALL','PENDING','APPROVED','REJECTED'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}
                style={f === 'PENDING' && counts.PENDING > 0 ? {background:'#f59e0b', color:'white'} : {}}>
                {f} ({counts[f]})
              </button>
            ))}
          </div>
        </div>

        {/* Services List */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <h3>No {filter.toLowerCase()} services</h3>
            <p>{searchTerm ? 'Try adjusting your search' : 'Services will appear here when providers add them'}</p>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
            {filtered.map(service => (
              <div key={service._id} style={{
                background:'white', borderRadius:'12px', padding:'20px',
                boxShadow:'0 1px 4px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getStatusColor(service)}`
              }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px'}}>
                  {/* Left: Service Info */}
                  <div style={{flex:1, minWidth:'250px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px'}}>
                      <h3 style={{margin:0, fontSize:'18px'}}>{service.name}</h3>
                      <span style={{
                        background: getStatusColor(service), color:'white',
                        padding:'2px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'600'
                      }}>{getStatusLabel(service)}</span>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 16px', fontSize:'13px', color:'#555'}}>
                      <span>📂 {service.category}</span>
                      <span>📍 {service.area}, {service.city}</span>
                      <span>👤 Provider: <strong>{service.provider?.name || 'Unknown'}</strong></span>
                      <span>📧 {service.provider?.email || '-'}</span>
                      <span>📞 {service.contactPhone}</span>
                      <span>📅 {new Date(service.createdAt).toLocaleDateString()}</span>
                    </div>
                    {service.description && (
                      <p style={{margin:'8px 0 0', fontSize:'13px', color:'#666', lineHeight:'1.4'}}>
                        {service.description.slice(0, 150)}{service.description.length > 150 ? '...' : ''}
                      </p>
                    )}
                    {/* AI Image Check Result */}
                    {service.imageVerificationNote && (
                      <div style={{
                        marginTop:'8px', padding:'6px 10px', borderRadius:'6px', fontSize:'12px',
                        background: service.imageVerificationNote.startsWith('✅') ? '#f0fdf4' : '#fffbeb',
                        border: `1px solid ${service.imageVerificationNote.startsWith('✅') ? '#86efac' : '#fde68a'}`
                      }}>
                        🤖 AI Check: {service.imageVerificationNote}
                      </div>
                    )}
                  </div>

                  {/* Right: Images + Actions */}
                  <div style={{display:'flex', flexDirection:'column', gap:'10px', alignItems:'flex-end'}}>
                    {/* Service Image */}
                    {service.serviceImageUrl && (
                      <a href={`${API_BASE}/${service.serviceImageUrl}`} target="_blank" rel="noreferrer">
                        <img src={`${API_BASE}/${service.serviceImageUrl}`} alt="Service"
                          style={{width:'120px', height:'80px', objectFit:'cover', borderRadius:'8px', border:'1px solid #e5e7eb'}}
                          onError={e => { e.target.style.display='none'; }} />
                      </a>
                    )}
                    {/* Business Proof */}
                    {service.businessProofUrl && (
                      <a href={`${API_BASE}/${service.businessProofUrl}`} target="_blank" rel="noreferrer"
                        style={{fontSize:'12px', color:'#2563eb', textDecoration:'underline'}}>
                        📄 View Business Proof
                      </a>
                    )}

                    {/* Action Buttons */}
                    <div style={{display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'flex-end'}}>
                      {(service.approvalStatus === 'pending' || (!service.approvalStatus && !service.verified)) && (
                        <>
                          <button onClick={() => handleApprove(service._id)}
                            disabled={actionLoading === service._id + '_approve'}
                            style={{background:'#10b981', color:'white', border:'none', padding:'7px 14px', borderRadius:'6px', cursor:'pointer', fontWeight:'600', fontSize:'13px'}}>
                            {actionLoading === service._id + '_approve' ? '...' : '✅ Approve'}
                          </button>
                          <button onClick={() => handleReject(service._id)}
                            disabled={actionLoading === service._id + '_reject'}
                            style={{background:'#ef4444', color:'white', border:'none', padding:'7px 14px', borderRadius:'6px', cursor:'pointer', fontWeight:'600', fontSize:'13px'}}>
                            {actionLoading === service._id + '_reject' ? '...' : '❌ Reject'}
                          </button>
                        </>
                      )}
                      {(service.approvalStatus === 'approved' || service.verified) && (
                        <button onClick={() => handleReject(service._id)}
                          style={{background:'#f59e0b', color:'white', border:'none', padding:'7px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px'}}>
                          ⚠️ Suspend
                        </button>
                      )}
                      <button onClick={() => navigate(`/services/${service._id}`)}
                        style={{background:'#6b7280', color:'white', border:'none', padding:'7px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px'}}>
                        👁️ View
                      </button>
                      <button onClick={() => handleDelete(service._id)}
                        style={{background:'#dc2626', color:'white', border:'none', padding:'7px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px'}}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminServices;
