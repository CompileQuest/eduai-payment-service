const Stripe = require('stripe');
const { PaymentRepository } = require('../database');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);



class PaymentService {
    constructor() {
        this.repository = new PaymentRepository();
    }

    async CreateCheckoutSession(userId, courseId, priceId) {

        try {

            const session = await stripe.checkout.sessions.create({

                payment_method_types: ['card'],

                line_items: [

                    {

                        price: priceId, // Use the actual Price ID from your Stripe account

                        quantity: 1,

                    },

                ],

                mode: 'payment',

                success_url: `https://img.freepik.com/premium-photo/3d-white-people-with-check-mark_58466-2667.jpg?semt=ais_hybrid`, //to be replaced with with success page or somthing

                cancel_url: `https://media.discordapp.net/attachments/1111053034714308649/1332790182185013362/Untitled.png?ex=67968915&is=67953795&hm=c6f8398b6ab708e30ea0fb27fad94b1b99f6d4acdbb794f3ed36417676efe275&=&format=webp&quality=lossless&width=512&height=512`, //to be replaced with with cancel page or somthing :)

                metadata: { user_id: userId, course_id: courseId },

            });


            // Optionally, save session details to your database if needed

            await this.repository.CreatePaymentIntent({

                payment_intent_id: session.id,

                user_id: userId,

                course_id: courseId,

                amount: session.amount_total / 100, // Convert from cents to dollars

                currency: session.currency,

                status: session.payment_status,

            });


            return session;

        } catch (err) {

            throw new Error(`Checkout session creation failed: ${err.message}`);

        }

    }

///////////////////////////////////////////////
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
