
    const PaymentModel = require('../models/PaymentIntent');

    class PaymentRepository {
        async create(paymentData) {
            try {
                const payment = new PaymentModel(paymentData);
                return await payment.save();
            } catch (error) {
                throw new Error(`Database Error: ${error.message}`);
            }
        }
    
        async findAll(page, limit) {
            try {
                const skip = (page - 1) * limit;
                const [payments, total] = await Promise.all([
                    PaymentModel.find()
                        .skip(skip)
                        .limit(limit)
                        .sort({ created_at: -1 }),
                    PaymentModel.countDocuments()
                ]);
    
                return {
                    payments,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalItems: total,
                        pageSize: limit
                    }
                };
            } catch (error) {
                throw new Error(`Database Error: ${error.message}`);
            }
        }
        async findByUserId(userId) {
            try {
                return await PaymentModel.find({ user_id: userId }).sort({ created_at: -1 });
            } catch (error) {
                throw new Error(`Database Error: ${error.message}`);
            }
        }
      

        async findSuccessfulPaymentsByCourse(courseId) {
            try {
                return await PaymentModel.find(
                    { course_id: courseId, status: 'succeeded' }, // Filter successful payments
                    { user_id: 1, created_at: 1, _id: 0 } // Select only user_id and created_at
                ).sort({ created_at: -1 });
            } catch (error) {
                throw new Error(`Database Error: ${error.message}`);
            }
        }
        



        async UpdatePaymentIntentStatus(paymentIntentId, status) {
            try {
                return await PaymentModel.findOneAndUpdate(
                    { payment_intent_id: paymentIntentId },
                    { status },
                    { new: true }
                );
            } catch (err) {
                throw new Error(`Unable to update payment intent status: ${err.message}`);
            }
        }
       /* async updateStatus(paymentIntentId, status) {
            try {
                return await PaymentModel.findOneAndUpdate(
                    { payment_intent_id: paymentIntentId },
                    { status },
                    { new: true }
                );
            } catch (error) {
                throw new Error(`Database Error: ${error.message}`);
            }
        }*/
    }
    
    module.exports = PaymentRepository;