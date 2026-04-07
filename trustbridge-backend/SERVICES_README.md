# TrustBridge Services Module

Complete services module with geospatial search capabilities.

## Features

✅ Full CRUD operations for services
✅ Geospatial queries (find nearest services)
✅ Filter by city, category, and subcategory
✅ 2dsphere index for location-based queries
✅ Role-based access control
✅ Validation and error handling

## Service Model Fields

- `name` (required) - Service name
- `category` (required) - One of: medical, home, education, rentals, beauty, food, shopping, transport
- `subcategory` - Optional subcategory
- `description` (required) - Service description
- `address` (required) - Full address
- `city` (required) - City name
- `location` - GeoJSON Point with coordinates [longitude, latitude]
- `priceRange` - Price indication (e.g., ₹, ₹₹, ₹₹₹)
- `contactPhone` - Contact phone number
- `contactEmail` - Contact email
- `workingHours` - Working hours
- `rating` - Average rating (0-5)
- `totalReviews` - Total number of reviews
- `verified` - Verification status
- `image` - Image URL
- `provider` - Reference to User (optional)

## API Endpoints

### Create Service
```
POST /api/services
Authorization: Bearer <token>
Role: PROVIDER or ADMIN

Body:
{
  "name": "Apollo Hospitals",
  "category": "medical",
  "subcategory": "Multi-specialty",
  "description": "Leading hospital",
  "address": "Jubilee Hills, Road No. 72",
  "city": "Hyderabad",
  "location": {
    "coordinates": [78.4089, 17.4326]
  },
  "priceRange": "₹₹₹",
  "contactPhone": "+91-40-23607777",
  "contactEmail": "info@hospital.com",
  "workingHours": "24/7"
}
```

### Get All Services
```
GET /api/services

Query Parameters:
- city: Filter by city (e.g., ?city=Hyderabad)
- category: Filter by category (e.g., ?category=medical)
- subcategory: Filter by subcategory (e.g., ?subcategory=Cardiology)
- lat: Latitude for geospatial search
- lng: Longitude for geospatial search
- maxDistance: Maximum distance in meters (default: 50000)

Examples:
GET /api/services?city=Hyderabad&category=medical
GET /api/services?lat=17.38&lng=78.48&maxDistance=10000
```

### Get Service by ID
```
GET /api/services/:id
```

### Update Service
```
PUT /api/services/:id
Authorization: Bearer <token>
Role: PROVIDER (own services) or ADMIN

Body: (any fields to update)
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete Service
```
DELETE /api/services/:id
Authorization: Bearer <token>
Role: ADMIN only
```

### Verify Service
```
PUT /api/services/:id/verify
Authorization: Bearer <token>
Role: ADMIN only
```

### Get Services by Category (Legacy)
```
GET /api/services/category/:category
```

## Geospatial Queries

The service model includes a 2dsphere index on the `location` field for efficient geospatial queries.

### Find Nearest Services
```javascript
GET /api/services?lat=17.4326&lng=78.4089&maxDistance=5000
```

This returns services within 5km of the specified coordinates, sorted by distance (nearest first).

### Location Format
Coordinates must be in [longitude, latitude] format:
```javascript
{
  "location": {
    "type": "Point",
    "coordinates": [78.4089, 17.4326]  // [lng, lat]
  }
}
```

## Seeding Services

To populate the database with sample services:

```bash
cd trustbridge-backend
node seedServices.js
```

This will insert 20 realistic services in Hyderabad with proper categories and locations.

## Categories

Valid categories:
- `medical` - Hospitals, clinics, pharmacies
- `home` - Cleaning, repairs, maintenance
- `education` - Schools, coaching, language classes
- `rentals` - PG, hostels, apartments
- `beauty` - Salons, spas, grooming
- `food` - Restaurants, cafes, food delivery
- `shopping` - Malls, supermarkets, electronics
- `transport` - Cabs, bike taxis, public transport

## Validation

- Required fields: name, category, description, address, city
- Category must be one of the valid categories
- Coordinates must be valid numbers
- Email must be valid format (if provided)

## Error Handling

All endpoints return structured JSON responses:

Success:
```json
{
  "_id": "...",
  "name": "Service Name",
  ...
}
```

Error:
```json
{
  "message": "Error description"
}
```

## Backward Compatibility

The model maintains backward compatibility with existing fields:
- `timings` (object with open/close)
- `contactNumber` (string)
- `averageRating` (number)
- `isVerified` (boolean)

New code should use:
- `workingHours` (string)
- `contactPhone` (string)
- `rating` (number)
- `verified` (boolean)

## Testing

Use Postman or curl to test the endpoints:

```bash
# Get all services
curl http://localhost:5000/api/services

# Get services in Hyderabad
curl http://localhost:5000/api/services?city=Hyderabad

# Get medical services
curl http://localhost:5000/api/services?category=medical

# Get nearest services
curl http://localhost:5000/api/services?lat=17.4326&lng=78.4089
```

## Notes

- Geospatial queries require the 2dsphere index (automatically created)
- Coordinates are in GeoJSON format: [longitude, latitude]
- Maximum distance is in meters
- Services are sorted by distance when using geospatial queries
- Provider field is optional (for admin-created services)
