import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '3rem', color: '#f44336' }}>403</h1>
      <h2>Unauthorized Access</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        You don't have permission to access this page.
      </p>
      <Link to="/" style={{ 
        padding: '0.75rem 1.5rem', 
        background: '#667eea', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '6px' 
      }}>
        Go Home
      </Link>
    </div>
  );
};

export default Unauthorized;
