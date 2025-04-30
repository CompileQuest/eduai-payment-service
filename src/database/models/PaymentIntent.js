import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // Though `uuid` is imported, it's not used in the schema—remove if unused


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
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});


const PaymentIntent = mongoose.model('PaymentIntent', paymentIntentSchema);

export default PaymentIntent;
