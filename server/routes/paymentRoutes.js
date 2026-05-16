const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {
  createOrder, verifyPayment, getPaymentHistory, getPaymentReports
} = require('../controllers/paymentController');

router.post('/create-order', protect, roleAuth('student'), createOrder);
router.post('/verify', protect, roleAuth('student'), verifyPayment);
router.get('/history', protect, roleAuth('student'), getPaymentHistory);
router.get('/reports', protect, roleAuth('admin'), getPaymentReports);

module.exports = router;
