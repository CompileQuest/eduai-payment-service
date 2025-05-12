
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



    async findCoursesByIds(courseIds) {
        // Find all courses where course_id is in the provided array
        const courses = await CousreModel.find({
            course_id: { $in: courseIds }
        });

        return courses;
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


    async createPaymentIntent({ session_id, user_id, course_ids, amount, currency, status }) {

        // Create a new PaymentIntent document
        const paymentIntent = new PaymentIntentModel({
            session_id,       // Stripe checkout session ID
            user_id,          // The user making the payment
            course_ids,       // Array of course IDs
            amount,           // Total amount for the payment
            currency,         // Currency for the payment (defaulted to 'usd' if not provided)
            status,           // Payment status (e.g., 'created', 'completed')
        });

        // Save and return the new PaymentIntent document
        return await paymentIntent.save();
    }



    async findPaymentIntentBySessionId(sessionId) {
        // Find the PaymentIntent document by session_id
        const paymentIntent = await PaymentIntentModel.findOne({ session_id: sessionId });
        return paymentIntent;
    }



    async updatePaymentIntent(sessionId, updatedPaymentIntent) {
        // Update the PaymentIntent document in the database
        const updatedIntent = await PaymentIntentModel.findOneAndUpdate(
            { session_id: sessionId }, // Find the document by session_id
            updatedPaymentIntent, // Fields to update
            { new: true } // Return the updated document
        );
        return updatedIntent;
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