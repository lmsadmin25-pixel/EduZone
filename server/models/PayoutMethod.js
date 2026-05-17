const mongoose = require('mongoose');

const payoutMethodSchema = new mongoose.Schema({
  educator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Educator',
    required: true
  },
  type: {
    type: String,
    enum: ['bank', 'upi'],
    required: true
  },
  // Bank details (used when type === 'bank')
  accountHolderName: { type: String, default: '' },
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  branchName: { type: String, default: '' },
  // UPI details (used when type === 'upi')
  upiId: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
  label: { type: String, default: '' }  // e.g. "SBI - 1234" for display
}, { timestamps: true });

module.exports = mongoose.model('PayoutMethod', payoutMethodSchema);
