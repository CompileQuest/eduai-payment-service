import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // This may still be useful for creating UUIDs for records

const paymentIntentSchema = new mongoose.Schema({
  payment_intent_id: { type: String, index: true },
  user_id: { type: String, required: true },
  course_ids: { type: [String], required: true }, // Store an array of course IDs
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: { type: String, required: true, default: 'created' },
  session_id: { type: String, required: true, unique: true }, // Still unique, but only one per checkout session
  customer_email: { type: String, required: false },
  customer_name: { type: String, required: false },
  payment_method_type: { type: String, required: false },
  payment_date: { type: Date, required: false },
  discount: { type: Number, required: false },
  coupon_code: { type: String, required: false },
  refund_status: { type: String, required: false },
  refund_amount: { type: Number, required: false },
  refund_date: { type: Date, required: false },
  payment_metadata: { type: Object, required: false }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const PaymentIntent = mongoose.model('PaymentIntent', paymentIntentSchema);

export default PaymentIntent;
