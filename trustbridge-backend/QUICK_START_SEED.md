# Quick Start: Seed Bachupally Services

## Prerequisites Check
```bash
# 1. Ensure MongoDB is running
# Windows: Check Services or run `mongod`
# Mac/Linux: sudo systemctl status mongod

# 2. Verify .env file exists with MONGO_URI
cd trustbridge-backend
type .env  # Windows
cat .env   # Mac/Linux
```

## Run the Seed Script

```bash
# Navigate to backend directory
cd trustbridge-backend

# Run the seed script
node seedBachupallyServices.js
```

## Expected Output

```
MongoDB connected for seeding...
Starting bulk insert of Bachupally services...
Total services to insert: 58

✓ Inserted: Apollo Clinic Bachupally
✓ Inserted: Medicover Hospitals Bachupally
✓ Inserted: Care Hospital Bachupally
... (continues for all 58 services)

========== SEED SUMMARY ==========
Total services: 58
Successfully inserted: 58
Duplicates skipped: 0
Errors: 0
==================================

Seeding completed!
MongoDB connection closed.
```

## Verify Data

### Using MongoDB Shell
```bash
mongosh

use trustbridge

# Count all Bachupally services
db.services.countDocuments({ area: "Bachupally" })
# Should return: 58

# View sample services
db.services.find({ area: "Bachupally" }).limit(3).pretty()

# Count by category
db.services.aggregate([
  { $match: { area: "Bachupally" } },
  { $group: { _id: "$category", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

### Using API (Backend must be running)
```bash
# Start backend server first
npm start

# In another terminal, test API
curl http://localhost:5000/api/services?city=Hyderabad

# Get Medical services
curl http://localhost:5000/api/services?category=Medical

# Get nearest services (geospatial)
curl "http://localhost:5000/api/services?lat=17.5449&lng=78.3931"
```

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**: Start MongoDB service

### Duplicate Key Error
```
E11000 duplicate key error
```
**Solution**: Services already exist. This is normal if re-running. Script will skip duplicates.

### Invalid Category Error
```
category: ValidatorError: `Food` is not a valid enum value
```
**Solution**: Ensure Service model has updated enum. Food services are categorized under "Shopping".

## What's Next?

1. ✅ Services seeded successfully
2. Test API endpoints
3. Update frontend to display services
4. Optionally verify services via admin panel
5. Add more services as needed

## Files Reference

- `seedBachupallyServices.js` - Main seed script
- `BACHUPALLY_SEED_README.md` - Detailed documentation
- `SERVICES_BREAKDOWN.md` - Complete list of all 58 services
- `TASK_COMPLETION_SUMMARY.md` - Implementation details

## Need Help?

Check the detailed guides:
- Full documentation: `BACHUPALLY_SEED_README.md`
- Service list: `SERVICES_BREAKDOWN.md`
- Implementation details: `TASK_COMPLETION_SUMMARY.md`
