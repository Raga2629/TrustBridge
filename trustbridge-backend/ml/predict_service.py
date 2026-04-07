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
