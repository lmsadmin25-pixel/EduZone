const WithdrawalRequest = require('../models/WithdrawalRequest');
const EarningsWallet = require('../models/EarningsWallet');
const Notification = require('../models/Notification');

const VALID_REJECTION_REASONS = [
  'Incorrect bank details',
  'Suspicious activity detected',
  'Minimum withdrawal amount not reached',
  'Verification pending',
  'Technical issue',
  'Duplicate request',
  'Other'
];

// @desc    Get all withdrawal requests (Admin)
// @route   GET /api/admin/withdrawals
const getAllWithdrawals = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await WithdrawalRequest.countDocuments(query);

    const withdrawals = await WithdrawalRequest.find(query)
      .populate('educator', 'name email avatar')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      withdrawals,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get withdrawal stats for admin dashboard
// @route   GET /api/admin/withdrawals/stats
const getWithdrawalStats = async (req, res, next) => {
  try {
    const pending = await WithdrawalRequest.countDocuments({ status: 'pending' });
    const approved = await WithdrawalRequest.countDocuments({ status: 'approved' });
    const rejected = await WithdrawalRequest.countDocuments({ status: 'rejected' });

    const approvedAgg = await WithdrawalRequest.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, totalPaid: { $sum: '$netAmount' }, totalFees: { $sum: '$platformFee' } } }
    ]);

    const pendingAgg = await WithdrawalRequest.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, totalPending: { $sum: '$amount' } } }
    ]);

    res.json({
      pending,
      approved,
      rejected,
      totalPaid: approvedAgg[0]?.totalPaid || 0,
      totalPlatformFees: approvedAgg[0]?.totalFees || 0,
      totalPendingAmount: pendingAgg[0]?.totalPending || 0
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a withdrawal request (Admin)
// @route   PUT /api/admin/withdrawals/:id/approve
const approveWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await WithdrawalRequest.findById(req.params.id)
      .populate('educator', 'name email');

    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found' });
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${withdrawal.status}` });
    }

    // Approve
    withdrawal.status = 'approved';
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Update wallet: move amount from (already deducted pending) to withdrawn, add fee paid
    await EarningsWallet.findOneAndUpdate(
      { educator: withdrawal.educator._id },
      {
        $inc: {
          withdrawnAmount: withdrawal.netAmount,
          platformFeePaid: withdrawal.platformFee
        },
        $push: {
          transactions: {
            type: 'debit',
            amount: withdrawal.netAmount,
            description: `Withdrawal approved — Net: ₹${withdrawal.netAmount} (fee: ₹${withdrawal.platformFee})`,
            withdrawalId: withdrawal._id,
            date: new Date()
          }
        }
      }
    );

    // Notify educator
    await Notification.create({
      user: withdrawal.educator._id,
      userType: 'Educator',
      title: '💸 Withdrawal Approved',
      message: `Your withdrawal of ₹${withdrawal.amount} has been approved. Net amount ₹${withdrawal.netAmount} will be transferred to your account.`,
      type: 'payment'
    });

    res.json({ message: 'Withdrawal approved successfully', withdrawal });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a withdrawal request (Admin)
// @route   PUT /api/admin/withdrawals/:id/reject
const rejectWithdrawal = async (req, res, next) => {
  try {
    const { rejectionReason, customRejectionReason } = req.body;

    if (!rejectionReason || !VALID_REJECTION_REASONS.includes(rejectionReason)) {
      return res.status(400).json({ message: 'A valid rejection reason is required' });
    }
    if (rejectionReason === 'Other' && !customRejectionReason?.trim()) {
      return res.status(400).json({ message: 'Please provide a custom rejection reason' });
    }

    const withdrawal = await WithdrawalRequest.findById(req.params.id)
      .populate('educator', 'name email');

    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found' });
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${withdrawal.status}` });
    }

    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = rejectionReason;
    withdrawal.customRejectionReason = rejectionReason === 'Other' ? customRejectionReason : '';
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Refund the held amount back to pending balance
    await EarningsWallet.findOneAndUpdate(
      { educator: withdrawal.educator._id },
      {
        $inc: { pendingBalance: withdrawal.amount },
        $push: {
          transactions: {
            type: 'refund',
            amount: withdrawal.amount,
            description: `Withdrawal rejected — Reason: ${rejectionReason === 'Other' ? customRejectionReason : rejectionReason}`,
            withdrawalId: withdrawal._id,
            date: new Date()
          }
        }
      }
    );

    // Notify educator with reason
    const displayReason = rejectionReason === 'Other' ? customRejectionReason : rejectionReason;
    await Notification.create({
      user: withdrawal.educator._id,
      userType: 'Educator',
      title: '❌ Withdrawal Rejected',
      message: `Your withdrawal request of ₹${withdrawal.amount} was rejected. Reason: ${displayReason}. The amount has been returned to your pending balance.`,
      type: 'payment'
    });

    res.json({ message: 'Withdrawal rejected', withdrawal });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllWithdrawals, getWithdrawalStats, approveWithdrawal, rejectWithdrawal };
