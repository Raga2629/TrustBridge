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
