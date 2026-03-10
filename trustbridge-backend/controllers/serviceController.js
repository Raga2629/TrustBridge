const Service = require('../models/Service');

// Standardize category names
const standardizeCategory = (category) => {
  if (!category) return null;
  return category.toLowerCase().trim();
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (PROVIDER or ADMIN)
const createService = async (req, res) => {
  try {
    console.log('=== CREATE SERVICE REQUEST ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    
    const {
      name,
      category,
      subcategory,
      description,
      address,
      area,
      city,
      location,
      contactPhone,
      contactEmail,
      workingHours
    } = req.body;

    // Validation - contactPhone and contactEmail are now required
    if (!name || !category || !description || !address || !area || !city || !contactPhone || !contactEmail) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, category, description, address, area, city, contactPhone, contactEmail' 
      });
    }

    // Check if files are uploaded
    if (!req.files || !req.files.serviceImage || !req.files.businessProof) {
      console.log('Validation failed - missing files');
      return res.status(400).json({ 
        message: 'Please upload both service image and business proof documents' 
      });
    }

    // Valid categories (matching Service model enum)
    const validCategories = [
      'Medical', 'Grocery', 'Food', 'Education', 'HomeServices', 
      'Shopping', 'Beauty', 'Transport', 'Temples', 
      'Rentals', 'Repairs', 'BankATMs', 'PG', 'Gym/Fitness'
    ];
    
    if (!validCategories.includes(category)) {
      console.log('Invalid category:', category);
      return res.status(400).json({ 
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      });
    }

    // Prepare service data
    const serviceData = {
      name: name.trim(),
      category: category,
      subcategory: subcategory?.trim(),
      description: description.trim(),
      address: address.trim(),
      area: area.trim(),
      city: city.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      workingHours: workingHours?.trim(),
      serviceImageUrl: req.files.serviceImage[0].path,
      businessProofUrl: req.files.businessProof[0].path,
      provider: req.user._id,
      verified: false // Requires admin verification
    };

    // Handle location coordinates
    if (location) {
      try {
        const locationData = typeof location === 'string' ? JSON.parse(location) : location;
        if (locationData && locationData.coordinates && Array.isArray(locationData.coordinates)) {
          serviceData.location = {
            type: 'Point',
            coordinates: locationData.coordinates
          };
        }
      } catch (e) {
        console.log('Location parse error:', e);
      }
    }
    
    if (!serviceData.location) {
      // Default location (Bachupally, Hyderabad)
      serviceData.location = {
        type: 'Point',
        coordinates: [78.3931, 17.4975]
      };
    }

    console.log('Creating service with data:', serviceData);

    const service = await Service.create(serviceData);
    console.log('Service created successfully:', service._id);
    
    const populatedService = await Service.findById(service._id).populate('provider', 'name email phone');

    res.status(201).json(populatedService);
  } catch (error) {
    console.error('=== CREATE SERVICE ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A service with this name and address already exists. Please use a different name or address.' 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get all services with filtering and geospatial search
// @route   GET /api/services
// @access  Public
const getAllServices = async (req, res) => {
  try {
    const { category, subcategory, lat, lng, maxDistance, categories, area } = req.query;
    
    console.log('📍 Service Query Params:', { category, subcategory, lat, lng, maxDistance, categories, area });
    
    let query = {};
    
    // Filter by area (strict filtering by area name)
    if (area) {
      query.area = new RegExp(area, 'i'); // Case-insensitive area match
      console.log('📍 Filtering by area:', area);
    }
    
    // Filter by category (single or multiple)
    if (categories) {
      // Handle multiple categories (comma-separated)
      const categoryArray = categories.split(',').map(c => c.trim());
      console.log('🏷️ Filtering by categories:', categoryArray);
      query.category = { $in: categoryArray };
    } else if (category) {
      // Single category
      query.category = category;
      console.log('🏷️ Filtering by single category:', category);
    }
    
    // Filter by subcategory
    if (subcategory) {
      query.subcategory = new RegExp(subcategory, 'i');
    }

    let services;

    // PRIORITY: Use geospatial query if coordinates provided
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const maxDist = maxDistance ? parseInt(maxDistance) : 10000; // Default 10km (reduced from 50km)

      console.log('🌍 Using geospatial query:', { latitude, longitude, maxDist });

      // Build geospatial query
      const geoQuery = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: maxDist
          }
        }
      };

      // Merge with category filters and area filter
      const finalQuery = { ...geoQuery, ...query };
      console.log('🔍 Final query:', JSON.stringify(finalQuery, null, 2));

      services = await Service.find(finalQuery)
        .populate('provider', 'name email phone trustScore')
        .limit(50); // Limit results

      console.log(`✅ Found ${services.length} services within ${maxDist}m in area: ${area || 'all'}`);

      // Calculate distance for each service
      services = services.map(service => {
        const serviceLng = service.location.coordinates[0];
        const serviceLat = service.location.coordinates[1];
        
        // Haversine formula for distance calculation
        const R = 6371e3; // Earth radius in meters
        const φ1 = latitude * Math.PI / 180;
        const φ2 = serviceLat * Math.PI / 180;
        const Δφ = (serviceLat - latitude) * Math.PI / 180;
        const Δλ = (serviceLng - longitude) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        return {
          ...service.toObject(),
          distance: Math.round(distance), // Distance in meters
          distanceKm: (distance / 1000).toFixed(2) // Distance in km
        };
      });

    } else {
      // Fallback: Regular query without geospatial sorting
      console.log('⚠️ No coordinates provided, using regular query');
      console.log('🔍 Query:', JSON.stringify(query, null, 2));
      
      services = await Service.find(query)
        .populate('provider', 'name email phone trustScore')
        .sort('-averageRating -totalReviews -createdAt') // Sort by rating first, then reviews, then date
        .limit(50);

      console.log(`✅ Found ${services.length} services (no location sorting)`);
    }

    // Sort all services by rating, reviews, and verified status
    services.sort((a, b) => {
      // First priority: Average rating (higher is better)
      if (b.averageRating !== a.averageRating) {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      // Second priority: Number of reviews (more is better)
      if (b.totalReviews !== a.totalReviews) {
        return (b.totalReviews || 0) - (a.totalReviews || 0);
      }
      // Third priority: Verified status
      if (b.verified !== a.verified) {
        return b.verified ? 1 : -1;
      }
      // Fourth priority: Distance (if available, closer is better)
      if (a.distance && b.distance) {
        return a.distance - b.distance;
      }
      return 0;
    });

    res.json(services);
  } catch (error) {
    console.error('❌ Get services error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email phone city trustScore verified');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (PROVIDER - own services, or ADMIN)
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check authorization
    const isOwner = service.provider && service.provider.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const {
      name,
      category,
      subcategory,
      description,
      address,
      city,
      location,
      priceRange,
      contactPhone,
      contactEmail,
      workingHours,
      image
    } = req.body;

    // Update fields
    if (name) service.name = name.trim();
    if (category) service.category = standardizeCategory(category);
    if (subcategory !== undefined) service.subcategory = subcategory?.trim();
    if (description) service.description = description.trim();
    if (address) service.address = address.trim();
    if (city) service.city = city.trim();
    if (priceRange !== undefined) service.priceRange = priceRange;
    if (contactPhone !== undefined) service.contactPhone = contactPhone;
    if (contactEmail !== undefined) service.contactEmail = contactEmail;
    if (workingHours !== undefined) service.workingHours = workingHours;
    if (image !== undefined) service.image = image;

    // Update location if provided
    if (location) {
      if (location.coordinates && Array.isArray(location.coordinates)) {
        service.location = {
          type: 'Point',
          coordinates: location.coordinates
        };
      } else if (location.lng !== undefined && location.lat !== undefined) {
        service.location = {
          type: 'Point',
          coordinates: [parseFloat(location.lng), parseFloat(location.lat)]
        };
      }
    }

    await service.save();

    const updatedService = await Service.findById(service._id).populate('provider', 'name email phone');
    res.json(updatedService);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (ADMIN only)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get services by category (legacy support)
// @route   GET /api/services/category/:category
// @access  Public
const getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const standardized = standardizeCategory(category);
    
    const services = await Service.find({ category: standardized })
      .populate('provider', 'name email phone trustScore')
      .sort('-createdAt');
    
    res.json(services);
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify service
// @route   PUT /api/services/:id/verify
// @access  Private (ADMIN only)
const verifyService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.verified = true;
    service.isVerified = true; // Backward compatibility
    await service.save();

    res.json({ message: 'Service verified successfully', service });
  } catch (error) {
    console.error('Verify service error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesByCategory,
  verifyService,
  // Legacy exports
  addService: createService
};


// @desc    Bulk insert services
// @route   POST /api/services/bulk
// @access  Private (ADMIN only)
const bulkInsertServices = async (req, res) => {
  try {
    const { services } = req.body;

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ 
        message: 'Please provide an array of services' 
      });
    }

    const results = {
      inserted: 0,
      duplicates: 0,
      errors: []
    };

    const validCategories = ['Medical', 'Grocery', 'Food', 'Education', 'HomeServices', 'Shopping', 'Beauty', 'Transport', 'Temples', 'Rentals', 'Repairs', 'BankATMs', 'PG', 'Gym/Fitness'];

    for (let i = 0; i < services.length; i++) {
      const service = services[i];

      try {
        // Validate required fields
        if (!service.name || !service.category || !service.description || !service.address) {
          results.errors.push({
            index: i,
            name: service.name || 'Unknown',
            error: 'Missing required fields: name, category, description, or address'
          });
          continue;
        }

        // Validate category
        if (!validCategories.includes(service.category)) {
          results.errors.push({
            index: i,
            name: service.name,
            error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
          });
          continue;
        }

        // Automatically set city and area
        const serviceData = {
          ...service,
          city: 'Hyderabad',
          area: 'Bachupally'
        };

        // Ensure location coordinates are present
        if (!serviceData.location || !serviceData.location.coordinates || serviceData.location.coordinates.length !== 2) {
          results.errors.push({
            index: i,
            name: service.name,
            error: 'Invalid or missing location coordinates'
          });
          continue;
        }

        // Try to insert
        await Service.create(serviceData);
        results.inserted++;

      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error
          results.duplicates++;
        } else {
          results.errors.push({
            index: i,
            name: service.name || 'Unknown',
            error: error.message
          });
        }
      }
    }

    res.status(200).json({
      message: 'Bulk insert completed',
      total: services.length,
      inserted: results.inserted,
      duplicates: results.duplicates,
      failed: results.errors.length,
      errors: results.errors
    });

  } catch (error) {
    console.error('Bulk insert error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesByCategory,
  verifyService,
  bulkInsertServices,
  // Legacy exports
  addService: createService
};
