const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['credit', 'debit', 'withdrawal', 'refund'],
    required: true
  },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  withdrawalId: { type: mongoose.Schema.Types.ObjectId, ref: 'WithdrawalRequest', default: null },
  paymentId: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

const earningsWalletSchema = new mongoose.Schema({
  educator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Educator',
    required: true,
    unique: true
  },
  totalEarnings: { type: Number, default: 0 },    // All-time gross earnings
  pendingBalance: { type: Number, default: 0 },   // Available to withdraw
  withdrawnAmount: { type: Number, default: 0 },  // Total withdrawn (after fee)
  platformFeePaid: { type: Number, default: 0 },  // Total platform fees deducted
  transactions: [transactionSchema]
}, { timestamps: true });

module.exports = mongoose.model('EarningsWallet', earningsWalletSchema);
