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

    async getAllPayments(page, limit) {
        try {
            console.log("Fetching all payment records with pagination...");
    
            const skip = (page - 1) * limit; // Calculate the number of documents to skip
            const payments = await PaymentIntentModel.find()
                .skip(skip)
                .limit(limit)
                .sort({ created_at: -1 }); // Sort by newest first
    
            const totalPayments = await PaymentIntentModel.countDocuments(); // Get total count
    
            console.log("Fetched payment records successfully.");
            return {
                payments,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalPayments / limit),
                    totalPayments,
                    pageSize: limit
                }
            };
        } catch (err) {
            console.error('Error fetching payment records:', err);
            throw new Error('Unable to retrieve payments from database');
        }
    }
    

///////////update payment intent status/////////



}

module.exports = PaymentRepository;
