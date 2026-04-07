/**
 * Simple API wrapper matching the exact prompt format
 * Returns strict JSON output as specified
 */

const DocumentVerifier = require('./documentVerifier');

/**
 * Verify document with exact JSON format output
 * @param {Object} input - Form and OCR data matching prompt variables
 * @returns {Object} - Strict JSON response
 */
function verifyDocumentPromptFormat(input) {
  const {
    FORM_BUSINESS_NAME,
    FORM_OWNER_NAME,
    FORM_ADDRESS,
    FORM_PHONE,
    FORM_REG_NO,
    OCR_EXTRACTED_TEXT
  } = input;

  // Validate required fields
  if (!OCR_EXTRACTED_TEXT) {
    throw new Error('OCR_EXTRACTED_TEXT is required');
  }

  // Prepare data for verifier
  const formData = {
    FORM_BUSINESS_NAME: FORM_BUSINESS_NAME || '',
    FORM_OWNER_NAME: FORM_OWNER_NAME || '',
    FORM_ADDRESS: FORM_ADDRESS || '',
    FORM_PHONE: FORM_PHONE || '',
    FORM_REG_NO: FORM_REG_NO || ''
  };

  // Run verification
  const verifier = new DocumentVerifier();
  const result = verifier.verifyDocument(formData, OCR_EXTRACTED_TEXT);

  // Return in exact format specified in prompt
  return {
    verification_status: result.verification_status,
    confidence_score: result.confidence_score,
    risk_level: result.risk_level,
    mismatch_fields: result.mismatch_fields,
    fraud_probability: result.fraud_probability,
    explanation: result.explanation,
    recommended_action: result.recommended_action
  };
}

/**
 * Example usage matching the prompt template
 */
function exampleUsage() {
  console.log('='.repeat(80));
  console.log('TRUSTBRIDGE DOCUMENT VERIFICATION - PROMPT FORMAT');
  console.log('='.repeat(80));
  console.log();

  const examples = [
    {
      name: 'Example 1: Perfect Match (Verified)',
      input: {
        FORM_BUSINESS_NAME: 'Sunrise Accommodation Services',
        FORM_OWNER_NAME: 'Rajesh Kumar',
        FORM_ADDRESS: '123 MG Road, Bachupally, Hyderabad, Telangana 500090',
        FORM_PHONE: '+91-9876543210',
        FORM_REG_NO: 'GST29ABCDE1234F1Z5',
        OCR_EXTRACTED_TEXT: `
          GOODS AND SERVICES TAX REGISTRATION CERTIFICATE
          
          Business Name: Sunrise Accommodation Services
          Proprietor: Rajesh Kumar
          Business Address: 123 MG Road, Bachupally, Hyderabad, Telangana - 500090
          GSTIN: GST29ABCDE1234F1Z5
          Contact: +91-9876543210
          Date of Registration: 15/01/2024
          
          This certificate is issued under the provisions of CGST Act 2017
        `
      }
    },
    {
      name: 'Example 2: Partial Match (Minor Differences)',
      input: {
        FORM_BUSINESS_NAME: 'Green Valley Homestay',
        FORM_OWNER_NAME: 'Priya Sharma',
        FORM_ADDRESS: '45 Park Street, Miyapur, Hyderabad',
        FORM_PHONE: '9988776655',
        FORM_REG_NO: 'REG2024001234',
        OCR_EXTRACTED_TEXT: `
          TRADE LICENSE
          
          Business: Green Valley Home Stay
          Owner: P. Sharma
          Location: 45 Park St, Miyapur, Hyd
          License No: REG2024001234
          Valid Until: 31/12/2025
        `
      }
    },
    {
      name: 'Example 3: Mismatch (Wrong Document)',
      input: {
        FORM_BUSINESS_NAME: 'City Apartments',
        FORM_OWNER_NAME: 'Amit Patel',
        FORM_ADDRESS: '78 Lake View Road, Gachibowli',
        FORM_PHONE: '9123456789',
        FORM_REG_NO: 'GST29XYZ123',
        OCR_EXTRACTED_TEXT: `
          RESTAURANT LICENSE
          
          Business Name: Spice Garden Restaurant
          Owner: Suresh Reddy
          Address: 12 Food Street, Banjara Hills
          License: FOOD2024567
          Category: Food & Beverage
        `
      }
    },
    {
      name: 'Example 4: Suspicious (Template Detected)',
      input: {
        FORM_BUSINESS_NAME: 'Premium Stays',
        FORM_OWNER_NAME: 'John Doe',
        FORM_ADDRESS: '100 Main Street',
        FORM_PHONE: '1234567890',
        FORM_REG_NO: 'ABC123',
        OCR_EXTRACTED_TEXT: `
          SAMPLE CERTIFICATE - DO NOT USE
          
          This is a template document for demonstration purposes only.
          Business Name: [Your Business Name]
          Owner: [Owner Name]
          
          WATERMARK: SAMPLE ONLY
        `
      }
    },
    {
      name: 'Example 5: Address Mismatch Only',
      input: {
        FORM_BUSINESS_NAME: 'Comfort Living PG',
        FORM_OWNER_NAME: 'Meera Iyer',
        FORM_ADDRESS: '56 Gandhi Nagar, Kukatpally, Hyderabad',
        FORM_PHONE: '9876501234',
        FORM_REG_NO: 'PG2024789',
        OCR_EXTRACTED_TEXT: `
          PAYING GUEST ESTABLISHMENT LICENSE
          
          Name: Comfort Living PG
          Proprietor: Meera Iyer
          Address: 89 Nehru Street, KPHB Colony, Hyderabad
          Registration: PG2024789
          Phone: 9876501234
          Capacity: 20 persons
        `
      }
    }
  ];

  examples.forEach(example => {
    console.log(`\n${example.name}`);
    console.log('-'.repeat(80));
    console.log('FORM DETAILS (User Entered):');
    console.log(`Business Name: ${example.input.FORM_BUSINESS_NAME}`);
    console.log(`Owner Name: ${example.input.FORM_OWNER_NAME}`);
    console.log(`Business Address: ${example.input.FORM_ADDRESS}`);
    console.log(`Phone Number: ${example.input.FORM_PHONE}`);
    console.log(`Registration Number: ${example.input.FORM_REG_NO}`);
    console.log();
    console.log('DOCUMENT EXTRACTED TEXT (OCR Output):');
    console.log(example.input.OCR_EXTRACTED_TEXT.trim());
    console.log();
    console.log('OUTPUT (STRICT JSON):');
    
    try {
      const result = verifyDocumentPromptFormat(example.input);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.log(JSON.stringify({
        error: error.message
      }, null, 2));
    }
    console.log();
  });

  console.log('='.repeat(80));
}

module.exports = {
  verifyDocumentPromptFormat,
  exampleUsage
};

// Run examples if executed directly
if (require.main === module) {
  exampleUsage();
}
