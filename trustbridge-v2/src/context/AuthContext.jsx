import { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔄 Sending login request to backend...');
      const { data } = await axios.post('/auth/login', { email, password });
      console.log('📦 Backend response:', data);
      
      // Backend returns user data directly, not nested under data.user
      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        city: data.city,
        area: data.area, // NEW: Store area from resident
        location: data.location,
        isVerified: data.isVerified,
        trustScore: data.trustScore,
        verificationStatus: data.verificationStatus
      };
      
      console.log('💾 Storing user data:', userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state synchronously
      setUser(userData);
      
      console.log('✅ Login complete, user state updated');
      
      // Return userData for immediate use
      return userData;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/auth/register', userData);
      
      // Backend returns user data directly with token
      const userInfo = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        isVerified: data.isVerified,
        trustScore: data.trustScore
      };
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
      return userInfo;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    // Store the role before clearing
    const currentRole = user?.role;
    
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear any other cached data
    localStorage.removeItem('location');
    localStorage.removeItem('verificationStatus');
    
    // Reset state
    setUser(null);
    
    // Redirect based on role
    if (currentRole === 'ADMIN') {
      window.location.href = '/admin/login';
    } else {
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
