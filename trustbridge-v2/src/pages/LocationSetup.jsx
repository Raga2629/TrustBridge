import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LocationSetup.css';

const LocationSetup = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      // Fallback to Hyderabad
      setCity('Hyderabad');
      setLocation({ latitude: 17.3850, longitude: 78.4867 });
      return;
    }

    setDetecting(true);
    setError('');
    setSuccess('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding using OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'TrustBridge/1.0'
              }
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch location data');
          }
          
          const data = await response.json();
          
          // Extract city - prioritize actual city, fallback to Hyderabad
          let detectedCity = 
            data.address?.city || 
            data.address?.town || 
            data.address?.village || 
            data.address?.municipality ||
            'Hyderabad';
          
          // If detected city is state name (like Telangana), use Hyderabad
          if (detectedCity === 'Telangana' || detectedCity === 'Andhra Pradesh') {
            detectedCity = 'Hyderabad';
          }
          
          setLocation({ latitude, longitude });
          setCity(detectedCity);
          setSuccess(`Location detected: ${detectedCity}`);
          setError('');
        } catch (err) {
          console.error('Geocoding error:', err);
          // Fallback to Hyderabad
          setCity('Hyderabad');
          setLocation({ latitude, longitude });
          setSuccess('Location detected (Hyderabad area)');
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to detect location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Using default location: Hyderabad';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Using default location: Hyderabad';
            break;
          case error.TIMEOUT:
            errorMessage += 'Using default location: Hyderabad';
            break;
          default:
            errorMessage += 'Using default location: Hyderabad';
        }
        
        // Fallback to Hyderabad coordinates
        setCity('Hyderabad');
        setLocation({ latitude: 17.3850, longitude: 78.4867 });
        setError(errorMessage);
        setDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!city.trim()) {
      setError('Please enter your city or detect location');
      return;
    }

    if (!location || !location.latitude || !location.longitude) {
      setError('Please detect your location first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      console.log('💾 Saving location to backend:', {
        city: city.trim(),
        location
      });

      // Update user profile with location in backend
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          city: city.trim(),
          location: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      console.log('✅ Profile updated:', data);

      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(data));

      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Location setup error:', err);
      setError('Failed to save location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="location-setup">
      <div className="location-card">
        <h1>Set Your Location</h1>
        <p className="subtitle">Help us find services near you</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city"
              required
            />
          </div>

          <div className="location-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            onClick={detectLocation}
            className="btn-detect"
            disabled={detecting}
          >
            {detecting ? (
              <>
                <span className="spinner"></span>
                Detecting Location...
              </>
            ) : (
              <>
                📍 Detect My Location
              </>
            )}
          </button>

          {location && (
            <div className="location-info">
              <div className="location-success-icon">✓</div>
              <p className="location-success-text">Location detected successfully!</p>
              <div className="location-coords">
                <small>Latitude: {location.latitude.toFixed(6)}</small>
                <small>Longitude: {location.longitude.toFixed(6)}</small>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocationSetup;
