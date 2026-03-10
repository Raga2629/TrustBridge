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
