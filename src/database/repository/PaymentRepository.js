
import PaymentIntentModel from '../models/PaymentIntent.js';
import CousreModel from '../models/Course.js'
class PaymentRepository {
    async create(paymentData) {
        try {
            const payment = new PaymentModel(paymentData);
            return await payment.save();
        } catch (error) {
            throw new Error(`Database Error: ${error.message}`);
        }
    }

    async createCourse(courseId, name, price, thumbnail_url, stripe_price_id, stripe_product_id) {
        //Create a new course record in the database
        const course = new CousreModel({
            course_id: courseId,
            name,
            price,
            thumbnail_url,
            stripe_price_id,
            stripe_product_id,
        });

        // Save and return the created course
        return await course.save();
    }
    async findAllpaymento() {
        try {
            return await PaymentModel.find().sort({ created_at: -1 });
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


    async createPaymentIntent({ payment_intent_id, user_id, course_id, amount, currency, status }) {
        try {
            const paymentIntent = new PaymentIntentModel({
                payment_intent_id,
                user_id,
                course_id,
                amount,
                currency,
                status
            });

            return await paymentIntent.save();
        } catch (error) {
            throw new Error(`Failed to create payment intent: ${error.message}`);
        }
    }

    async findByCourseId(courseId) {
        // Search for a course in the database using the course_id
        const course = await CousreModel.findOne({ course_id: courseId });
        return course; // If a course is found, it will be returned, else null
    }


    // Add these methods to the PaymentRepository class

    async findByStatus(status) {
        try {
            return await PaymentModel.find({ status }).sort({ created_at: -1 });
        } catch (error) {
            throw new Error(`Database Error: ${error.message}`);
        }
    }

    async findByStatusPaginated(page, limit, status) {
        try {
            const skip = (page - 1) * limit;
            const [payments, total] = await Promise.all([
                PaymentModel.find({ status })
                    .skip(skip)
                    .limit(limit)
                    .sort({ created_at: -1 }),
                PaymentModel.countDocuments({ status })
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

export default PaymentRepository