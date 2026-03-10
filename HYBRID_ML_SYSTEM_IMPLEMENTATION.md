# 🤖 Hybrid ML Fake Review Detection System - Complete Implementation Guide

## Overview

This guide implements a **Hybrid Fake Review Detection System** combining:
1. Rule-based detection (existing)
2. Machine Learning predictions (new)
3. Admin moderation workflow

---

## 📁 Project Structure

```
trustbridge-backend/
├── ml/
│   ├── requirements.txt
│   ├── train_model.py
│   ├── predict_service.py
│   ├── preprocess.py
│   ├── models/
│   │   ├── ml_model.pkl
│   │   └── tfidf_vectorizer.pkl
│   └── data/
│       └── fake_reviews_dataset.csv
├── utils/
│   ├── reviewSpamDetector.js (existing)
│   └── mlReviewPredictor.js (new)
├── controllers/
│   ├── reviewController.js (update)
│   └── adminReviewController.js (new)
├── models/
│   └── Review.js (update)
└── routes/
    └── adminReviewRoutes.js (new)
```

---

## STEP 1: Python ML Training Pipeline

### File: `trustbridge-backend/ml/requirements.txt`

```txt
pandas==2.0.3
numpy==1.24.3
scikit-learn==1.3.0
nltk==3.8.1
joblib==1.3.2
flask==2.3.3
flask-cors==4.0.0
```

### File: `trustbridge-backend/ml/preprocess.py`

```python
import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

class TextPreprocessor:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
    
    def preprocess(self, text):
        """
        Preprocess review text for ML model
        """
        if not text or not isinstance(text, str):
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove phone numbers
        text = re.sub(r'\d{10}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', '', text)
        
        # Remove punctuation
        text = text.translate(str.maketrans('', '', string.punctuation))
        
        # Remove numbers
        text = re.sub(r'\d+', '', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords
        tokens = [word for word in tokens if word not in self.stop_words and len(word) > 2]
        
        # Join back to string
        return ' '.join(tokens)
```

### File: `trustbridge-backend/ml/train_model.py`

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import joblib
from preprocess import TextPreprocessor
import os

class FakeReviewModelTrainer:
    def __init__(self, dataset_path):
        self.dataset_path = dataset_path
        self.preprocessor = TextPreprocessor()
        self.vectorizer = None
        self.best_model = None
        self.best_model_name = None
        
    def load_data(self):
        """Load and prepare dataset"""
        print("📂 Loading dataset...")
        
        # Try different possible column names
        df = pd.read_csv(self.dataset_path)
        
        # Identify text and label columns
        possible_text_cols = ['review_text', 'text', 'review', 'content', 'comment']
        possible_label_cols = ['label', 'is_fake', 'fake', 'class', 'target']
        
        text_col = None
        label_col = None
        
        for col in possible_text_cols:
            if col in df.columns:
                text_col = col
                break
        
        for col in possible_label_cols:
            if col in df.columns:
                label_col = col
                break
        
        if not text_col or not label_col:
            raise ValueError(f"Could not find text or label columns. Available columns: {df.columns.tolist()}")
        
        print(f"✅ Found text column: {text_col}")
        print(f"✅ Found label column: {label_col}")
        
        # Prepare data
        self.X = df[text_col].fillna('')
        self.y = df[label_col]
        
        # Ensure binary labels (0 = genuine, 1 = fake)
        if self.y.dtype == 'object':
            # Convert string labels to binary
            fake_labels = ['fake', 'spam', '1', 'yes', 'true']
            self.y = self.y.str.lower().apply(lambda x: 1 if x in fake_labels else 0)
        
        print(f"📊 Dataset size: {len(self.X)} reviews")
        print(f"   Genuine: {(self.y == 0).sum()}")
        print(f"   Fake: {(self.y == 1).sum()}")
        
    def preprocess_data(self):
        """Preprocess all reviews"""
        print("\n🔄 Preprocessing text...")
        self.X_processed = self.X.apply(self.preprocessor.preprocess)
        print("✅ Preprocessing complete")
        
    def create_features(self):
        """Convert text to TF-IDF features"""
        print("\n🔢 Creating TF-IDF features...")
        
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95
        )
        
        self.X_tfidf = self.vectorizer.fit_transform(self.X_processed)
        print(f"✅ Feature matrix shape: {self.X_tfidf.shape}")
        
    def split_data(self):
        """Split into train and test sets"""
        print("\n✂️ Splitting data...")
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            self.X_tfidf, self.y, 
            test_size=0.2, 
            random_state=42,
            stratify=self.y
        )
        print(f"   Training set: {self.X_train.shape[0]} samples")
        print(f"   Test set: {self.X_test.shape[0]} samples")
        
    def train_models(self):
        """Train multiple models and select the best"""
        print("\n🤖 Training models...")
        
        models = {
            'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
            'Naive Bayes': MultinomialNB(),
            'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
        }
        
        results = {}
        
        for name, model in models.items():
            print(f"\n📊 Training {name}...")
            model.fit(self.X_train, self.y_train)
            
            # Predictions
            y_pred = model.predict(self.X_test)
            
            # Metrics
            accuracy = accuracy_score(self.y_test, y_pred)
            precision = precision_score(self.y_test, y_pred)
            recall = recall_score(self.y_test, y_pred)
            f1 = f1_score(self.y_test, y_pred)
            
            results[name] = {
                'model': model,
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1': f1
            }
            
            print(f"   Accuracy:  {accuracy:.4f}")
            print(f"   Precision: {precision:.4f}")
            print(f"   Recall:    {recall:.4f}")
            print(f"   F1 Score:  {f1:.4f}")
        
        # Select best model based on F1 score
        self.best_model_name = max(results, key=lambda x: results[x]['f1'])
        self.best_model = results[self.best_model_name]['model']
        
        print(f"\n🏆 Best model: {self.best_model_name}")
        print(f"   F1 Score: {results[self.best_model_name]['f1']:.4f}")
        
        # Detailed classification report
        y_pred_best = self.best_model.predict(self.X_test)
        print("\n📋 Classification Report:")
        print(classification_report(self.y_test, y_pred_best, 
                                   target_names=['Genuine', 'Fake']))
        
    def save_models(self):
        """Save trained model and vectorizer"""
        print("\n💾 Saving models...")
        
        os.makedirs('models', exist_ok=True)
        
        joblib.dump(self.best_model, 'models/ml_model.pkl')
        joblib.dump(self.vectorizer, 'models/tfidf_vectorizer.pkl')
        
        # Save metadata
        metadata = {
            'model_type': self.best_model_name,
            'features': self.X_tfidf.shape[1],
            'training_samples': self.X_train.shape[0]
        }
        joblib.dump(metadata, 'models/model_metadata.pkl')
        
        print("✅ Models saved successfully!")
        print("   - models/ml_model.pkl")
        print("   - models/tfidf_vectorizer.pkl")
        print("   - models/model_metadata.pkl")
        
    def train(self):
        """Complete training pipeline"""
        self.load_data()
        self.preprocess_data()
        self.create_features()
        self.split_data()
        self.train_models()
        self.save_models()
        print("\n🎉 Training complete!")

if __name__ == "__main__":
    # Update this path to your dataset
    DATASET_PATH = "data/fake_reviews_dataset.csv"
    
    if not os.path.exists(DATASET_PATH):
        print("❌ Dataset not found!")
        print(f"   Please download a fake reviews dataset and place it at: {DATASET_PATH}")
        print("\n📥 Recommended datasets:")
        print("   1. Kaggle: Amazon Fake Reviews Dataset")
        print("   2. Kaggle: Yelp Fake Reviews Dataset")
        print("   3. UCI ML Repository: Deceptive Opinion Spam Dataset")
        exit(1)
    
    trainer = FakeReviewModelTrainer(DATASET_PATH)
    trainer.train()
```

### File: `trustbridge-backend/ml/predict_service.py`

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
from preprocess import TextPreprocessor

app = Flask(__name__)
CORS(app)

# Load models at startup
print("🔄 Loading ML models...")
try:
    model = joblib.load('models/ml_model.pkl')
    vectorizer = joblib.load('models/tfidf_vectorizer.pkl')
    metadata = joblib.load('models/model_metadata.pkl')
    preprocessor = TextPreprocessor()
    print("✅ Models loaded successfully!")
    print(f"   Model type: {metadata['model_type']}")
    print(f"   Features: {metadata['features']}")
except Exception as e:
    print(f"❌ Error loading models: {e}")
    print("   Please run train_model.py first!")
    exit(1)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_type': metadata['model_type'],
        'features': metadata['features']
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict if a review is fake"""
    try:
        data = request.get_json()
        
        if not data or 'review_text' not in data:
            return jsonify({'error': 'review_text is required'}), 400
        
        review_text = data['review_text']
        
        if not review_text or len(review_text.strip()) == 0:
            return jsonify({'error': 'review_text cannot be empty'}), 400
        
        # Preprocess
        processed_text = preprocessor.preprocess(review_text)
        
        # Vectorize
        features = vectorizer.transform([processed_text])
        
        # Predict probabilities
        probabilities = model.predict_proba(features)[0]
        
        # probabilities[0] = genuine, probabilities[1] = fake
        genuine_prob = float(probabilities[0])
        fake_prob = float(probabilities[1])
        
        # Predict class
        prediction = model.predict(features)[0]
        
        result = {
            'genuine_probability': round(genuine_prob, 4),
            'fake_probability': round(fake_prob, 4),
            'prediction': 'fake' if prediction == 1 else 'genuine',
            'confidence': round(max(genuine_prob, fake_prob), 4)
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    """Predict multiple reviews at once"""
    try:
        data = request.get_json()
        
        if not data or 'reviews' not in data:
            return jsonify({'error': 'reviews array is required'}), 400
        
        reviews = data['reviews']
        
        if not isinstance(reviews, list):
            return jsonify({'error': 'reviews must be an array'}), 400
        
        results = []
        
        for review_text in reviews:
            if not review_text or len(review_text.strip()) == 0:
                results.append({'error': 'empty review'})
                continue
            
            # Preprocess
            processed_text = preprocessor.preprocess(review_text)
            
            # Vectorize
            features = vectorizer.transform([processed_text])
            
            # Predict
            probabilities = model.predict_proba(features)[0]
            prediction = model.predict(features)[0]
            
            results.append({
                'genuine_probability': round(float(probabilities[0]), 4),
                'fake_probability': round(float(probabilities[1]), 4),
                'prediction': 'fake' if prediction == 1 else 'genuine'
            })
        
        return jsonify({'results': results})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n🚀 Starting ML Prediction Service...")
    print("   Endpoint: http://localhost:5001")
    print("   Health: GET /health")
    print("   Predict: POST /predict")
    print("   Batch: POST /batch_predict")
    app.run(host='0.0.0.0', port=5001, debug=False)
```

---

## STEP 2: Node.js Integration

### File: `trustbridge-backend/utils/mlReviewPredictor.js`

```javascript
const axios = require('axios');

class MLReviewPredictor {
  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    this.timeout = 5000; // 5 second timeout
  }

  /**
   * Get ML prediction for a review
   */
  async predict(reviewText) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/predict`,
        { review_text: reviewText },
        { timeout: this.timeout }
      );

      return {
        success: true,
        fakeProbability: response.data.fake_probability,
        genuineProbability: response.data.genuine_probability,
        prediction: response.data.prediction,
        confidence: response.data.confidence
      };
    } catch (error) {
      console.error('❌ ML prediction error:', error.message);
      
      // Return neutral score if ML service fails
      return {
        success: false,
        fakeProbability: 0.5,
        genuineProbability: 0.5,
        prediction: 'unknown',
        confidence: 0,
        error: error.message
      };
    }
  }

  /**
   * Check if ML service is available
   */
  async healthCheck() {
    try {
      const response = await axios.get(
        `${this.mlServiceUrl}/health`,
        { timeout: 2000 }
      );
      return response.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert ML probability to risk score (0-100)
   */
  mlProbabilityToScore(fakeProbability) {
    return Math.round(fakeProbability * 100);
  }
}

module.exports = MLReviewPredictor;
```

---

*Due to length constraints, I'll create the remaining files in the next response. This includes:*
- Updated Review model
- Updated review controller with hybrid detection
- Admin review controller
- Admin moderation frontend
- Complete setup guide

Would you like me to continue with the remaining implementation files?
