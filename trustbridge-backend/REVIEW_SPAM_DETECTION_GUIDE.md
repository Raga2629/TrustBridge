# 🛡️ TrustBridge Review Spam Detection System

## Overview

AI-powered system to detect fake, spam, and manipulative reviews on the TrustBridge platform.

## Features

### Detection Capabilities

1. **Text Analysis**
   - Short reviews (< 10 words)
   - Generic language detection
   - Repeated word patterns
   - Excessive emojis/exclamation marks
   - Promotional language

2. **Sentiment Analysis**
   - Extreme ratings without details
   - Lack of specific experiences
   - Unnatural positive/negative sentiment

3. **Behavioral Analysis**
   - New account patterns
   - Suspicious review volume
   - High posting frequency
   - First-time reviewer patterns

4. **Similarity Detection**
   - Duplicate content detection
   - Template-based reviews
   - Copy-paste patterns

## Quick Start

### 1. Test the System

```bash
cd trustbridge-backend
node testReviewAnalysis.js
```

### 2. Add Routes to Server

Add to `server.js`:

```javascript
const reviewAnalysisRoutes = require('./routes/reviewAnalysisRoutes');
app.use('/api/review-analysis', reviewAnalysisRoutes);
```

### 3. API Endpoints

#### Analyze Single Review
```
POST /api/review-analysis/analyze
```

Request body:
```json
{
  "reviewText": "Great place to stay...",
  "rating": 5,
  "propertyId": "property_id_here",
  "userId": "user_id_here"
}
```

Response:
```json
{
  "success": true,
  "analysis": {
    "classification": "Genuine / Suspicious / Fake",
    "confidence_score": "85%",
    "risk_level": "Low / Medium / High",
    "detailed_reasoning": "Explanation...",
    "trust_score_adjustment": "Increase / No Change / Decrease",
    "risk_score": 15,
    "flags": []
  }
}
```

#### Batch Analyze Reviews
```
GET /api/review-analysis/batch-analyze?propertyId=xxx&limit=50
```

#### Get Review Analysis
```
GET /api/review-analysis/:reviewId
```

## Classification Logic

### Risk Score Calculation

| Check | Points |
|-------|--------|
| Too short (< 10 words) | +15 |
| Generic language | +20 |
| Repeated words | +10 |
| Excessive emojis | +15 |
| Excessive exclamation | +10 |
| Promotional language | +25 |
| Extreme rating without details | +20 |
| Lacks specific details | +15 |
| New account + multiple reviews | +25 |
| Suspicious volume | +30 |
| High posting rate | +20 |
| High similarity to others | +35 |

### Classification Thresholds

- **Genuine**: Risk Score < 30
- **Suspicious**: Risk Score 30-59
- **Fake**: Risk Score ≥ 60

## Integration Examples

### Frontend - Before Submitting Review

```javascript
const analyzeReview = async (reviewData) => {
  try {
    const response = await fetch('/api/review-analysis/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });

    const result = await response.json();
    
    if (result.analysis.classification === 'Fake') {
      alert('This review appears to be spam and cannot be posted.');
      return false;
    }
    
    if (result.analysis.classification === 'Suspicious') {
      const confirm = window.confirm(
        'This review shows suspicious patterns. Are you sure you want to post it?'
      );
      return confirm;
    }
    
    return true; // Genuine review
  } catch (error) {
    console.error('Review analysis error:', error);
    return true; // Allow posting if analysis fails
  }
};
```

### Admin Dashboard - Review Moderation

```javascript
const moderateReviews = async () => {
  const response = await fetch('/api/review-analysis/batch-analyze?limit=100', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const data = await response.json();
  
  // Show suspicious and fake reviews for manual review
  const flaggedReviews = data.results.filter(
    r => r.analysis.classification !== 'Genuine'
  );
  
  displayFlaggedReviews(flaggedReviews);
};
```

## Test Results

Run `node testReviewAnalysis.js` to see:

- ✅ Genuine reviews (detailed, specific)
- ⚠️ Suspicious reviews (generic, short)
- ❌ Fake reviews (promotional, spam)

## Customization

### Adjust Detection Sensitivity

Edit `reviewSpamDetector.js`:

```javascript
// Make detection stricter
if (riskScore >= 50) { // was 60
  classification = 'Fake';
}

// Make detection more lenient
if (riskScore >= 70) { // was 60
  classification = 'Fake';
}
```

### Add Custom Keywords

```javascript
this.promotionalKeywords = [
  'best ever', 'amazing service',
  // Add your keywords
  'limited offer', 'book now'
];
```

## Database Schema (Optional)

If you want to store analysis results:

```javascript
const reviewAnalysisSchema = new mongoose.Schema({
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  classification: {
    type: String,
    enum: ['Genuine', 'Suspicious', 'Fake'],
    required: true
  },
  riskScore: Number,
  confidenceScore: String,
  flags: [String],
  analyzedAt: {
    type: Date,
    default: Date.now
  }
});
```

## Best Practices

1. **Real-time Analysis**: Analyze reviews before posting
2. **Batch Moderation**: Regularly review flagged content
3. **User Education**: Show warnings for suspicious patterns
4. **Manual Review**: Always allow admin override
5. **Continuous Improvement**: Update keywords based on new spam patterns

## Monitoring

Track these metrics:
- Total reviews analyzed
- Classification distribution
- False positive rate
- User appeal rate
- Spam prevention effectiveness

## Support

For issues or questions:
1. Check test results: `node testReviewAnalysis.js`
2. Review logs in console
3. Adjust sensitivity thresholds
4. Update keyword lists

---

**Status**: ✅ Ready for Production
**Last Updated**: February 2026
