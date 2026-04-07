import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutModal from './LogoutModal';
import NotificationDropdown from './NotificationDropdown';
import axios from '../api/axios';
import '../components/layout/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Fetch unread notification count
  useEffect(() => {
    if (user) {
      console.log('🔔 Notification system initialized for:', user.role);
      fetchUnreadCount();
      
      // Poll for new notifications every 10 seconds
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/notifications/unread-count');
      const count = response.data.unreadCount || 0;
      console.log('🔔 Unread notifications:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ Failed to fetch unread count:', error);
      // Don't show error to user, just log it
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Get user initial for avatar
  const getUserInitial = () => {
    if (!user?.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  // Get role-based navigation items
  const getNavigationItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'USER':
        return [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'My Bookings', path: '/my-bookings' },
          { label: 'Community', path: '/forum' }
        ];
      case 'LOCAL_RESIDENT':
        return [
          { label: 'Dashboard', path: '/local-resident/dashboard' },
          { label: 'Help Requests', path: '/secure-chat' },
          { label: 'Community', path: '/forum' }
        ];
      case 'PROVIDER':
        return [
          { label: 'Dashboard', path: '/provider/dashboard' },
          { label: 'My Services', path: '/provider/services' },
          { label: 'Bookings', path: '/provider/bookings' },
          { label: 'Reviews', path: '/provider/reviews' }
        ];
      case 'ADMIN':
        return [
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Users', path: '/admin/users' },
          { label: 'Services', path: '/admin/services' },
          { label: 'Complaints', path: '/admin/complaints' }
        ];
      default:
        return [];
    }
  };

  // Get dashboard path based on role
  const getDashboardPath = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'USER':
        return '/dashboard';
      case 'LOCAL_RESIDENT':
        return '/local-resident/dashboard';
      case 'PROVIDER':
        return '/provider/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  // Get role display name and color
  const getRoleInfo = () => {
    if (!user) return { name: 'User', color: '#6b7280' };

    switch (user.role) {
      case 'USER':
        return { name: 'Newcomer', color: '#0c8ce9' };
      case 'LOCAL_RESIDENT':
        return { name: 'Local Resident', color: '#10b981' };
      case 'PROVIDER':
        return { name: 'Service Provider', color: '#f59e0b' };
      case 'ADMIN':
        return { name: 'Administrator', color: '#dc2626' };
      default:
        return { name: 'User', color: '#6b7280' };
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  const navigationItems = getNavigationItems();
  const roleInfo = getRoleInfo();

  return (
    <>
      <nav className="universal-navbar">
        <div className="navbar-container">
          {/* LEFT SIDE - Logo Only */}
          <Link to={user ? getDashboardPath() : '/'} className="navbar-logo-link">
            <div className="navbar-logo">
              <img 
                src="/assets/logo.png" 
                alt="TrustBridge" 
                className="logo-image"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <span className="logo-text" style={{ display: 'none' }}>TrustBridge</span>
            </div>
          </Link>

          {/* RIGHT SIDE - All Navigation */}
          <div className="navbar-right">
            {user ? (
              <>
                {/* Desktop Menu */}
                <div className="navbar-menu-desktop">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Notification Bell - For all logged-in users */}
                {user && (
                  <div className="notification-bell-wrapper">
                    <button 
                      className="notification-bell"
                      onClick={() => setShowNotifications(!showNotifications)}
                      title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                      )}
                    </button>

                    <NotificationDropdown
                      isOpen={showNotifications}
                      onClose={() => setShowNotifications(false)}
                      unreadCount={unreadCount}
                      onUpdateCount={fetchUnreadCount}
                    />
                  </div>
                )}

                {/* Profile Dropdown */}
                <div className="profile-dropdown-wrapper" ref={dropdownRef}>
                  <div
                    className="profile-trigger"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span className="profile-name">{user.name}</span>
                    <svg
                      className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {showDropdown && (
                    <div className="profile-dropdown-menu">
                      <div className="dropdown-header">
                        <div className="dropdown-avatar">{getUserInitial()}</div>
                        <div className="dropdown-user-info">
                          <div className="dropdown-user-name">{user.name}</div>
                          <span
                            className="dropdown-user-role"
                            style={{ background: roleInfo.color }}
                          >
                            {roleInfo.name}
                          </span>
                        </div>
                      </div>
                  <div className="dropdown-divider"></div>
                  <Link
                    to="/profile"
                    className="dropdown-menu-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z"
                        fill="currentColor"
                      />
                    </svg>
                    Profile
                  </Link>
                  <button className="dropdown-menu-item logout" onClick={handleLogout}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 14H2C1.46957 14 0.960859 13.7893 0.585786 13.4142C0.210714 13.0391 0 12.5304 0 12V4C0 3.46957 0.210714 2.96086 0.585786 2.58579C0.960859 2.21071 1.46957 2 2 2H6M11 11L14 8M14 8L11 5M14 8H6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {showMobileMenu ? (
                  <path
                    d="M6 18L18 6M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="M3 12H21M3 6H21M3 18H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </button>
              </>
            ) : (
              <>
                {/* Public Navigation - Not Logged In */}
                <div className="navbar-menu-desktop">
                  <Link to="/login" className="nav-menu-item">
                    Login
                  </Link>
                  <Link to="/role-selection" className="nav-menu-item" style={{ 
                    background: '#0c8ce9', 
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {showMobileMenu && user && (
        <>
          <div
            className="mobile-overlay"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          <div className="mobile-drawer">
            <div className="mobile-drawer-header">
              <div className="mobile-user-info">
                <div className="mobile-avatar">{getUserInitial()}</div>
                <div>
                  <div className="mobile-user-name">{user.name}</div>
                  <span
                    className="mobile-user-role"
                    style={{ background: roleInfo.color }}
                  >
                    {roleInfo.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="mobile-menu-items">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-menu-item ${
                    location.pathname === item.path ? 'active' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mobile-menu-divider"></div>
              <Link to="/profile" className="mobile-menu-item">
                Profile
              </Link>
              <button className="mobile-menu-item logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default Navbar;
