/**
 * OTP Service
 * Uses Twilio in production when TWILIO_* env vars are set.
 * Falls back to mock (console log) for development.
 */

const crypto = require('crypto');

/**
 * Generate a 6-digit numeric OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP via Twilio SMS (or mock in dev)
 * @param {string} phoneNumber - E.164 format e.g. +919876543210
 * @param {string} otp
 */
const sendOTP = async (phoneNumber, otp) => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

  // --- PRODUCTION: Twilio ---
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
    const twilio = require('twilio');
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    await client.messages.create({
      body: `Your TrustBridge OTP is: ${otp}. Valid for 5 minutes. Do not share this with anyone.`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`✅ OTP sent via Twilio to ${phoneNumber}`);
    return { sent: true, mode: 'twilio' };
  }

  // --- DEVELOPMENT: Mock ---
  console.log(`\n📱 [MOCK OTP] Phone: ${phoneNumber} | OTP: ${otp}\n`);
  return { sent: true, mode: 'mock', otp }; // return otp only in mock mode
};

module.exports = { generateOTP, sendOTP };
