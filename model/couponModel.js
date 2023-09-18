const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  codePrefix: {
    type:String,
    required:true
  },
  description: {
    type: String,
    required: true,
  },
  discountType: {
    type: String,
    enum: ['Fixed Amount'],
    required: true,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
  minPurchase: {
    type: Number,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: 1, // Set a default usage limit (one-time use per customer)
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  usedUsers: [
    {
      usedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      usedCount: {
        type: Number,
        default: 0,
      }
    }],
  
  
},
{
  timestamps: true,
});

module.exports = mongoose.model('Coupon', couponSchema);


