const DocumentVerifier = require('../utils/documentVerifier');
const ServiceProvider = require('../models/ServiceProvider');

/**
 * Controller for document verification
 */

// Verify uploaded document against form data
exports.verifyDocument = async (req, res) => {
  try {
    const {
      formBusinessName,
      formOwnerName,
      formAddress,
      formPhone,
      formRegNo,
      ocrExtractedText,
      providerId
    } = req.body;

    // Validate input
    if (!ocrExtractedText) {
      return res.status(400).json({
        success: false,
        message: 'OCR extracted text is required'
      });
    }

    // Prepare form data
    const formData = {
      FORM_BUSINESS_NAME: formBusinessName || '',
      FORM_OWNER_NAME: formOwnerName || '',
      FORM_ADDRESS: formAddress || '',
      FORM_PHONE: formPhone || '',
      FORM_REG_NO: formRegNo || ''
    };

    // Verify document
    const verifier = new DocumentVerifier();
    const result = verifier.verifyDocument(formData, ocrExtractedText);

    // If providerId is provided, update verification status
    if (providerId) {
      await ServiceProvider.findByIdAndUpdate(providerId, {
        documentVerification: {
          status: result.verification_status,
          confidenceScore: result.confidence_score,
          riskLevel: result.risk_level,
          mismatchFields: result.mismatch_fields,
          fraudProbability: result.fraud_probability,
          verifiedAt: new Date()
        }
      });
    }

    res.json({
      success: true,
      verification: result
    });

  } catch (error) {
    console.error('Document verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying document',
      error: error.message
    });
  }
};

// Get verification status for a provider
exports.getVerificationStatus = async (req, res) => {
  try {
    const { providerId } = req.params;

    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
    }

    res.json({
      success: true,
      verification: provider.documentVerification || {
        status: 'Not Verified',
        message: 'No verification performed yet'
      }
    });

  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving verification status',
      error: error.message
    });
  }
};

// Batch verify pending documents (admin)
exports.batchVerifyDocuments = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Find providers pending verification
    const providers = await ServiceProvider.find({
      'documentVerification.status': { $in: ['Pending', null] },
      businessProofDocument: { $exists: true }
    }).limit(parseInt(limit));

    const results = [];
    const verifier = new DocumentVerifier();

    for (const provider of providers) {
      // Skip if no OCR text available
      if (!provider.ocrExtractedText) {
        results.push({
          providerId: provider._id,
          businessName: provider.businessName,
          status: 'Skipped',
          reason: 'No OCR text available'
        });
        continue;
      }

      const formData = {
        FORM_BUSINESS_NAME: provider.businessName || '',
        FORM_OWNER_NAME: provider.ownerName || '',
        FORM_ADDRESS: provider.businessAddress || '',
        FORM_PHONE: provider.phone || '',
        FORM_REG_NO: provider.registrationNumber || ''
      };

      const verification = verifier.verifyDocument(formData, provider.ocrExtractedText);

      // Update provider
      await ServiceProvider.findByIdAndUpdate(provider._id, {
        documentVerification: {
          status: verification.verification_status,
          confidenceScore: verification.confidence_score,
          riskLevel: verification.risk_level,
          mismatchFields: verification.mismatch_fields,
          fraudProbability: verification.fraud_probability,
          verifiedAt: new Date()
        }
      });

      results.push({
        providerId: provider._id,
        businessName: provider.businessName,
        verification
      });
    }

    // Summary statistics
    const summary = {
      total: results.length,
      verified: results.filter(r => r.verification?.verification_status === 'Verified').length,
      partiallyMatched: results.filter(r => r.verification?.verification_status === 'Partially Matched').length,
      suspicious: results.filter(r => r.verification?.verification_status === 'Suspicious').length,
      rejected: results.filter(r => r.verification?.verification_status === 'Rejected').length,
      skipped: results.filter(r => r.status === 'Skipped').length
    };

    res.json({
      success: true,
      summary,
      results
    });

  } catch (error) {
    console.error('Batch verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing batch verification',
      error: error.message
    });
  }
};

// Manual override verification (admin only)
exports.overrideVerification = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { status, adminNotes } = req.body;

    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Verified or Rejected'
      });
    }

    const provider = await ServiceProvider.findByIdAndUpdate(
      providerId,
      {
        'documentVerification.status': status,
        'documentVerification.manualOverride': true,
        'documentVerification.adminNotes': adminNotes,
        'documentVerification.overrideAt': new Date(),
        'documentVerification.overrideBy': req.user._id
      },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
    }

    res.json({
      success: true,
      message: 'Verification status updated',
      verification: provider.documentVerification
    });

  } catch (error) {
    console.error('Override verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error overriding verification',
      error: error.message
    });
  }
};
