const mongoose = require('mongoose');

const bankDetailsSchema = new mongoose.Schema({
  accountHolderName: { type: String, default: '' },
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  branchName: { type: String, default: '' }
}, { _id: false });

const withdrawalRequestSchema = new mongoose.Schema({
  educator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Educator',
    required: true
  },
  amount: { type: Number, required: true },           // Gross requested amount
  platformFee: { type: Number, required: true },      // 5% of amount
  netAmount: { type: Number, required: true },        // amount - platformFee
  payoutMethod: {
    type: { type: String, enum: ['bank', 'upi'], required: true },
    bankDetails: bankDetailsSchema,
    upiId: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    enum: [
      'Incorrect bank details',
      'Suspicious activity detected',
      'Minimum withdrawal amount not reached',
      'Verification pending',
      'Technical issue',
      'Duplicate request',
      'Other',
      ''
    ],
    default: ''
  },
  customRejectionReason: { type: String, default: '' },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  processedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
