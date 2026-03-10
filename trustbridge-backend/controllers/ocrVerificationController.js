/**
 * OCR-Based Verification Controller
 * Handles document upload, OCR extraction, and automated verification
 */

const ocrService = require('../utils/ocrService');
const DocumentVerifier = require('../utils/documentVerifier');
const ServiceProvider = require('../models/ServiceProvider');
const Resident = require('../models/Resident');
const User = require('../models/User');

/**
 * Verify Service Provider Documents with OCR
 */
exports.verifyServiceProviderDocuments = async (req, res) => {
  try {
    const { providerId } = req.params;
    const {
      businessName,
      ownerName,
      address,
      phone,
      gstNumber,
      aadhaarNumber
    } = req.body;

    // Get uploaded files
    const aadhaarDoc = req.files?.aadhaarDocument?.[0];
    const businessDoc = req.files?.businessProof?.[0];

    if (!aadhaarDoc || !businessDoc) {
      return res.status(400).json({
        success: false,
        message: 'Both Aadhaar and Business documents are required'
      });
    }

    console.log('🔍 Starting OCR verification for provider:', providerId);

    // Extract text from Aadhaar
    const aadhaarOCR = await ocrService.extractText(aadhaarDoc.path);
    if (!aadhaarOCR.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to extract text from Aadhaar document',
        error: aadhaarOCR.error
      });
    }

    // Extract text from Business Proof
    const businessOCR = await ocrService.extractText(businessDoc.path);
    if (!businessOCR.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to extract text from Business document',
        error: businessOCR.error
      });
    }

    // Extract structured fields
    const aadhaarFields = ocrService.extractFields(aadhaarOCR.text);
    const businessFields = ocrService.extractFields(businessOCR.text);

    // Validate Aadhaar format
    const aadhaarValid = ocrService.validateAadhaarFormat(
      aadhaarFields.aadhaarNumber || aadhaarNumber
    );

    // Validate GST format
    const gstValid = ocrService.validateGSTFormat(
      businessFields.gstNumber || gstNumber
    );

    // Prepare verification data
    const formData = {
      FORM_BUSINESS_NAME: businessName,
      FORM_OWNER_NAME: ownerName,
      FORM_ADDRESS: address,
      FORM_PHONE: phone,
      FORM_REG_NO: gstNumber || businessFields.gstNumber
    };

    // Verify Aadhaar document
    const verifier = new DocumentVerifier();
    const aadhaarVerification = verifier.verifyDocument(
      {
        FORM_OWNER_NAME: ownerName,
        FORM_REG_NO: aadhaarNumber || aadhaarFields.aadhaarNumber
      },
      aadhaarOCR.text
    );

    // Verify Business document
    const businessVerification = verifier.verifyDocument(
      formData,
      businessOCR.text
    );

    // Calculate overall verification score
    let verificationScore = 0;

    // Aadhaar format valid → +20
    if (aadhaarValid) verificationScore += 20;

    // GST format valid → +20
    if (gstValid) verificationScore += 20;

    // Name match → +30
    if (aadhaarVerification.detailed_checks?.ownerName?.matched) {
      verificationScore += 30;
    }

    // Business name match → +30
    if (businessVerification.detailed_checks?.businessName?.matched) {
      verificationScore += 30;
    }

    // Determine auto-approval/rejection
    const autoReject = verificationScore < 40 || 
                       businessVerification.verification_status === 'Rejected' ||
                       aadhaarVerification.verification_status === 'Rejected';

    const autoApprove = verificationScore >= 80 &&
                        businessVerification.verification_status === 'Verified';

    // Update provider record
    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
    }

    // Store OCR data
    provider.ocrData = {
      aadhaarExtracted: aadhaarFields,
      businessExtracted: businessFields,
      aadhaarText: aadhaarOCR.text,
      businessText: businessOCR.text,
      extractedAt: new Date()
    };

    provider.verificationScore = verificationScore;
    provider.verificationDetails = {
      aadhaarVerification,
      businessVerification,
      aadhaarValid,
      gstValid
    };

    // Auto-approve or auto-reject
    if (autoReject) {
      provider.verificationStatus = 'REJECTED';
      provider.rejectionReason = 'Uploaded documents do not match the entered details';
      provider.addVerificationLog('REJECTED', req.user._id, 'Auto-rejected: Document mismatch');
    } else if (autoApprove) {
      provider.verificationStatus = 'APPROVED';
      provider.proofVerified = true;
      provider.verifiedAt = new Date();
      provider.verifiedBy = req.user._id;
      provider.addVerificationLog('APPROVED', req.user._id, 'Auto-approved: All checks passed');
    }

    await provider.save();

    res.json({
      success: true,
      message: autoReject ? 'Verification failed' : autoApprove ? 'Verification successful' : 'Pending manual review',
      verificationScore,
      status: provider.verificationStatus,
      details: {
        aadhaarVerification,
        businessVerification,
        extractedFields: {
          aadhaar: aadhaarFields,
          business: businessFields
        },
        validations: {
          aadhaarValid,
          gstValid
        }
      }
    });

  } catch (error) {
    console.error('❌ OCR verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
};

/**
 * Verify Local Resident Documents with OCR
 */
exports.verifyResidentDocuments = async (req, res) => {
  try {
    const { residentId } = req.params;
    const {
      fullName,
      address,
      aadhaarNumber
    } = req.body;

    // Get uploaded document
    const document = req.files?.document?.[0];

    if (!document) {
      return res.status(400).json({
        success: false,
        message: 'Document is required'
      });
    }

    console.log('🔍 Starting OCR verification for resident:', residentId);

    // Extract text from document
    const ocrResult = await ocrService.extractText(document.path);
    if (!ocrResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to extract text from document',
        error: ocrResult.error
      });
    }

    // Extract structured fields
    const extractedFields = ocrService.extractFields(ocrResult.text);

    // Validate Aadhaar if provided
    const aadhaarValid = aadhaarNumber ? 
      ocrService.validateAadhaarFormat(extractedFields.aadhaarNumber || aadhaarNumber) : 
      true;

    // Verify document
    const verifier = new DocumentVerifier();
    const verification = verifier.verifyDocument(
      {
        FORM_OWNER_NAME: fullName,
        FORM_ADDRESS: address,
        FORM_REG_NO: aadhaarNumber || extractedFields.aadhaarNumber
      },
      ocrResult.text
    );

    // Calculate verification score
    let verificationScore = 0;

    // Aadhaar format valid → +30
    if (aadhaarValid) verificationScore += 30;

    // Name match → +40
    if (verification.detailed_checks?.ownerName?.matched) {
      verificationScore += 40;
    }

    // Address match → +30
    if (verification.detailed_checks?.address?.matched) {
      verificationScore += 30;
    }

    // Auto-approve/reject logic
    const autoReject = verificationScore < 50 || 
                       verification.verification_status === 'Rejected';

    const autoApprove = verificationScore >= 70 &&
                        verification.verification_status === 'Verified';

    // Update resident record
    const resident = await Resident.findById(residentId);
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    resident.ocrData = {
      extractedFields,
      ocrText: ocrResult.text,
      extractedAt: new Date()
    };

    resident.verificationScore = verificationScore;
    resident.verificationDetails = {
      verification,
      aadhaarValid
    };

    if (autoReject) {
      resident.verificationStatus = 'REJECTED';
      resident.rejectionReason = 'Document does not match entered details';
      resident.addVerificationLog('REJECTED', req.user._id, 'Auto-rejected: Document mismatch');
    } else if (autoApprove) {
      resident.verificationStatus = 'APPROVED';
      resident.proofVerified = true;
      resident.verifiedAt = new Date();
      resident.verifiedBy = req.user._id;
      resident.addVerificationLog('APPROVED', req.user._id, 'Auto-approved: All checks passed');
    }

    await resident.save();

    res.json({
      success: true,
      message: autoReject ? 'Verification failed' : autoApprove ? 'Verification successful' : 'Pending manual review',
      verificationScore,
      status: resident.verificationStatus,
      details: {
        verification,
        extractedFields,
        validations: {
          aadhaarValid
        }
      }
    });

  } catch (error) {
    console.error('❌ Resident OCR verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
};

/**
 * Get verification status
 */
exports.getVerificationStatus = async (req, res) => {
  try {
    const { type, id } = req.params;

    let record;
    if (type === 'provider') {
      record = await ServiceProvider.findById(id)
        .populate('user', 'name email')
        .populate('verifiedBy', 'name');
    } else if (type === 'resident') {
      record = await Resident.findById(id)
        .populate('user', 'name email')
        .populate('verifiedBy', 'name');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Use "provider" or "resident"'
      });
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      });
    }

    res.json({
      success: true,
      data: {
        verificationStatus: record.verificationStatus,
        verificationScore: record.verificationScore,
        proofVerified: record.proofVerified,
        verifiedAt: record.verifiedAt,
        verifiedBy: record.verifiedBy,
        rejectionReason: record.rejectionReason,
        ocrData: record.ocrData,
        verificationDetails: record.verificationDetails
      }
    });

  } catch (error) {
    console.error('❌ Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification status',
      error: error.message
    });
  }
};

module.exports = exports;
