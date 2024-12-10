const Stripe = require('stripe');
const { PaymentRepository } = require('../database');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);



class PaymentService {
    constructor() {
        this.repository = new PaymentRepository();
    }

    async CreatePaymentIntent(userId, courseId, amount) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100,
                currency: 'usd',
                metadata: { user_id: userId, course_id: courseId },
            });

            const savedIntent = await this.repository.CreatePaymentIntent({
                payment_intent_id: paymentIntent.id,
                user_id: userId,
                course_id: courseId,
                amount,
                currency: 'usd',
                status: paymentIntent.status,
            });

            return savedIntent;
        } catch (err) {
            throw new Error(`Payment intent creation failed: ${err.message}`);
        }
    }

    async getAllPayments() {
        try {
            console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");

            const payments = await this.repository.fetchAllPayments();
            console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");

            return payments;
        } catch (err) {
            throw new Error('Error fetching payment records');
        }
    }
}

module.exports = PaymentService;
