const Razorpay = require('razorpay');

// Lazy initialization — only instantiate when first used.
// This prevents a crash at startup if env vars are not yet configured.
let _instance = null;

const getRazorpay = () => {
  if (!_instance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay env vars (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not set');
    }
    _instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _instance;
};

module.exports = getRazorpay;

