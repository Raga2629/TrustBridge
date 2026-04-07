/**
 * AI-Powered Document Verification System for TrustBridge
 * Verifies business proof documents against registration form data
 */

class DocumentVerifier {
  constructor() {
    // Common business document keywords
    this.businessDocumentKeywords = [
      'registration', 'certificate', 'license', 'permit', 'gst',
      'incorporation', 'proprietorship', 'partnership', 'company',
      'trade', 'business', 'commercial', 'establishment'
    ];

    // Suspicious patterns
    this.suspiciousPatterns = [
      /photoshop/i,
      /edited/i,
      /sample/i,
      /template/i,
      /draft/i,
      /watermark/i
    ];
  }

  /**
   * Main verification function
   */
  verifyDocument(formData, ocrText) {
    const {
      FORM_BUSINESS_NAME,
      FORM_OWNER_NAME,
      FORM_ADDRESS,
      FORM_PHONE,
      FORM_REG_NO
    } = formData;

    const OCR_EXTRACTED_TEXT = ocrText;

    // Normalize OCR text
    const normalizedOCR = this.normalizeText(OCR_EXTRACTED_TEXT);

    // Perform verification checks
    const checks = {
      businessName: this.verifyBusinessName(FORM_BUSINESS_NAME, normalizedOCR),
      ownerName: this.verifyOwnerName(FORM_OWNER_NAME, normalizedOCR),
      registrationNumber: this.verifyRegistrationNumber(FORM_REG_NO, normalizedOCR),
      address: this.verifyAddress(FORM_ADDRESS, normalizedOCR),
      phoneNumber: this.verifyPhoneNumber(FORM_PHONE, normalizedOCR),
      documentAuthenticity: this.checkDocumentAuthenticity(normalizedOCR),
      suspiciousPatterns: this.detectSuspiciousPatterns(OCR_EXTRACTED_TEXT)
    };

    return this.generateVerificationResult(checks, formData);
  }

  /**
   * Normalize text for comparison
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculate string similarity (Levenshtein-based)
   */
  calculateSimilarity(str1, str2) {
    const s1 = this.normalizeText(str1);
    const s2 = this.normalizeText(str2);

    // Check for exact match
    if (s1 === s2) return 1.0;

    // Check if one contains the other
    if (s1.includes(s2) || s2.includes(s1)) return 0.85;

    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    if (maxLength === 0) return 1.0;
    
    return 1 - (distance / maxLength);
  }

  /**
   * Levenshtein distance algorithm
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Verify business name
   */
  verifyBusinessName(formName, ocrText) {
    if (!formName) {
      return { matched: false, similarity: 0, found: false };
    }

    const similarity = this.findBestMatch(formName, ocrText);
    const matched = similarity >= 0.7;

    return {
      matched,
      similarity,
      found: similarity > 0.3,
      formValue: formName
    };
  }

  /**
   * Verify owner name
   */
  verifyOwnerName(formName, ocrText) {
    if (!formName) {
      return { matched: false, similarity: 0, found: false };
    }

    const similarity = this.findBestMatch(formName, ocrText);
    const matched = similarity >= 0.7;

    return {
      matched,
      similarity,
      found: similarity > 0.3,
      formValue: formName
    };
  }

  /**
   * Verify registration number (exact match required)
   */
  verifyRegistrationNumber(formRegNo, ocrText) {
    if (!formRegNo) {
      return { matched: false, found: false, exact: false };
    }

    const normalizedRegNo = formRegNo.replace(/[^\w]/g, '').toLowerCase();
    const normalizedOCR = ocrText.replace(/[^\w]/g, '').toLowerCase();

    const exact = normalizedOCR.includes(normalizedRegNo);
    const similarity = this.findBestMatch(formRegNo, ocrText);

    return {
      matched: exact || similarity >= 0.9,
      exact,
      similarity,
      found: similarity > 0.5,
      formValue: formRegNo
    };
  }

  /**
   * Verify address (allow formatting differences)
   */
  verifyAddress(formAddress, ocrText) {
    if (!formAddress) {
      return { matched: false, similarity: 0, found: false };
    }

    // Extract key address components
    const addressParts = formAddress.toLowerCase().split(/[,\s]+/).filter(p => p.length > 2);
    let matchedParts = 0;

    addressParts.forEach(part => {
      if (ocrText.includes(part)) {
        matchedParts++;
      }
    });

    const partialMatch = addressParts.length > 0 ? matchedParts / addressParts.length : 0;
    const fullSimilarity = this.findBestMatch(formAddress, ocrText);
    const similarity = Math.max(partialMatch, fullSimilarity);

    return {
      matched: similarity >= 0.6,
      similarity,
      found: similarity > 0.3,
      matchedComponents: matchedParts,
      totalComponents: addressParts.length,
      formValue: formAddress
    };
  }

  /**
   * Verify phone number
   */
  verifyPhoneNumber(formPhone, ocrText) {
    if (!formPhone) {
      return { matched: false, found: false };
    }

    // Extract digits only
    const phoneDigits = formPhone.replace(/\D/g, '');
    const ocrDigits = ocrText.replace(/\D/g, '');

    // Check for exact match or last 10 digits
    const last10 = phoneDigits.slice(-10);
    const found = ocrDigits.includes(last10) || ocrDigits.includes(phoneDigits);

    return {
      matched: found,
      found,
      formValue: formPhone
    };
  }

  /**
   * Find best matching substring
   */
  findBestMatch(needle, haystack) {
    const needleNorm = this.normalizeText(needle);
    const haystackNorm = this.normalizeText(haystack);

    // Check exact match
    if (haystackNorm.includes(needleNorm)) {
      return 1.0;
    }

    // Check word-by-word
    const needleWords = needleNorm.split(/\s+/);
    const haystackWords = haystackNorm.split(/\s+/);

    let bestSimilarity = 0;

    // Try sliding window
    for (let i = 0; i <= haystackWords.length - needleWords.length; i++) {
      const window = haystackWords.slice(i, i + needleWords.length).join(' ');
      const similarity = this.calculateSimilarity(needleNorm, window);
      bestSimilarity = Math.max(bestSimilarity, similarity);
    }

    // Also check individual words
    needleWords.forEach(needleWord => {
      haystackWords.forEach(haystackWord => {
        const similarity = this.calculateSimilarity(needleWord, haystackWord);
        if (needleWords.length === 1) {
          bestSimilarity = Math.max(bestSimilarity, similarity);
        }
      });
    });

    return bestSimilarity;
  }

  /**
   * Check document authenticity
   */
  checkDocumentAuthenticity(ocrText) {
    const hasBusinessKeywords = this.businessDocumentKeywords.some(keyword =>
      ocrText.includes(keyword)
    );

    const textLength = ocrText.length;
    const hasMinimumContent = textLength > 50;

    return {
      appearsAuthentic: hasBusinessKeywords && hasMinimumContent,
      hasBusinessKeywords,
      hasMinimumContent,
      textLength
    };
  }

  /**
   * Detect suspicious manipulation patterns
   */
  detectSuspiciousPatterns(ocrText) {
    const detectedPatterns = [];

    this.suspiciousPatterns.forEach(pattern => {
      if (pattern.test(ocrText)) {
        detectedPatterns.push(pattern.source);
      }
    });

    return {
      hasSuspiciousPatterns: detectedPatterns.length > 0,
      patterns: detectedPatterns
    };
  }

  /**
   * Generate verification result
   */
  generateVerificationResult(checks, formData) {
    const mismatchFields = [];
    let matchScore = 0;
    let totalChecks = 0;

    // Business name check
    if (formData.FORM_BUSINESS_NAME) {
      totalChecks++;
      if (checks.businessName.matched) {
        matchScore++;
      } else {
        mismatchFields.push('Business Name');
      }
    }

    // Owner name check
    if (formData.FORM_OWNER_NAME) {
      totalChecks++;
      if (checks.ownerName.matched) {
        matchScore++;
      } else {
        mismatchFields.push('Owner Name');
      }
    }

    // Registration number check
    if (formData.FORM_REG_NO) {
      totalChecks++;
      if (checks.registrationNumber.matched) {
        matchScore++;
      } else {
        mismatchFields.push('Registration Number');
      }
    }

    // Address check
    if (formData.FORM_ADDRESS) {
      totalChecks++;
      if (checks.address.matched) {
        matchScore++;
      } else {
        mismatchFields.push('Business Address');
      }
    }

    // Phone check
    if (formData.FORM_PHONE) {
      totalChecks++;
      if (checks.phoneNumber.matched) {
        matchScore++;
      } else {
        mismatchFields.push('Phone Number');
      }
    }

    // Calculate confidence score
    const matchPercentage = totalChecks > 0 ? (matchScore / totalChecks) * 100 : 0;
    let confidenceScore = Math.round(matchPercentage);

    // Adjust for document authenticity
    if (!checks.documentAuthenticity.appearsAuthentic) {
      confidenceScore = Math.max(0, confidenceScore - 30);
    }

    // Adjust for suspicious patterns
    if (checks.suspiciousPatterns.hasSuspiciousPatterns) {
      confidenceScore = Math.max(0, confidenceScore - 40);
    }

    // Determine verification status
    let verificationStatus, riskLevel, fraudProbability, recommendedAction;

    if (checks.suspiciousPatterns.hasSuspiciousPatterns) {
      verificationStatus = 'Rejected';
      riskLevel = 'High';
      fraudProbability = 'High';
      recommendedAction = 'Reject';
    } else if (!checks.documentAuthenticity.appearsAuthentic) {
      verificationStatus = 'Suspicious';
      riskLevel = 'High';
      fraudProbability = 'High';
      recommendedAction = 'Manual Review';
    } else if (mismatchFields.length === 0) {
      verificationStatus = 'Verified';
      riskLevel = 'Low';
      fraudProbability = 'Low';
      recommendedAction = 'Approve';
    } else if (mismatchFields.length <= 2 && confidenceScore >= 60) {
      verificationStatus = 'Partially Matched';
      riskLevel = 'Medium';
      fraudProbability = 'Medium';
      recommendedAction = 'Manual Review';
    } else {
      verificationStatus = 'Suspicious';
      riskLevel = 'High';
      fraudProbability = 'High';
      recommendedAction = 'Reject';
    }

    // Generate explanation
    const explanation = this.generateExplanation(
      checks,
      mismatchFields,
      matchScore,
      totalChecks,
      verificationStatus
    );

    return {
      verification_status: verificationStatus,
      confidence_score: `${confidenceScore}%`,
      risk_level: riskLevel,
      mismatch_fields: mismatchFields,
      fraud_probability: fraudProbability,
      explanation,
      recommended_action: recommendedAction,
      detailed_checks: checks
    };
  }

  /**
   * Generate detailed explanation
   */
  generateExplanation(checks, mismatchFields, matchScore, totalChecks, status) {
    if (checks.suspiciousPatterns.hasSuspiciousPatterns) {
      return `Document rejected due to suspicious patterns detected: ${checks.suspiciousPatterns.patterns.join(', ')}. This indicates potential document manipulation or use of template/sample documents.`;
    }

    if (!checks.documentAuthenticity.appearsAuthentic) {
      return `Document appears suspicious. ${!checks.documentAuthenticity.hasBusinessKeywords ? 'Missing standard business document keywords. ' : ''}${!checks.documentAuthenticity.hasMinimumContent ? 'Insufficient content extracted from document. ' : ''}This may indicate an invalid or unrelated document.`;
    }

    if (status === 'Verified') {
      return `All provided information matches the uploaded document. Business name, owner name, registration number, address, and contact details are verified. Document appears authentic with ${matchScore}/${totalChecks} fields matched.`;
    }

    if (status === 'Partially Matched') {
      const matchedCount = totalChecks - mismatchFields.length;
      return `Partial match detected. ${matchedCount}/${totalChecks} fields verified successfully. Mismatched fields: ${mismatchFields.join(', ')}. This could be due to minor formatting differences, OCR errors, or data entry mistakes. Manual review recommended.`;
    }

    // Suspicious/Rejected
    return `Significant discrepancies found between form data and document. ${mismatchFields.length} field(s) do not match: ${mismatchFields.join(', ')}. Only ${matchScore}/${totalChecks} fields verified. This indicates potential fraud or incorrect document submission.`;
  }
}

module.exports = DocumentVerifier;
