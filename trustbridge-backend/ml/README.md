# 🤖 ML Fake Review Detection System

## Overview

This directory contains the Machine Learning system for detecting fake reviews in TrustBridge. The system uses a hybrid approach combining rule-based detection with ML predictions.

## 📁 Directory Structure

```
ml/
├── requirements.txt          # Python dependencies
├── preprocess.py            # Text preprocessing utilities
├── train_model.py           # Model training script
├── predict_service.py       # Flask API for predictions
├── data/                    # Dataset directory
│   └── fake_reviews_dataset.csv
└── models/                  # Trained models (generated)
    ├── ml_model.pkl
    ├── tfidf_vectorizer.pkl
    └── model_metadata.pkl
```

## 🚀 Setup Instructions

### Step 1: Install Python Dependencies

```bash
cd trustbridge-backend/ml
pip install -r requirements.txt
```

Or using a virtual environment (recommended):

```bash
cd trustbridge-backend/ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Download Dataset

Download a fake reviews dataset from Kaggle:

**Recommended Datasets:**
1. [Amazon Fake Reviews Dataset](https://www.kaggle.com/datasets)
2. [Yelp Fake Reviews Dataset](https://www.kaggle.com/datasets)
3. [Deceptive Opinion Spam Dataset](https://www.kaggle.com/datasets)

Place the CSV file in the `data/` directory:
```bash
mkdir -p data
# Copy your downloaded dataset
cp /path/to/fake_reviews_dataset.csv data/
```

**Dataset Requirements:**
- Must be in CSV format
- Must contain a text column (review_text, text, review, content, or comment)
- Must contain a label column (label, is_fake, fake, class, or target)
- Labels should be binary: 0 = genuine, 1 = fake

### Step 3: Train the Model

```bash
python train_model.py
```

This will:
- Load and preprocess the dataset
- Create TF-IDF features
- Train multiple models (Logistic Regression, Naive Bayes, Random Forest)
- Select the best model based on F1 score
- Save the trained model to `models/`

**Expected Output:**
```
📂 Loading dataset...
✅ Found text column: review_text
✅ Found label column: label
📊 Dataset size: 10000 reviews
   Genuine: 5000
   Fake: 5000

🔄 Preprocessing text...
✅ Preprocessing complete

🔢 Creating TF-IDF features...
✅ Feature matrix shape: (10000, 5000)

✂️ Splitting data...
   Training set: 8000 samples
   Test set: 2000 samples

🤖 Training models...

📊 Training Logistic Regression...
   Accuracy:  0.8950
   Precision: 0.8876
   Recall:    0.9024
   F1 Score:  0.8949

🏆 Best model: Logistic Regression
   F1 Score: 0.8949

💾 Saving models...
✅ Models saved successfully!
🎉 Training complete!
```

### Step 4: Start the ML Prediction Service

```bash
python predict_service.py
```

The Flask API will start on `http://localhost:5001`

**Endpoints:**
- `GET /health` - Health check
- `POST /predict` - Predict single review
- `POST /batch_predict` - Predict multiple reviews

**Test the service:**
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"review_text": "This is an amazing service! Best ever! Call now!"}'
```

**Expected Response:**
```json
{
  "genuine_probability": 0.1234,
  "fake_probability": 0.8766,
  "prediction": "fake",
  "confidence": 0.8766
}
```

## 🔧 Integration with Node.js Backend

The ML service is integrated with the Node.js backend through `utils/mlReviewPredictor.js`.

**Environment Variable:**
```bash
# In trustbridge-backend/.env
ML_SERVICE_URL=http://localhost:5001
```

**Usage in Review Controller:**
```javascript
const MLReviewPredictor = require('../utils/mlReviewPredictor');
const mlPredictor = new MLReviewPredictor();

// Get prediction
const mlResult = await mlPredictor.predict(reviewText);
console.log(mlResult.fakeProbability); // 0.8766
```

## 📊 Hybrid Detection System

The system combines two detection methods:

### 1. Rule-Based Detection (reviewSpamDetector.js)
- Text analysis (length, emojis, repeated words)
- Sentiment checks (extreme ratings without details)
- Behavioral analysis (account age, review volume)
- Similarity checks (duplicate content)
- **Output:** Risk score 0-100

### 2. ML Prediction (predict_service.py)
- TF-IDF feature extraction
- Trained classification model
- Probability-based prediction
- **Output:** Fake probability 0-1 (converted to score 0-100)

### 3. Final Classification
```
FinalRiskScore = RuleBasedScore + MLScore

If FinalRiskScore >= 60:
    Status = FAKE (Block immediately)
Else If FinalRiskScore >= 30:
    Status = SUSPICIOUS (Admin review required)
Else:
    Status = GENUINE (Auto-approve)
```

## 🛠️ Troubleshooting

### Issue: Dataset not found
```
❌ Dataset not found!
```
**Solution:** Download a dataset and place it in `ml/data/fake_reviews_dataset.csv`

### Issue: NLTK data not found
```
LookupError: Resource punkt not found
```
**Solution:** The script will auto-download NLTK data. If it fails, run:
```python
import nltk
nltk.download('punkt')
nltk.download('stopwords')
```

### Issue: ML service connection error
```
❌ ML prediction error: connect ECONNREFUSED
```
**Solution:** Make sure the ML service is running:
```bash
cd trustbridge-backend/ml
python predict_service.py
```

### Issue: Model files not found
```
❌ Error loading models: [Errno 2] No such file or directory: 'models/ml_model.pkl'
```
**Solution:** Train the model first:
```bash
python train_model.py
```

## 📈 Performance Metrics

The system aims for:
- **Accuracy:** >85%
- **Precision:** >85% (minimize false positives)
- **Recall:** >85% (catch most fake reviews)
- **F1 Score:** >85% (balanced performance)
- **Prediction Time:** <200ms per review

## 🔄 Retraining the Model

To retrain with new data:

1. Add new labeled reviews to your dataset
2. Run the training script:
```bash
python train_model.py
```
3. Restart the ML service:
```bash
# Stop the current service (Ctrl+C)
python predict_service.py
```

## 📝 Notes

- The ML service runs independently from the Node.js backend
- If the ML service is unavailable, the system falls back to rule-based detection only
- Keep the ML service running in production for best results
- Consider using a process manager like PM2 or systemd for production deployment

## 🚀 Production Deployment

For production, consider:

1. **Use a process manager:**
```bash
pm2 start predict_service.py --name ml-service --interpreter python3
```

2. **Add monitoring:**
- Health check endpoint: `GET /health`
- Log prediction times and errors
- Set up alerts for service downtime

3. **Scale horizontally:**
- Run multiple instances behind a load balancer
- Use Redis for caching predictions

4. **Security:**
- Add API authentication
- Rate limiting
- Input validation

## 📚 Additional Resources

- [Scikit-learn Documentation](https://scikit-learn.org/)
- [NLTK Documentation](https://www.nltk.org/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [TF-IDF Explained](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)
