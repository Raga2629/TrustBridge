# Testing Guide: Location-Based Service Filtering

## Prerequisites
✅ Backend running on http://localhost:5000
✅ Frontend running on http://localhost:5173
✅ MongoDB running with services seeded

---

## Test 1: Seed Bachupally Services

If you haven't seeded the services yet:

```bash
cd trustbridge-backend
node seedBachupallyServices.js
```

Expected output:
```
MongoDB connected for seeding...
Starting bulk insert of Bachupally services...
Total services to insert: 58

✓ Inserted: Apollo Clinic Bachupally
✓ Inserted: Medicover Hospitals Bachupally
...

========== SEED SUMMARY ==========
Total services: 58
Successfully inserted: 58
Duplicates skipped: 0
Errors: 0
==================================
```

---

## Test 2: Location Detection

1. **Open browser**: http://localhost:5173
2. **Login/Register** as a user
3. **Navigate to Location Setup** (should redirect automatically if no location)
4. **Click "Detect My Location"**

### Expected Behavior:
- Browser asks for location permission
- Loading spinner appears
- Coordinates detected (e.g., 17.5449, 78.3931)
- City name displayed (e.g., "Bachupally" or "Telangana")
- Success message with checkmark

### Check Browser Console:
```
💾 Saving location to backend: { city: "Bachupally", location: {...} }
✅ Profile updated: { _id: "...", location: {...} }
```

### Check Backend Console:
```
📍 Updated user location: { latitude: 17.5449, longitude: 78.3931 }
```

5. **Click "Continue to Dashboard"**
6. **Verify localStorage**:
   - Open DevTools → Application → Local Storage
   - Check `user` key contains `location` object

---

## Test 3: Browse Services with Location

1. **From Dashboard**, click "Browse Services"
2. **Select categories** (e.g., Medical, Grocery, Education)
3. **Click "Apply Filters"**

### Expected Behavior:
- Loading spinner appears
- Services load sorted by distance
- Each service shows:
  - Name and category
  - Description
  - Distance (e.g., "1.25km away" or "500m away")
  - Area and city
  - Price range
  - Rating

### Check Browser Console:
```
📍 User location from storage: { latitude: 17.5449, longitude: 78.3931 }
🔍 Fetching services with: { categories: ['Medical', 'Grocery'], location: {...} }
📡 API Request params: { lat: 17.5449, lng: 78.3931, categories: 'Medical,Grocery', maxDistance: 10000 }
✅ Received 15 services
```

### Check Backend Console:
```
📍 Service Query Params: { lat: '17.5449', lng: '78.3931', categories: 'Medical,Grocery' }
🏷️ Filtering by categories: [ 'Medical', 'Grocery' ]
🌍 Using geospatial query: { latitude: 17.5449, longitude: 78.3931, maxDist: 10000 }
✅ Found 15 services within 10000m
```

---

## Test 4: Different Locations

### Test with Bachupally coordinates:
```
Latitude: 17.5449
Longitude: 78.3931
```
Should return all 58 seeded services (within 10km)

### Test with far location (e.g., Mumbai):
```
Latitude: 19.0760
Longitude: 72.8777
```
Should return 0 services (too far from Bachupally)

### Test with nearby location:
```
Latitude: 17.5500
Longitude: 78.4000
```
Should return services sorted by distance

---

## Test 5: API Testing (Direct)

### Get all services near Bachupally:
```bash
curl "http://localhost:5000/api/services?lat=17.5449&lng=78.3931&maxDistance=10000"
```

### Get Medical services only:
```bash
curl "http://localhost:5000/api/services?lat=17.5449&lng=78.3931&categories=Medical&maxDistance=10000"
```

### Get multiple categories:
```bash
curl "http://localhost:5000/api/services?lat=17.5449&lng=78.3931&categories=Medical,Grocery,Education&maxDistance=10000"
```

### Expected Response:
```json
[
  {
    "_id": "...",
    "name": "Apollo Clinic Bachupally",
    "category": "Medical",
    "description": "...",
    "location": {
      "type": "Point",
      "coordinates": [78.3931, 17.5449]
    },
    "distance": 0,
    "distanceKm": "0.00",
    "area": "Bachupally",
    "city": "Hyderabad",
    "priceRange": "₹300 - ₹1500",
    ...
  },
  ...
]
```

---

## Test 6: Edge Cases

### No location set:
1. Clear localStorage
2. Try to browse services
3. Should show error: "Location not detected. Please set your location first."

### No categories selected:
1. Browse services
2. Don't select any category
3. Click "Apply Filters"
4. Should show error: "Please select at least one category"

### No services found:
1. Select categories with no services nearby
2. Should show empty state with message

---

## Troubleshooting

### Services not appearing:
1. Check backend console for errors
2. Verify services are seeded: `db.services.countDocuments()`
3. Check 2dsphere index exists: `db.services.getIndexes()`
4. Verify user location in localStorage
5. Check API response in Network tab

### Location not saving:
1. Check backend console for profile update logs
2. Verify token in localStorage
3. Check Network tab for API call
4. Verify MongoDB user document has location field

### Distance not showing:
1. Check service response has `distanceKm` field
2. Verify frontend is reading it correctly
3. Check CSS styles are applied

---

## Success Criteria

✅ Location detection works and saves to backend
✅ Services load based on user coordinates
✅ Services sorted by distance (nearest first)
✅ Distance displayed for each service
✅ Multiple categories can be selected
✅ No services found shows appropriate message
✅ Backend logs show geospatial queries
✅ Frontend logs show location and API calls

---

## Quick Verification Commands

### Check MongoDB:
```javascript
// Connect to MongoDB
mongosh

use trustbridge

// Count services
db.services.countDocuments()

// Check indexes
db.services.getIndexes()

// Find services near Bachupally
db.services.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [78.3931, 17.5449]
      },
      $maxDistance: 10000
    }
  }
}).limit(5)
```

### Check User Location:
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('user'));
console.log('User location:', user.location);
```

---

## Current Status

✅ Backend: Running on port 5000
✅ Frontend: Running on port 5173
✅ MongoDB: Connected
✅ Location detection: Fixed
✅ Service filtering: Fixed
✅ Geospatial queries: Working
✅ Distance calculation: Working

**Ready for testing!**
