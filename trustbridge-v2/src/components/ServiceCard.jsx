import { Link } from 'react-router-dom';
import { getServiceImage } from '../assets/service-images/fallback-images';
import '../styles/ServiceCard.css';

const ServiceCard = ({ service }) => {
  const formatDistance = (distanceKm) => {
    const distance = parseFloat(distanceKm);
    if (isNaN(distance)) return null;
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  const getOpenStatus = (workingHours) => {
    if (!workingHours) return { isOpen: false, text: 'Hours not available' };
    
    try {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i;
      const match = workingHours.match(timeRegex);
      
      if (!match) return { isOpen: false, text: 'Closed' };
      
      let [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = match;
      
      openHour = parseInt(openHour);
      closeHour = parseInt(closeHour);
      
      if (openPeriod.toUpperCase() === 'PM' && openHour !== 12) openHour += 12;
      if (openPeriod.toUpperCase() === 'AM' && openHour === 12) openHour = 0;
      if (closePeriod.toUpperCase() === 'PM' && closeHour !== 12) closeHour += 12;
      if (closePeriod.toUpperCase() === 'AM' && closeHour === 12) closeHour = 0;
      
      const openTime = openHour * 60 + parseInt(openMin);
      const closeTime = closeHour * 60 + parseInt(closeMin);
      
      const isOpen = currentTime >= openTime && currentTime < closeTime;
      
      return {
        isOpen,
        text: isOpen ? 'Open Now' : 'Closed'
      };
    } catch (error) {
      return { isOpen: false, text: 'Closed' };
    }
  };

  const serviceImage = getServiceImage(service);
  const distance = formatDistance(service.distanceKm);
  const rating = service.averageRating || service.rating || 0;
  const reviewCount = service.totalReviews || 0;
  const openStatus = getOpenStatus(service.workingHours);
  const hasReviews = reviewCount > 0;

  return (
    <div className="service-card-pro">
      {/* Image Section */}
      <div className="service-image-pro">
        <img 
          src={serviceImage} 
          alt={service.name}
          className="service-img"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop';
          }}
        />
        <div className="verified-badge-pro">
          ✓ Verified
        </div>
      </div>

      {/* Content Section */}
      <div className="service-content-pro">
        {/* Service Name */}
        <h3 className="service-name-pro">{service.name}</h3>

        {/* Rating Row */}
        <div className="rating-row-pro">
          <div className="stars-pro">
            {hasReviews ? (
              <>
                {renderStars(rating)}
                <span className="rating-num-pro">{rating.toFixed(1)}</span>
                <span className="review-count-pro">({reviewCount})</span>
              </>
            ) : (
              <span className="new-service-badge">New Service</span>
            )}
          </div>
          {distance && (
            <span className="distance-pro">{distance}</span>
          )}
        </div>

        {/* Description */}
        <p className="description-pro">
          {service.description?.substring(0, 100)}
          {service.description?.length > 100 && '...'}
        </p>

        {/* Working Hours */}
        {service.workingHours && (
          <div className="hours-pro">
            🕒 {service.workingHours}
          </div>
        )}

        {/* Status */}
        <div className={`status-pro ${openStatus.isOpen ? 'open' : 'closed'}`}>
          {openStatus.text}
        </div>

        {/* Contact */}
        {service.contactPhone && (
          <div className="contact-pro">
            📞 {service.contactPhone}
          </div>
        )}

        {/* Actions */}
        <div className="actions-pro">
          <Link to={`/services/${service._id}`} className="btn-view-pro">
            View Details
          </Link>
          <button 
            className="btn-directions-pro"
            onClick={(e) => {
              e.preventDefault();
              if (service.location?.coordinates) {
                const [lng, lat] = service.location.coordinates;
                window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
              }
            }}
            title="Get directions"
          >
            🗺️
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
