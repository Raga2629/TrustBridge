# Service Provider Registration Form - User Guide

## What Changed? 🎯

### ❌ REMOVED: Price Range Field
The price range option has been completely removed from the form. Service providers no longer need to specify pricing during registration.

### ✅ REQUIRED: Contact Information
Both contact phone and email are now **mandatory fields**. You must provide:
- **Contact Phone**: Your business phone number (e.g., +91 9876543210)
- **Contact Email**: Your business email address (e.g., shop@example.com)

These are essential for customers to reach you.

### ✅ NEW: File Upload Requirements
You must upload **TWO documents** to complete registration:

#### 1. Service Image (Required)
- **What to upload**: A clear photo of your shop, hospital, clinic, or service location
- **Accepted formats**: JPG, JPEG, PNG
- **Maximum size**: 5MB
- **Purpose**: Helps customers identify your business location

#### 2. Business Proof (Required)
- **What to upload**: Official business documentation
- **Accepted formats**: JPG, JPEG, PNG, PDF
- **Maximum size**: 5MB
- **Examples**:
  - Business License
  - Shop Registration Certificate
  - GST Certificate
  - Trade License
  - Any official government-issued business document

## Form Fields Overview

### Required Fields (marked with *)

1. **Service Name*** - Name of your business
2. **Category*** - Select from dropdown (Medical, Grocery, etc.)
3. **Description*** - Detailed description of your service
4. **City*** - Your city (e.g., Hyderabad)
5. **Area/Locality*** - Your area (e.g., Bachupally)
6. **Full Address*** - Complete address with landmarks
7. **Contact Phone*** - Your business phone number ⭐ NEW REQUIREMENT
8. **Contact Email*** - Your business email address ⭐ NEW REQUIREMENT
9. **Service Image*** - Photo of your shop/service ⭐ NEW REQUIREMENT
10. **Business Proof*** - Business license/certificate ⭐ NEW REQUIREMENT

### Optional Fields

1. **Subcategory** - More specific category (e.g., Pharmacy, Clinic)
2. **Working Hours** - Your business hours (e.g., 9 AM - 9 PM)

## Step-by-Step Registration Process

### Step 1: Login as Service Provider
- Go to the login page
- Enter your service provider credentials
- Click "Login"

### Step 2: Navigate to Add Service
- From your provider dashboard
- Click "Add Service" button

### Step 3: Fill Basic Information
```
Service Name: Bala Medical Shop
Category: Medical
Subcategory: Pharmacy
Description: 24/7 pharmacy with all medicines and healthcare products
```

### Step 4: Fill Location Details
```
City: Hyderabad
Area: Bachupally
Address: Shop No. 12, Main Road, Near Bus Stop, Bachupally
Working Hours: 24/7 (Optional)
```

### Step 5: Provide Contact Information ⭐ REQUIRED
```
Contact Phone: +91 9876543210
Contact Email: balamedical@gmail.com
```
💡 **Tip**: These fields now have a hint below them saying "Required for customers to contact you"

### Step 6: Upload Service Image ⭐ REQUIRED
1. Click on the "Service Image" file input
2. Select a clear photo of your shop/service
3. Accepted: JPG, JPEG, PNG (max 5MB)
4. You'll see the filename appear after selection

💡 **Tip**: The file input has a dashed border and changes color when you hover over it

### Step 7: Upload Business Proof ⭐ REQUIRED
1. Click on the "Business Proof" file input
2. Select your business license or certificate
3. Accepted: JPG, JPEG, PNG, PDF (max 5MB)
4. You'll see the filename appear after selection

💡 **Tip**: Below the input, you'll see: "Upload business license, registration certificate, or GST certificate (Required)"

### Step 8: Submit Form
1. Review all information
2. Ensure both files are uploaded
3. Click "Add Service" button
4. Wait for success message

## What Happens After Submission?

1. **Files are Saved**: Your service image and business proof are securely stored on the server
2. **Service Created**: Your service is added to the database with `verified: false` status
3. **Admin Review**: An admin will review your service and uploaded documents
4. **Verification**: Once approved, your service will be visible to customers
5. **Notification**: You'll be able to see your service status in the provider dashboard

## Validation & Error Messages

### If You Miss Required Fields
```
❌ Error: "Please provide all required fields including contact phone, email, service image, and business proof"
```

### If You Don't Upload Files
```
❌ Error: "Please upload both service image and business proof documents"
```

### If File Type is Wrong
```
❌ Error: "Only .jpg, .jpeg, .png, and .pdf files are allowed"
```

### If File is Too Large
```
❌ Error: "File size exceeds 5MB limit"
```

### Success Message
```
✅ "Service added successfully! It will be reviewed by admin."
```

## Visual Guide to File Inputs

### Service Image Input
```
┌─────────────────────────────────────────┐
│ Service Image *                         │
├─────────────────────────────────────────┤
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│   Choose File    No file chosen         │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│ Upload a photo of your shop/hospital/   │
│ service (Required)                      │
└─────────────────────────────────────────┘
```

### Business Proof Input
```
┌─────────────────────────────────────────┐
│ Business Proof *                        │
├─────────────────────────────────────────┤
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│   Choose File    No file chosen         │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│ Upload business license, registration   │
│ certificate, or GST certificate         │
│ (Required)                              │
└─────────────────────────────────────────┘
```

## Why These Changes?

### 1. No Price Range
- Pricing varies by service and product
- Better to let customers contact directly for quotes
- Reduces confusion and outdated information

### 2. Required Contact Info
- Customers need a way to reach you
- Essential for booking and inquiries
- Builds trust and transparency

### 3. Required File Uploads
- **Service Image**: Helps customers identify your location
- **Business Proof**: Ensures legitimacy and prevents fraud
- **Admin Verification**: Maintains platform quality and trust

## Tips for Success

### For Service Image:
✅ Take a clear, well-lit photo
✅ Show your shop front or signboard
✅ Include any distinctive features
✅ Make sure the image is not blurry
❌ Don't use stock photos
❌ Don't upload unrelated images

### For Business Proof:
✅ Upload official government documents
✅ Ensure text is readable
✅ Use PDF for multi-page documents
✅ Make sure document is valid and current
❌ Don't upload expired documents
❌ Don't upload fake or altered documents

## Troubleshooting

### Problem: "Add Service" button is disabled
**Solution**: Fill all required fields including both file uploads

### Problem: File won't upload
**Solution**: 
- Check file size (must be under 5MB)
- Check file type (JPG, JPEG, PNG, or PDF only)
- Try a different file

### Problem: Form submission fails
**Solution**:
- Ensure backend server is running (port 5000)
- Check internet connection
- Verify all required fields are filled
- Check browser console for errors

### Problem: Can't see my service after submission
**Solution**: 
- Services require admin approval first
- Check back later or contact admin
- Your service has `verified: false` status initially

## Contact Support

If you encounter any issues:
1. Check this guide first
2. Verify all requirements are met
3. Contact admin for verification status
4. Report technical issues to support

---

**Status**: ✅ All changes implemented and ready to use
**Last Updated**: Current session
**Version**: 2.0 (with file uploads)
