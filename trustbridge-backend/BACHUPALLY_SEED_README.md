# Bachupally Services Seed Guide

This guide explains how to populate your TrustBridge database with 68 realistic services for Bachupally, Hyderabad.

## Services Breakdown

- **Medical**: 19 services (hospitals, clinics, pharmacies, diagnostics)
- **Grocery**: 7 services (supermarkets, kirana stores, organic stores)
- **Education**: 8 services (schools, colleges, coaching centers)
- **Shopping**: 9 services (malls, electronics, fashion, food outlets)
- **HomeServices**: 9 services (plumbing, electrical, cleaning, pest control)
- **Temples**: 3 services (Hindu temples)
- **Beauty**: 3 services (salons, parlours)

**Total: 58 services**

## Prerequisites

1. MongoDB must be running
2. Backend server must have `.env` file configured with `MONGO_URI`
3. Service model must support the strict category enum

## How to Run

### Option 1: Direct Execution

```bash
cd trustbridge-backend
node seedBachupallyServices.js
```

### Option 2: Using npm script (if configured)

```bash
cd trustbridge-backend
npm run seed:bachupally
```

## What Happens

The script will:
1. Connect to MongoDB using your `.env` configuration
2. Attempt to insert all 58 services
3. Skip duplicates (based on name + address unique index)
4. Report errors for invalid data
5. Display a summary with:
   - Total services processed
   - Successfully inserted count
   - Duplicates skipped count
   - Errors encountered

## Expected Output

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

Seeding completed!
MongoDB connection closed.
```

## Important Notes

1. **Duplicate Prevention**: The script uses the compound unique index on (name, address) to prevent duplicate entries
2. **Automatic Fields**: All services automatically get:
   - `city = "Hyderabad"`
   - `area = "Bachupally"`
   - `verified = false` (default)
3. **Coordinates**: All services have approximate coordinates around Bachupally center (17.5449° N, 78.3931° E)
4. **Safe to Re-run**: You can run this script multiple times - duplicates will be skipped

## Troubleshooting

### Error: "Cannot connect to MongoDB"
- Ensure MongoDB is running
- Check your `.env` file has correct `MONGO_URI`

### Error: "Invalid category"
- Ensure your Service model has the strict enum with these categories:
  - Medical, Grocery, Education, HomeServices, Shopping, Beauty, Transport, Temples, Rentals, Repairs, BankATMs, PG

### Error: "Duplicate key error"
- This is normal if services already exist
- The script will skip duplicates and continue

## Verifying the Data

After seeding, verify in MongoDB:

```bash
# Connect to MongoDB
mongosh

# Use your database
use trustbridge

# Count services
db.services.countDocuments({ area: "Bachupally" })

# View sample services
db.services.find({ area: "Bachupally" }).limit(5)

# Count by category
db.services.aggregate([
  { $match: { area: "Bachupally" } },
  { $group: { _id: "$category", count: { $sum: 1 } } }
])
```

## API Testing

Test the seeded services via API:

```bash
# Get all Bachupally services
GET http://localhost:5000/api/services?city=Hyderabad&area=Bachupally

# Get by category
GET http://localhost:5000/api/services?city=Hyderabad&category=Medical

# Geospatial search (nearest services)
GET http://localhost:5000/api/services?lat=17.5449&lng=78.3931
```

## Cleanup (if needed)

To remove all Bachupally services:

```javascript
// In MongoDB shell
db.services.deleteMany({ area: "Bachupally" })
```

## Next Steps

1. Run the seed script
2. Verify data in MongoDB
3. Test API endpoints
4. Update frontend to display these services
5. Optionally verify services via admin panel
