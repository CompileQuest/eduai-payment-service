const PaymentService = require('../../services/payment-service');
const express = require('express');
const stripe = require('stripe');

module.exports = (app) => {
    const service = new PaymentService();
    app.post('/create-checkout-session', async (req, res, next) => {

        try {

            const { userId, courseId } = req.body;


            if (!userId || !courseId) {

                return res.status(400).json({ message: 'Missing required fields' });

            }


            const session = await service.CreateCheckoutSession(userId, courseId);


            res.redirect(303, session.url); // Redirect to the Stripe Checkout page
console.log("session.url",session.url);
        } catch (err) {

            next(err);

        }

    });
 ///////////////////////
   /* app.post('/create-payment-intent', async (req, res, next) => {
        try {
            const { userId, courseId, amount } = req.body;

            if (!userId || !courseId || !amount) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const paymentIntent = await service.CreatePaymentIntent(userId, courseId, amount);

            return res.status(201).json({
                message: 'Payment intent created successfully',
                clientSecret: paymentIntent.payment_intent_id,
                status: paymentIntent.status,
            });
        } catch (err) {
            next(err);
        }
    });
*/
    app.get('/payments', async (req, res, next) => {
        try {
            const paymentService = new PaymentService();
            console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
            const payments = await service.getAllPayments();
            return res.status(200).json({
                message: 'Payment records retrieved successfully',
                data: payments
            });
        } catch (err) {
            next(err); // Forward errors to error handler middleware
        }
    });
    
    app.post('/create-course', async (req, res, next) => {
        try {
            const { courseName, price } = req.body;

            if (!courseName || !price) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const course = await service.createCourseWithPrice(courseName, price);

            return res.status(201).json({
                message: 'Course created successfully',
                data: course
            });
        } catch (err) {
            next(err);
        }
    });

    app.post('/webhook', express.raw({type: 'application/json'}), async (req, res, next) => {
        try {
            const sig = req.headers['stripe-signature'];
            
            let event;
            
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            } catch (err) {
                console.error(`Webhook Error: ${err.message}`);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }

            // Handle the event
            await service.handleWebhookEvent(event);

            // Return a response to acknowledge receipt of the event
            res.json({received: true});
        } catch (err) {
            next(err);
        }
    });

};
