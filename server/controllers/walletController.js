const EarningsWallet = require('../models/EarningsWallet');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const PayoutMethod = require('../models/PayoutMethod');
const Notification = require('../models/Notification');

const PLATFORM_FEE_PERCENT = 5;
const MIN_WITHDRAWAL = 1; // ₹1 minimum

// @desc    Get educator's wallet summary + transactions
// @route   GET /api/wallet/educator
const getWallet = async (req, res, next) => {
  try {
    let wallet = await EarningsWallet.findOne({ educator: req.user._id });
    if (!wallet) {
      wallet = await EarningsWallet.create({ educator: req.user._id });
    }

    // Sort transactions newest first
    const transactions = [...wallet.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      totalEarnings: wallet.totalEarnings,
      pendingBalance: wallet.pendingBalance,
      withdrawnAmount: wallet.withdrawnAmount,
      platformFeePaid: wallet.platformFeePaid,
      transactions,
      platformFeePercent: PLATFORM_FEE_PERCENT
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get educator's withdrawal history
// @route   GET /api/wallet/withdrawals
const getWithdrawalHistory = async (req, res, next) => {
  try {
    const withdrawals = await WithdrawalRequest.find({ educator: req.user._id })
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved payout methods
// @route   GET /api/wallet/payout-methods
const getPayoutMethods = async (req, res, next) => {
  try {
    const methods = await PayoutMethod.find({ educator: req.user._id }).sort({ createdAt: -1 });
    res.json(methods);
  } catch (error) {
    next(error);
  }
};

// @desc    Save a new payout method
// @route   POST /api/wallet/payout-methods
const savePayoutMethod = async (req, res, next) => {
  try {
    const { type, accountHolderName, bankName, accountNumber, ifscCode, branchName, upiId, isDefault } = req.body;

    if (!type || !['bank', 'upi'].includes(type)) {
      return res.status(400).json({ message: 'Invalid payout method type' });
    }
    if (type === 'bank' && (!accountHolderName || !bankName || !accountNumber || !ifscCode || !branchName)) {
      return res.status(400).json({ message: 'All bank details are required' });
    }
    if (type === 'upi' && !upiId) {
      return res.status(400).json({ message: 'UPI ID is required' });
    }

    // If marking as default, unset others
    if (isDefault) {
      await PayoutMethod.updateMany({ educator: req.user._id }, { isDefault: false });
    }

    const label = type === 'bank'
      ? `${bankName} - ****${accountNumber.slice(-4)}`
      : `UPI - ${upiId}`;

    const method = await PayoutMethod.create({
      educator: req.user._id,
      type,
      accountHolderName: accountHolderName || '',
      bankName: bankName || '',
      accountNumber: accountNumber || '',
      ifscCode: ifscCode || '',
      branchName: branchName || '',
      upiId: upiId || '',
      isDefault: !!isDefault,
      label
    });

    res.status(201).json({ message: 'Payout method saved', method });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a payout method
// @route   DELETE /api/wallet/payout-methods/:id
const deletePayoutMethod = async (req, res, next) => {
  try {
    const method = await PayoutMethod.findOneAndDelete({
      _id: req.params.id,
      educator: req.user._id
    });
    if (!method) return res.status(404).json({ message: 'Method not found' });
    res.json({ message: 'Payout method removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a withdrawal request
// @route   POST /api/wallet/withdraw
const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, payoutMethodId, newPayoutMethod } = req.body;

    // Validate amount
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount < MIN_WITHDRAWAL) {
      return res.status(400).json({ message: `Minimum withdrawal is ₹${MIN_WITHDRAWAL}` });
    }

    // Check wallet balance
    const wallet = await EarningsWallet.findOne({ educator: req.user._id });
    if (!wallet || wallet.pendingBalance < withdrawAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check for existing pending request
    const existingPending = await WithdrawalRequest.findOne({
      educator: req.user._id,
      status: 'pending'
    });
    if (existingPending) {
      return res.status(400).json({ message: 'You already have a pending withdrawal request' });
    }

    // Resolve payout method
    let payoutData;
    if (payoutMethodId) {
      const savedMethod = await PayoutMethod.findOne({ _id: payoutMethodId, educator: req.user._id });
      if (!savedMethod) return res.status(404).json({ message: 'Payout method not found' });

      payoutData = {
        type: savedMethod.type,
        bankDetails: savedMethod.type === 'bank' ? {
          accountHolderName: savedMethod.accountHolderName,
          bankName: savedMethod.bankName,
          accountNumber: savedMethod.accountNumber,
          ifscCode: savedMethod.ifscCode,
          branchName: savedMethod.branchName
        } : undefined,
        upiId: savedMethod.type === 'upi' ? savedMethod.upiId : undefined
      };

      // Auto-save if new payout method provided alongside
      if (newPayoutMethod && newPayoutMethod.saveForFuture) {
        await saveNewMethod(req.user._id, newPayoutMethod);
      }
    } else if (newPayoutMethod) {
      // First withdrawal — save and use new method
      const saved = await saveNewMethod(req.user._id, newPayoutMethod);
      payoutData = {
        type: newPayoutMethod.type,
        bankDetails: newPayoutMethod.type === 'bank' ? {
          accountHolderName: newPayoutMethod.accountHolderName,
          bankName: newPayoutMethod.bankName,
          accountNumber: newPayoutMethod.accountNumber,
          ifscCode: newPayoutMethod.ifscCode,
          branchName: newPayoutMethod.branchName
        } : undefined,
        upiId: newPayoutMethod.type === 'upi' ? newPayoutMethod.upiId : undefined
      };
    } else {
      return res.status(400).json({ message: 'Payout method is required' });
    }

    // Calculate fee
    const platformFee = parseFloat(((withdrawAmount * PLATFORM_FEE_PERCENT) / 100).toFixed(2));
    const netAmount = parseFloat((withdrawAmount - platformFee).toFixed(2));

    // Create request
    const withdrawal = await WithdrawalRequest.create({
      educator: req.user._id,
      amount: withdrawAmount,
      platformFee,
      netAmount,
      payoutMethod: payoutData,
      status: 'pending'
    });

    // Deduct from pending balance (hold it)
    await EarningsWallet.findOneAndUpdate(
      { educator: req.user._id },
      {
        $inc: { pendingBalance: -withdrawAmount },
        $push: {
          transactions: {
            type: 'withdrawal',
            amount: withdrawAmount,
            description: `Withdrawal request submitted`,
            withdrawalId: withdrawal._id,
            date: new Date()
          }
        }
      }
    );

    res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      withdrawal,
      breakdown: { gross: withdrawAmount, platformFee, net: netAmount }
    });
  } catch (error) {
    next(error);
  }
};

// Helper: save a payout method for an educator
async function saveNewMethod(educatorId, methodData) {
  const { type, accountHolderName, bankName, accountNumber, ifscCode, branchName, upiId } = methodData;
  const label = type === 'bank'
    ? `${bankName} - ****${(accountNumber || '').slice(-4)}`
    : `UPI - ${upiId}`;

  return await PayoutMethod.create({
    educator: educatorId,
    type,
    accountHolderName: accountHolderName || '',
    bankName: bankName || '',
    accountNumber: accountNumber || '',
    ifscCode: ifscCode || '',
    branchName: branchName || '',
    upiId: upiId || '',
    isDefault: true,
    label
  });
}

module.exports = {
  getWallet,
  getWithdrawalHistory,
  getPayoutMethods,
  savePayoutMethod,
  deletePayoutMethod,
  requestWithdrawal
};
