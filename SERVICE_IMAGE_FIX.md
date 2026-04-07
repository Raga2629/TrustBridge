# Service Image Fix - Unique Images for Each Service

## Problem

All service cards were showing the same image (woman cleaning window), making it impossible to distinguish between different services visually.

## Root Cause

The image selection logic was too simple and wasn't properly matching services to appropriate images. All services were falling back to the same default image.

## Solution Implemented

Created a comprehensive, multi-level image matching system with 6 priority levels:

### Priority 1: Uploaded Image
If the service provider uploaded a custom image, use it.

### Priority 2: Exact Service Name Match
Specific images for known service names:
- "Carpenter Pro Services" → Carpentry image
- "AC Care Services" → AC repair image
- "Bachupally Plumbing Services" → Plumbing image
- etc.

### Priority 3: Subcategory Match
Match by service subcategory:
- "Carpentry" → Carpentry tools image
- "AC Repair" → Air conditioner image
- "Plumbing" → Plumbing pipes image
- etc.

### Priority 4: Keyword Matching (SMART)
Analyze service name for keywords:
- Contains "carpenter" or "wood" → Carpentry image
- Contains "ac" or "air condition" → AC image
- Contains "plumb" → Plumbing image
- Contains "clean" or "sparkle" → Cleaning image
- Contains "pest" → Pest control image
- Contains "packer" or "mover" → Moving truck image
- Contains "paint" → Painting image
- Contains "electric" → Electrician image
- Contains "doctor" or "clinic" → Medical image
- Contains "pharmacy" → Pharmacy image
- Contains "grocery" or "mart" → Grocery store image
- Contains "salon" or "beauty" → Beauty salon image
- Contains "cab" or "taxi" → Taxi image
- Contains "temple" → Temple image
- Contains "pg" or "hostel" → PG accommodation image
- Contains "bank" or "atm" → Bank image

### Priority 5: Category Fallback
Use category-based image:
- Medical → Hospital/clinic image
- Grocery → Grocery store image
- Education → School/books image
- HomeServices → Home repair image
- Beauty → Salon image
- Transport → Vehicle image
- Temples → Temple image
- Rentals → Building image
- Repairs → Tools image
- BankATMs → Bank image
- PG → Accommodation image

### Priority 6: Default Fallback
Generic business/building image if nothing else matches.

## Image Sources

All images are from Unsplash (free, high-quality stock photos):
- Carpentry: Carpenter working with wood
- AC Repair: Air conditioning unit
- Plumbing: Plumbing pipes and tools
- Cleaning: Person cleaning/home cleaning
- Pest Control: Pest control equipment
- Packers & Movers: Moving truck/boxes
- Painting: Painter with roller
- Electrician: Electrical work/wiring
- Medical: Doctor/hospital
- Pharmacy: Medicine/pharmacy
- Grocery: Grocery store/fresh produce
- Education: Books/classroom
- Beauty: Salon/beauty services
- Transport: Taxi/vehicle
- Temple: Hindu temple
- PG/Rentals: Building/accommodation
- Bank: Bank building/ATM

## Examples

### Before (All Same Image)
```
Carpenter Pro Services → 🖼️ Woman cleaning window
AC Care Services → 🖼️ Woman cleaning window
Plumbing Services → 🖼️ Woman cleaning window
```

### After (Unique Images)
```
Carpenter Pro Services → 🖼️ Carpenter with wood tools
AC Care Services → 🖼️ Air conditioning unit
Bachupally Plumbing → 🖼️ Plumbing pipes
Urban Company Home → 🖼️ Home cleaning
Sparkle Cleaning → 🖼️ Professional cleaning
Pest Control → 🖼️ Pest control equipment
Packers & Movers → 🖼️ Moving truck
Paint Masters → 🖼️ Painter with roller
Electricians → 🖼️ Electrical wiring
```

## How It Works

```javascript
export const getServiceImage = (service) => {
  // 1. Check uploaded image
  if (service.image) return service.image;
  
  // 2. Check exact name match
  if (serviceNameImages[service.name]) return serviceNameImages[service.name];
  
  // 3. Check subcategory
  if (subcategoryImages[service.subcategory]) return subcategoryImages[service.subcategory];
  
  // 4. Check keywords in name
  if (service.name.includes('carpenter')) return carpentryImage;
  if (service.name.includes('plumb')) return plumbingImage;
  // ... etc
  
  // 5. Check category
  if (categoryImages[service.category]) return categoryImages[service.category];
  
  // 6. Default fallback
  return defaultImage;
};
```

## Benefits

✅ **Every service gets a unique, relevant image**
✅ **Visual distinction between service types**
✅ **Professional appearance**
✅ **Easy to identify services at a glance**
✅ **Automatic matching based on service name**
✅ **Fallback system ensures no broken images**

## Testing

After this fix:
1. Carpenter services show carpentry images
2. AC services show AC unit images
3. Plumbing services show plumbing images
4. Cleaning services show cleaning images
5. Each service type has its own distinct image
6. No two services of different types share the same image

## File Modified

- `trustbridge-v2/src/assets/service-images/fallback-images.js`

## Status

✅ **FIXED** - Each service now displays a unique, relevant image based on its type

## Future Enhancement

Consider allowing service providers to upload custom images during service creation for even more personalization.
