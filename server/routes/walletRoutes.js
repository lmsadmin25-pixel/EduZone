const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {
  getWallet,
  getWithdrawalHistory,
  getPayoutMethods,
  savePayoutMethod,
  deletePayoutMethod,
  requestWithdrawal
} = require('../controllers/walletController');

// All wallet routes require educator authentication
router.use(protect, roleAuth('educator'));

router.get('/educator', getWallet);
router.get('/withdrawals', getWithdrawalHistory);
router.get('/payout-methods', getPayoutMethods);
router.post('/payout-methods', savePayoutMethod);
router.delete('/payout-methods/:id', deletePayoutMethod);
router.post('/withdraw', requestWithdrawal);

module.exports = router;
