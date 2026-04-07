# 🔍 TrustBridge Document Verification System

## Overview

AI-powered fraud detection system that verifies business proof documents against service provider registration form data using OCR text analysis.

## Features

### Verification Capabilities

1. **Field Matching**
   - Business name similarity (70% threshold)
   - Owner name similarity (70% threshold)
   - Registration number exact match (90% threshold)
   - Address similarity with formatting tolerance (60% threshold)
   - Phone number verification

2. **Fraud Detection**
   - Suspicious pattern detection (sample, template, watermark)
   - Document authenticity checks
   - Business document keyword validation
   - Minimum content verification

3. **Smart Comparison**
   - Levenshtein distance algorithm
   - Fuzzy string matching
   - Component-based address matching
   - Formatting tolerance

4. **Risk Assessment**
   - Confidence scoring (0-100%)
   - Risk level classification (Low/Medium/High)
   - Fraud probability assessment
   - Automated recommendations

## Quick Start

### 1. Test the System

```bash
cd trustbridge-backend
node utils/documentVerificationAPI.js
```

### 2. Add Routes to Server

Add to `server.js`:

```javascript
const documentVerificationRoutes = require('./routes/documentVerificationRoutes');
app.use('/api/document-verification', documentVerificationRoutes);
```

### 3. Update ServiceProvider Model

Add to `models/ServiceProvider.js`:

```javascript
documentVerification: {
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Partially Matched', 'Suspicious', 'Rejected'],
    default: 'Pending'
  },
  confidenceScore: String,
  riskLevel: String,
  mismatchFields: [String],
  fraudProbability: String,
  verifiedAt: Date,
  manualOverride: Boolean,
  adminNotes: String,
  overrideAt: Date,
  overrideBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},
ocrExtractedText: String
```

## API Endpoints

### Verify Document
```
POST /api/document-verification/verify
Authorization: Bearer {token}

Body:
{
  "formBusinessName": "Sunrise Accommodation Services",
  "formOwnerName": "Rajesh Kumar",
  "formAddress": "123 MG Road, Bachupally",
  "formPhone": "+91-9876543210",
  "formRegNo": "GST29ABCDE1234F1Z5",
  "ocrExtractedText": "CERTIFICATE...",
  "providerId": "provider_id_here"
}

Response:
{
  "success": true,
  "verification": {
    "verification_status": "Verified",
    "confidence_score": "100%",
    "risk_level": "Low",
    "mismatch_fields": [],
    "fraud_probability": "Low",
    "explanation": "All fields matched...",
    "recommended_action": "Approve"
  }
}
```

### Get Verification Status
```
GET /api/document-verification/status/:providerId
Authorization: Bearer {token}
```

### Batch Verify Documents (Admin)
```
GET /api/document-verification/batch-verify?limit=50
Authorization: Bearer {admin_token}
```

### Manual Override (Admin)
```
PUT /api/document-verification/override/:providerId
Authorization: Bearer {admin_token}

Body:
{
  "status": "Verified",
  "adminNotes": "Manually verified after phone call"
}
```

## Verification Logic

### Status Classification

| Status | Criteria |
|--------|----------|
| **Verified** | All fields match, no suspicious patterns |
| **Partially Matched** | 1-2 fields mismatch, confidence ≥ 60% |
| **Suspicious** | 3+ fields mismatch OR low confidence |
| **Rejected** | Suspicious patterns detected |

### Confidence Score Calculation

```
Base Score = (Matched Fields / Total Fields) × 100

Adjustments:
- Missing business keywords: -30%
- Insufficient content: -30%
- Suspicious patterns: -40%

Final Score = Max(0, Base Score - Adjustments)
```

### Field Matching Thresholds

| Field | Threshold | Type |
|-------|-----------|------|
| Business Name | 70% | Similarity |
| Owner Name | 70% | Similarity |
| Registration Number | 90% | Exact/Similarity |
| Address | 60% | Component-based |
| Phone | Exact | Last 10 digits |

## Integration Examples

### Frontend - Document Upload with Verification

```javascript
const uploadAndVerifyDocument = async (file, formData) => {
  // Step 1: Upload document and get OCR text
  const formDataObj = new FormData();
  formDataObj.append('document', file);
  
  const uploadResponse = await fetch('/api/upload/document', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formDataObj
  });
  
  const { ocrText, documentUrl } = await uploadResponse.json();
  
  // Step 2: Verify document
  const verifyResponse = await fetch('/api/document-verification/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      formBusinessName: formData.businessName,
      formOwnerName: formData.ownerName,
      formAddress: formData.address,
      formPhone: formData.phone,
      formRegNo: formData.registrationNumber,
      ocrExtractedText: ocrText,
      providerId: currentUser.id
    })
  });
  
  const { verification } = await verifyResponse.json();
  
  // Step 3: Handle verification result
  if (verification.verification_status === 'Rejected') {
    alert(`Document rejected: ${verification.explanation}`);
    return false;
  }
  
  if (verification.verification_status === 'Suspicious') {
    const proceed = confirm(
      `Warning: ${verification.explanation}\n\n` +
      `Confidence: ${verification.confidence_score}\n` +
      `Risk Level: ${verification.risk_level}\n\n` +
      `Your application will be manually reviewed. Continue?`
    );
    if (!proceed) return false;
  }
  
  if (verification.verification_status === 'Partially Matched') {
    alert(
      `Some fields don't match:\n` +
      `${verification.mismatch_fields.join(', ')}\n\n` +
      `${verification.explanation}\n\n` +
      `Your application will be manually reviewed.`
    );
  }
  
  return true;
};
```

### Admin Dashboard - Verification Review

```javascript
const DocumentVerificationPanel = () => {
  const [pendingVerifications, setPendingVerifications] = useState([]);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    const response = await fetch('/api/document-verification/batch-verify', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await response.json();
    
    // Filter for manual review
    const needsReview = data.results.filter(
      r => ['Partially Matched', 'Suspicious'].includes(
        r.verification?.verification_status
      )
    );
    setPendingVerifications(needsReview);
  };

  const handleApprove = async (providerId) => {
    await fetch(`/api/document-verification/override/${providerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'Verified',
        adminNotes: 'Manually approved after review'
      })
    });
    fetchPendingVerifications();
  };

  const handleReject = async (providerId) => {
    const notes = prompt('Reason for rejection:');
    await fetch(`/api/document-verification/override/${providerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'Rejected',
        adminNotes: notes
      })
    });
    fetchPendingVerifications();
  };

  return (
    <div className="verification-panel">
      <h2>Pending Document Verifications ({pendingVerifications.length})</h2>
      {pendingVerifications.map(item => (
        <div key={item.providerId} className={`verification-card ${item.verification.risk_level}`}>
          <div className="header">
            <h3>{item.businessName}</h3>
            <span className={`badge ${item.verification.verification_status}`}>
              {item.verification.verification_status}
            </span>
          </div>
          
          <div className="details">
            <p><strong>Confidence:</strong> {item.verification.confidence_score}</p>
            <p><strong>Risk Level:</strong> {item.verification.risk_level}</p>
            <p><strong>Fraud Probability:</strong> {item.verification.fraud_probability}</p>
          </div>
          
          {item.verification.mismatch_fields.length > 0 && (
            <div className="mismatches">
              <strong>Mismatched Fields:</strong>
              <ul>
                {item.verification.mismatch_fields.map(field => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          )}
          
          <p className="explanation">{item.verification.explanation}</p>
          
          <div className="actions">
            <button 
              className="approve-btn"
              onClick={() => handleApprove(item.providerId)}
            >
              Approve
            </button>
            <button 
              className="reject-btn"
              onClick={() => handleReject(item.providerId)}
            >
              Reject
            </button>
            <button 
              className="view-btn"
              onClick={() => viewDocument(item.providerId)}
            >
              View Document
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

## OCR Integration

### Using Tesseract.js (Client-side)

```javascript
import Tesseract from 'tesseract.js';

const extractTextFromImage = async (imageFile) => {
  const { data: { text } } = await Tesseract.recognize(
    imageFile,
    'eng',
    {
      logger: m => console.log(m)
    }
  );
  return text;
};
```

### Using Google Cloud Vision API (Server-side)

```javascript
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

const extractTextFromDocument = async (filePath) => {
  const [result] = await client.documentTextDetection(filePath);
  const fullTextAnnotation = result.fullTextAnnotation;
  return fullTextAnnotation.text;
};
```

## Customization

### Adjust Matching Thresholds

Edit `documentVerifier.js`:

```javascript
// Stricter business name matching
verifyBusinessName(formName, ocrText) {
  const similarity = this.findBestMatch(formName, ocrText);
  const matched = similarity >= 0.85; // was 0.7
  // ...
}

// More lenient address matching
verifyAddress(formAddress, ocrText) {
  // ...
  return {
    matched: similarity >= 0.5, // was 0.6
    // ...
  };
}
```

### Add Custom Suspicious Patterns

```javascript
this.suspiciousPatterns = [
  /photoshop/i,
  /edited/i,
  // Add your patterns
  /fake/i,
  /forged/i,
  /duplicate/i
];
```

### Modify Confidence Adjustments

```javascript
// Adjust for document authenticity
if (!checks.documentAuthenticity.appearsAuthentic) {
  confidenceScore = Math.max(0, confidenceScore - 40); // was 30
}
```

## Test Results

### Example 1: Perfect Match ✅
```
Status: Verified
Confidence: 100%
Risk: Low
Action: Approve
```

### Example 2: Partial Match ⚠️
```
Status: Partially Matched
Confidence: 60%
Risk: Medium
Mismatches: Owner Name, Phone Number
Action: Manual Review
```

### Example 3: Complete Mismatch ❌
```
Status: Suspicious
Confidence: 0%
Risk: High
Mismatches: All fields
Action: Reject
```

### Example 4: Suspicious Patterns 🚫
```
Status: Rejected
Confidence: 0%
Risk: High
Patterns: sample, template, watermark
Action: Reject
```

## Best Practices

1. **OCR Quality**: Use high-quality OCR services for better accuracy
2. **Document Guidelines**: Provide clear guidelines to users about acceptable documents
3. **Manual Review**: Always allow admin override for edge cases
4. **User Feedback**: Explain mismatches clearly to users
5. **Audit Trail**: Log all verification attempts and overrides
6. **Regular Updates**: Update suspicious patterns based on fraud attempts

## Monitoring

Track these metrics:

1. **Verification Rate**
   - Verified: X%
   - Partially Matched: Y%
   - Suspicious: Z%
   - Rejected: W%

2. **Accuracy Metrics**
   - False positive rate
   - False negative rate
   - Manual override rate

3. **Fraud Prevention**
   - Suspicious patterns detected
   - Rejected applications
   - Fraud attempts blocked

## Troubleshooting

### Issue: High false positive rate
**Solution**: Lower matching thresholds, improve OCR quality

### Issue: Missing legitimate matches
**Solution**: Increase threshold tolerance, add more fuzzy matching

### Issue: OCR text quality poor
**Solution**: Use better OCR service, preprocess images

---

**Status**: ✅ Ready for Production
**Last Updated**: February 2026
