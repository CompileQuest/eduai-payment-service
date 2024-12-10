const mongoose = require('mongoose');
const uuid = require('uuid');

const paymentIntentSchema = new mongoose.Schema({
  payment_intent_id: {
    type: String,
    unique: true,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  course_id: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'usd',
  },
  status: {
    type: String,
    required: true,
    default: 'created',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const PaymentIntent = mongoose.model('PaymentIntent', paymentIntentSchema);

module.exports = PaymentIntent;
