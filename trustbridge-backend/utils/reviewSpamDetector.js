/**
 * AI-Powered Review Spam Detection System for TrustBridge
 * Analyzes reviews to detect fake, spam, and manipulative content
 */

class ReviewSpamDetector {
  constructor() {
    // Suspicious keywords that indicate promotional content
    this.promotionalKeywords = [
      'best ever', 'amazing service', 'highly recommend', 'must try',
      'perfect place', '100% satisfied', 'call now', 'contact me',
      'whatsapp', 'phone number', 'visit website', 'click here'
    ];

    // Generic phrases that lack authenticity
    this.genericPhrases = [
      'very good', 'nice place', 'good service', 'excellent',
      'great experience', 'awesome', 'fantastic', 'wonderful'
    ];
  }

  /**
   * Main analysis function
   */
  analyzeReview(reviewData) {
    const {
      reviewText,
      rating,
      accountAgeDays,
      totalReviews,
      reviewsToday,
      similarReviews = []
    } = reviewData;

    const checks = {
      textAnalysis: this.analyzeText(reviewText),
      sentimentCheck: this.checkSentiment(reviewText, rating),
      behavioralContext: this.analyzeBehavior(accountAgeDays, totalReviews, reviewsToday),
      similarityCheck: this.checkSimilarity(reviewText, similarReviews)
    };

    return this.generateClassification(checks, reviewData);
  }

  /**
   * TEXT ANALYSIS
   */
  analyzeText(text) {
    const wordCount = text.trim().split(/\s+/).length;
    const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
    const exclamationCount = (text.match(/!/g) || []).length;
    
    const lowerText = text.toLowerCase();
    const hasPromotionalLanguage = this.promotionalKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
    const hasGenericLanguage = this.genericPhrases.some(phrase => 
      lowerText.includes(phrase)
    );

    // Check for repeated words
    const words = text.toLowerCase().split(/\s+/);
    const wordFrequency = {};
    words.forEach(word => {
      if (word.length > 3) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
    const hasRepeatedWords = Object.values(wordFrequency).some(count => count > 3);

    return {
      isTooShort: wordCount < 10,
      isGeneric: hasGenericLanguage && wordCount < 20,
      hasRepeatedWords,
      excessiveEmojis: emojiCount > 5,
      excessiveExclamation: exclamationCount > 3,
      hasPromotionalLanguage,
      wordCount,
      flags: []
    };
  }

  /**
   * SENTIMENT CHECK
   */
  checkSentiment(text, rating) {
    const wordCount = text.trim().split(/\s+/).length;
    const hasSpecificDetails = this.hasSpecificDetails(text);
    
    const isExtremeRating = rating === 1 || rating === 5;
    const lacksDetails = !hasSpecificDetails && wordCount < 15;

    return {
      isExtreme: isExtremeRating && lacksDetails,
      lacksDetails,
      hasSpecificDetails,
      flags: []
    };
  }

  /**
   * Check if review contains specific experience details
   */
  hasSpecificDetails(text) {
    const detailIndicators = [
      /\d+\s*(day|week|month|year)/i,  // Time references
      /room|apartment|flat|house/i,     // Accommodation specifics
      /owner|landlord|manager/i,        // People references
      /location|area|neighborhood/i,    // Location details
      /clean|dirty|spacious|small/i,    // Descriptive details
      /price|cost|rent|deposit/i        // Financial details
    ];

    return detailIndicators.some(pattern => pattern.test(text));
  }

  /**
   * BEHAVIORAL CONTEXT
   */
  analyzeBehavior(accountAgeDays, totalReviews, reviewsToday) {
    const isNewAccount = accountAgeDays < 7;
    const isSuspiciousVolume = reviewsToday > 3 || (totalReviews > 10 && accountAgeDays < 30);
    const isFirstReview = totalReviews === 1 && accountAgeDays < 1;

    return {
      isNewAccount,
      isSuspiciousVolume,
      isFirstReview,
      reviewRate: accountAgeDays > 0 ? totalReviews / accountAgeDays : totalReviews,
      flags: []
    };
  }

  /**
   * SIMILARITY CHECK
   */
  checkSimilarity(text, similarReviews) {
    if (!similarReviews || similarReviews.length === 0) {
      return {
        hasSimilar: false,
        similarityScore: 0,
        flags: []
      };
    }

    const similarities = similarReviews.map(similar => 
      this.calculateSimilarity(text, similar)
    );

    const maxSimilarity = Math.max(...similarities);
    const hasSimilar = maxSimilarity > 0.7;

    return {
      hasSimilar,
      similarityScore: maxSimilarity,
      flags: []
    };
  }

  /**
   * Calculate text similarity (simple Jaccard similarity)
   */
  calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * GENERATE CLASSIFICATION
   */
  generateClassification(checks, reviewData) {
    const flags = [];
    let riskScore = 0;

    // Text Analysis Flags
    if (checks.textAnalysis.isTooShort) {
      flags.push('Review is too short (less than 10 words)');
      riskScore += 15;
    }
    if (checks.textAnalysis.isGeneric) {
      flags.push('Contains generic language without specific details');
      riskScore += 20;
    }
    if (checks.textAnalysis.hasRepeatedWords) {
      flags.push('Contains repeated words');
      riskScore += 10;
    }
    if (checks.textAnalysis.excessiveEmojis) {
      flags.push('Excessive emoji usage');
      riskScore += 15;
    }
    if (checks.textAnalysis.excessiveExclamation) {
      flags.push('Excessive exclamation marks');
      riskScore += 10;
    }
    if (checks.textAnalysis.hasPromotionalLanguage) {
      flags.push('Contains promotional or marketing language');
      riskScore += 25;
    }

    // Sentiment Flags
    if (checks.sentimentCheck.isExtreme) {
      flags.push('Extreme rating without supporting details');
      riskScore += 20;
    }
    if (checks.sentimentCheck.lacksDetails) {
      flags.push('Lacks specific experience details');
      riskScore += 15;
    }

    // Behavioral Flags
    if (checks.behavioralContext.isNewAccount && reviewData.totalReviews > 5) {
      flags.push('New account with multiple reviews');
      riskScore += 25;
    }
    if (checks.behavioralContext.isSuspiciousVolume) {
      flags.push('Suspicious review volume pattern');
      riskScore += 30;
    }
    if (checks.behavioralContext.reviewRate > 2) {
      flags.push('Unusually high review posting rate');
      riskScore += 20;
    }

    // Similarity Flags
    if (checks.similarityCheck.hasSimilar) {
      flags.push(`High similarity to other reviews (${(checks.similarityCheck.similarityScore * 100).toFixed(0)}%)`);
      riskScore += 35;
    }

    // Determine classification
    let classification, riskLevel, trustScoreAdjustment;
    
    if (riskScore >= 60) {
      classification = 'Fake';
      riskLevel = 'High';
      trustScoreAdjustment = 'Decrease';
    } else if (riskScore >= 30) {
      classification = 'Suspicious';
      riskLevel = 'Medium';
      trustScoreAdjustment = 'No Change';
    } else {
      classification = 'Genuine';
      riskLevel = 'Low';
      trustScoreAdjustment = 'Increase';
    }

    const confidenceScore = Math.min(95, Math.max(50, riskScore > 0 ? riskScore + 20 : 85));

    return {
      classification,
      confidence_score: `${confidenceScore}%`,
      risk_level: riskLevel,
      detailed_reasoning: this.generateReasoning(flags, checks, reviewData, classification),
      trust_score_adjustment: trustScoreAdjustment,
      risk_score: riskScore,
      flags
    };
  }

  /**
   * Generate detailed reasoning
   */
  generateReasoning(flags, checks, reviewData, classification) {
    if (classification === 'Genuine') {
      return `This review appears genuine. It contains ${checks.textAnalysis.wordCount} words with ${checks.sentimentCheck.hasSpecificDetails ? 'specific experience details' : 'reasonable content'}. The user account is ${reviewData.accountAgeDays} days old with ${reviewData.totalReviews} total reviews, showing normal behavior patterns. No significant red flags detected.`;
    }

    if (classification === 'Suspicious') {
      return `This review shows suspicious patterns: ${flags.slice(0, 3).join('; ')}. While not definitively fake, it exhibits characteristics common in manipulated reviews. Manual review recommended.`;
    }

    // Fake
    return `This review is likely fake or spam. Multiple red flags detected: ${flags.slice(0, 4).join('; ')}. The combination of ${flags.length} suspicious indicators suggests this is not a genuine user experience.`;
  }
}

module.exports = ReviewSpamDetector;
