const Stripe = require('stripe');
const { PaymentRepository } = require('../database');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { CourseRepository } = require('../database');
const express = require('express');
const router = express.Router();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;


class PaymentService {
    constructor() {
        this.repository = new PaymentRepository();
        this.courseRepository = new CourseRepository();
    }

    async CreateCheckoutSession(userId, courseId) {
        try {
            // Fetch course details to get the price ID
            const course = await this.courseRepository.getCourseById(courseId);
            
            if (!course) {
                throw new Error('Course not found');
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: course.stripe_price_id,
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `https://img.freepik.com/premium-photo/3d-white-people-with-check-mark_58466-2667.jpg?semt=ais_hybrid`,
                cancel_url: `https://media.discordapp.net/attachments/1111053034714308649/1332790182185013362/Untitled.png?ex=67968915&is=67953795&hm=c6f8398b6ab708e30ea0fb27fad94b1b99f6d4acdbb794f3ed36417676efe275&=&format=webp&quality=lossless&width=512&height=512`,
                metadata: { user_id: userId, course_id: courseId },
            });

            // Save session details to database
            await this.repository.CreatePaymentIntent({
                payment_intent_id: session.id,
                user_id: userId,
                course_id: courseId,
                amount: session.amount_total / 100,
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

    async createCourseWithPrice(courseName, price) {
        try {
            // Create product in Stripe
            const product = await stripe.products.create({
                name: courseName,
            });

            // Create price for the product
            const stripePrice = await stripe.prices.create({
                product: product.id,
                unit_amount: price * 100, // Convert to cents
                currency: 'usd',
            });

            // Save course details to database
            const course = await this.courseRepository.createCourse({
                name: courseName,
                stripe_product_id: product.id,
                stripe_price_id: stripePrice.id,
                price: price
            });

            return course;
        } catch (err) {
            throw new Error(`Course creation failed: ${err.message}`);
        }
    }

    async handleWebhookEvent(event) {
        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    const session = event.data.object;
                    await this.repository.UpdatePaymentIntentStatus(
                        session.id,
                        'succeeded'
                    );
                    break;

                case 'payment_intent.payment_failed':
                    const paymentIntent = event.data.object;
                    await this.repository.UpdatePaymentIntentStatus(
                        paymentIntent.id,
                        'failed'
                    );
                    break;

                // Add more cases as needed
            }
        } catch (err) {
            throw new Error(`Webhook handling failed: ${err.message}`);
        }
    }
}

module.exports = PaymentService;
