const PaymentIntentModel = require('../models/PaymentIntent');

class PaymentRepository {
    async CreatePaymentIntent(paymentData) {
        try {
            const newPaymentIntent = new PaymentIntentModel(paymentData);
            return await newPaymentIntent.save();
        } catch (err) {
            throw new Error(`Unable to create payment intent: ${err.message}`);
        }
    }

    async UpdatePaymentIntentStatus(paymentIntentId, status) {
        try {
            return await PaymentIntentModel.findOneAndUpdate(
                { payment_intent_id: paymentIntentId },
                { status },
                { new: true }
            );
        } catch (err) {
            throw new Error(`Unable to update payment intent status: ${err.message}`);
        }
    }
}

module.exports = PaymentRepository;
