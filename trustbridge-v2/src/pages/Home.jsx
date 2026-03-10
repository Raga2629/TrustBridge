import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      {/* Netflix-Style Splash Hero */}
      <section className="splash-hero">
        <div className="splash-overlay"></div>
        <div className="splash-content">
          <h1 className="splash-title">TRUSTBRIDGE</h1>
          <p className="splash-subtitle">A TRUSTED LOCAL ASSISTANCE PLATFORM</p>
          <div className="splash-buttons">
            {!isAuthenticated ? (
              <>
                <Link to="/role-selection" className="btn-splash-primary">Get Started</Link>
                <Link to="/login" className="btn-splash-secondary">Login</Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn-splash-primary">Go to Dashboard</Link>
            )}
          </div>
        </div>
      </section>

      <section className="why-choose" id="about">
        <div className="container">
          <h2>Why Choose TrustBridge?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Verified Users</h3>
              <p>All service providers and local residents are thoroughly verified for your safety</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Trust Score System</h3>
              <p>Transparent rating system based on reviews, verification, and community feedback</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Local Guidance</h3>
              <p>Connect with verified local residents who understand your needs</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Safe & Secure</h3>
              <p>Advanced security measures and admin moderation for your protection</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Location-Based</h3>
              <p>Find services and help near you with smart location detection</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Easy to Use</h3>
              <p>Simple, intuitive interface designed for newcomers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="reviews-section">
        <div className="container">
          <h2>What Our Users Say</h2>
          <div className="reviews-grid">
            <div className="review-card">
              <div className="review-stars">⭐⭐⭐⭐⭐</div>
              <p>"TrustBridge made my relocation so much easier. Found everything I needed in one place!"</p>
              <div className="review-author">- Sarah M., Newcomer</div>
            </div>
            <div className="review-card">
              <div className="review-stars">⭐⭐⭐⭐⭐</div>
              <p>"As a service provider, this platform helped me reach genuine customers. Highly recommended!"</p>
              <div className="review-author">- Raj K., Service Provider</div>
            </div>
            <div className="review-card">
              <div className="review-stars">⭐⭐⭐⭐⭐</div>
              <p>"Love helping newcomers settle in. TrustBridge makes it easy to connect and assist."</p>
              <div className="review-author">- Maria L., Local Resident</div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <h2>About TrustBridge</h2>
          <div className="about-content">
            <p>
              TrustBridge is a comprehensive platform designed to help newcomers settle into their new city 
              with confidence. We connect you with verified local residents and trusted service providers, 
              making your transition smooth and stress-free.
            </p>
            <p>
              Whether you need medical services, home repairs, educational guidance, or just local advice, 
              TrustBridge is your one-stop solution for all local assistance needs.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>TrustBridge</h3>
              <p>Your trusted local assistance platform</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <Link to="/services">Services</Link>
              <Link to="/role-selection">Sign Up</Link>
              <Link to="/login">Login</Link>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Email: support@trustbridge.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 TrustBridge. All rights reserved.</p>
            <Link to="/admin/login" className="admin-link">🛡️ Admin Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
