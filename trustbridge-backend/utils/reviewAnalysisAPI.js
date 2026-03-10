/**
 * Simple API wrapper that matches the exact prompt format
 * Returns strict JSON output as specified
 */

const ReviewSpamDetector = require('./reviewSpamDetector');

/**
 * Analyze review with exact JSON format output
 * @param {Object} input - Review data matching prompt variables
 * @returns {Object} - Strict JSON response
 */
function analyzeReviewPromptFormat(input) {
  const {
    REVIEW_TEXT,
    RATING,
    ACCOUNT_AGE_DAYS,
    TOTAL_REVIEWS,
    REVIEWS_TODAY
  } = input;

  // Validate required fields
  if (!REVIEW_TEXT || RATING === undefined) {
    throw new Error('REVIEW_TEXT and RATING are required');
  }

  // Prepare data for detector
  const reviewData = {
    reviewText: REVIEW_TEXT,
    rating: parseInt(RATING),
    accountAgeDays: parseInt(ACCOUNT_AGE_DAYS) || 0,
    totalReviews: parseInt(TOTAL_REVIEWS) || 0,
    reviewsToday: parseInt(REVIEWS_TODAY) || 0,
    similarReviews: []
  };

  // Run analysis
  const detector = new ReviewSpamDetector();
  const analysis = detector.analyzeReview(reviewData);

  // Return in exact format specified in prompt
  return {
    classification: analysis.classification,
    confidence_score: analysis.confidence_score,
    risk_level: analysis.risk_level,
    detailed_reasoning: analysis.detailed_reasoning,
    trust_score_adjustment: analysis.trust_score_adjustment
  };
}

/**
 * Example usage matching the prompt template
 */
function exampleUsage() {
  console.log('='.repeat(80));
  console.log('TRUSTBRIDGE REVIEW ANALYSIS - PROMPT FORMAT');
  console.log('='.repeat(80));
  console.log();

  const examples = [
    {
      name: 'Example 1: Genuine Review',
      input: {
        REVIEW_TEXT: 'I stayed here for 2 months during my relocation. The apartment was clean, well-maintained, and the landlord was very responsive. The location is convenient with good access to markets and public transport. Rent was reasonable at 15000 per month. Would recommend for newcomers to the area.',
        RATING: 4,
        ACCOUNT_AGE_DAYS: 60,
        TOTAL_REVIEWS: 3,
        REVIEWS_TODAY: 1
      }
    },
    {
      name: 'Example 2: Suspicious Review',
      input: {
        REVIEW_TEXT: 'Very good place. Amazing service.',
        RATING: 5,
        ACCOUNT_AGE_DAYS: 2,
        TOTAL_REVIEWS: 10,
        REVIEWS_TODAY: 4
      }
    },
    {
      name: 'Example 3: Fake Review',
      input: {
        REVIEW_TEXT: 'Best place ever!!! 100% satisfied!!! Must try!!! Call now!!!',
        RATING: 5,
        ACCOUNT_AGE_DAYS: 1,
        TOTAL_REVIEWS: 20,
        REVIEWS_TODAY: 8
      }
    }
  ];

  examples.forEach(example => {
    console.log(`\n${example.name}`);
    console.log('-'.repeat(80));
    console.log('INPUT:');
    console.log(`Review Text: "${example.input.REVIEW_TEXT}"`);
    console.log(`Rating Given: ${example.input.RATING} stars`);
    console.log(`User Account Age: ${example.input.ACCOUNT_AGE_DAYS} days`);
    console.log(`Number of Reviews Posted by User: ${example.input.TOTAL_REVIEWS}`);
    console.log(`Reviews Posted Today: ${example.input.REVIEWS_TODAY}`);
    console.log();
    console.log('OUTPUT (STRICT JSON):');
    
    const result = analyzeReviewPromptFormat(example.input);
    console.log(JSON.stringify(result, null, 2));
    console.log();
  });

  console.log('='.repeat(80));
}

module.exports = {
  analyzeReviewPromptFormat,
  exampleUsage
};

// Run examples if executed directly
if (require.main === module) {
  exampleUsage();
}
