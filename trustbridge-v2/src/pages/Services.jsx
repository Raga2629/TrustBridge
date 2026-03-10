import { useState, useEffect } from 'react';
import axios from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import '../styles/Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLocationSetup, setShowLocationSetup] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [city, setCity] = useState('');
  const [userLocation, setUserLocation] = useState(null); // Store selected location coordinates
  const [selectedArea, setSelectedArea] = useState(''); // Store selected area name

  // Reset to location setup screen every time component mounts
  useEffect(() => {
    setShowLocationSetup(true);
    setShowFilters(false);
    setServices([]);
    setSelectedCategories([]);
    setCity('');
    setError('');
  }, []);

  const categories = [
    { id: 'Medical', label: 'Medical', icon: '🏥' },
    { id: 'Grocery', label: 'Grocery', icon: '🛒' },
    { id: 'Education', label: 'Education', icon: '📚' },
    { id: 'HomeServices', label: 'Home Services', icon: '🏠' },
    { id: 'Shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'Beauty', label: 'Beauty', icon: '💄' },
    { id: 'Transport', label: 'Transport', icon: '🚗' },
    { id: 'Temples', label: 'Temples', icon: '🕉️' },
    { id: 'Rentals', label: 'Rentals', icon: '🏘️' },
    { id: 'Repairs', label: 'Repairs', icon: '🔧' },
    { id: 'BankATMs', label: 'Bank/ATMs', icon: '🏦' },
    { id: 'PG', label: 'PG/Hostels', icon: '🏠' },
    { id: 'Food', label: 'Food', icon: '🍕' }
  ];

  const handleLocationConfirm = () => {
    if (!city.trim()) {
      setError('Please enter your location');
      return;
    }

    // Check if city is one of the supported areas (case-insensitive)
    const normalizedCity = city.trim().toLowerCase();
    const supportedAreas = ['bachupally', 'secunderabad', 'miyapur'];
    
    if (!supportedAreas.includes(normalizedCity)) {
      setError('Sorry, we currently serve Bachupally, Secunderabad, and Miyapur areas. Please enter one of these locations.');
      return;
    }

    // Set coordinates based on area
    let locationCoords;
    let areaName;
    switch(normalizedCity) {
      case 'bachupally':
        locationCoords = { latitude: 17.4975, longitude: 78.3984 };
        areaName = 'Bachupally';
        break;
      case 'secunderabad':
        locationCoords = { latitude: 17.4399, longitude: 78.4983 };
        areaName = 'Secunderabad';
        break;
      case 'miyapur':
        locationCoords = { latitude: 17.4968, longitude: 78.3585 };
        areaName = 'Miyapur';
        break;
      default:
        locationCoords = { latitude: 17.4975, longitude: 78.3984 }; // Default to Bachupally
        areaName = 'Bachupally';
    }

    setUserLocation(locationCoords); // Store the location
    setSelectedArea(areaName); // Store the area name
    setShowLocationSetup(false);
    setShowFilters(true);
    setError('');
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleApplyFilters = async () => {
    if (selectedCategories.length === 0) {
      setError('Please select at least one category');
      return;
    }

    if (!userLocation || !selectedArea) {
      setError('Location not set. Please go back and select your location.');
      return;
    }

    setLoading(true);
    setError('');
    setShowFilters(false);

    try {
      const params = {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        categories: selectedCategories.join(','),
        area: selectedArea, // Add area filter
        maxDistance: 10000 // 10km radius
      };

      console.log('🔍 Fetching services with params:', params);

      const response = await axios.get('/services', { params });
      setServices(response.data);

      if (response.data.length === 0) {
        setError(`No services found in ${selectedArea}. Try selecting different categories.`);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setServices([]);
    setShowFilters(false);
    setShowLocationSetup(true);
    setCity('');
    setError('');
  };

  // Location Setup Screen
  if (showLocationSetup) {
    return (
      <div className="services-page">
        <div className="location-hero">
          <div className="location-icon">📍</div>
          <h1>Where are you looking for services?</h1>
          <p>Enter your location to discover trusted local services</p>
        </div>

        <div className="location-card-modern">
          {error && <div className="error-message-modern">{error}</div>}

          <div className="input-wrapper-modern">
            <input
              id="city-input"
              type="text"
              value={city}
              onChange={handleCityChange}
              placeholder="Enter your area (e.g., Bachupally, Secunderabad, Miyapur)"
              className="location-input-modern"
              autoFocus
            />
          </div>

          <button 
            onClick={handleLocationConfirm} 
            className="btn-continue-modern"
            disabled={!city.trim()}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Category Selection Screen
  if (showFilters) {
    return (
      <div className="services-page">
        <div className="services-hero">
          <h1>Find Trusted Services Near You</h1>
          <p>Searching in: <strong>{city}</strong></p>
        </div>

        <div className="filter-section-clean">
          <div className="categories-grid">
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`category-checkbox ${selectedCategories.includes(cat.id) ? 'selected' : ''}`}
                onClick={() => handleCategoryToggle(cat.id)}
              >
                <div className="category-icon">{cat.icon}</div>
                <span className="category-label">{cat.label}</span>
                {selectedCategories.includes(cat.id) && (
                  <div className="check-mark">✓</div>
                )}
              </div>
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="filter-actions">
            <button 
              onClick={handleApplyFilters} 
              className="btn-apply"
              disabled={selectedCategories.length === 0}
            >
              Show Services ({selectedCategories.length})
            </button>
            <button 
              onClick={handleResetFilters} 
              className="btn-change-location"
            >
              📍 Change Location
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Services Display Screen

  return (
    <div className="services-page">
      <div className="services-header">
        <h1>Available Services</h1>
        <p>{services.length} services found near you</p>
        <button onClick={handleResetFilters} className="btn-reset">
          Change Filters
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Finding services near you...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No services found</h3>
          <p>{error || 'Try selecting different categories or expanding your search radius'}</p>
          <button onClick={handleResetFilters} className="btn-primary">
            Change Filters
          </button>
        </div>
      ) : (
        <div className="services-grid-modern">
          {services.map(service => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
