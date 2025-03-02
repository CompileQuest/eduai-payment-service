const express = require('express');
const PaymentService = require('../../services/payment-service');

module.exports = (app) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const service = new PaymentService();
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // ✅ Ensure Stripe webhook gets raw body
    app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;
        
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            console.log("✅ Webhook Event:", event);
        } catch (err) {
            console.log("⚠️ Webhook signature verification failed, proceeding with raw payload");
            // If req.body is already an object, use it directly
            event = typeof req.body === 'object' ? req.body : JSON.parse(req.body.toString('utf8'));
        }

        service.handleWebhookEvent(event);
        // Check if this is a completed checkout session with paid status
       /* if (event.type === 'checkout.session.completed' && 
            event.data.object.payment_status === 'paid') {
           
            // Extract relevant information
            const sessionId = event.data.object.id;
            const paymentIntentId = event.data.object.payment_intent;
            const amountPaid = event.data.object.amount_total;

            // Update payment status
            service.updatePaymentStatus(paymentIntentId, 'paid', amountPaid)
                .then(() => console.log(`✅ Payment status updated for session ${sessionId}`))
                .catch(err => console.error(`❌ Error updating payment status: ${err.message}`));
        }
*/
        res.json({ received: true });
    });
///////////////////////

    // Place the JSON parsing middleware after the webhook route
    app.use(express.json());

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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                message: 'Invalid pagination parameters. Page must be ≥ 1 and limit between 1 and 100'
            });
        }

        const result = await service.getAllPayments(page, limit);

        return res.status(200).json({
            message: 'Payment records retrieved successfully',
            data: result.payments,
            pagination: result.pagination
        });
    } catch (err) {
        next(err);
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

    // Get all courses with pagination
    app.get('/courses', async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            // Validate pagination parameters
            if (page < 1 || limit < 1 || limit > 100) {
                return res.status(400).json({
                    message: 'Invalid pagination parameters. Page must be ≥ 1 and limit between 1 and 100'
                });
            }

            const result = await service.getAllCourses(page, limit);
            
            return res.json({
                message: 'Courses fetched successfully',
                data: result.courses,
                pagination: result.pagination
            });
        } catch (err) {
            next(err);
        }
    });

    // Get single course
    app.get('/courses/:id', async (req, res, next) => {
        try {
            const course = await service.courseRepository.getCourseById(req.params.id);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            return res.json({
                message: 'Course fetched successfully',
                data: course
            });
        } catch (err) {
            next(err);
        }
    });

    // Update course
    app.put('/courses/:id', async (req, res, next) => {
        try {
            const { courseName, price } = req.body;
            
            if (!courseName || !price) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const updatedCourse = await service.updateCourse(req.params.id, courseName, price);
            return res.json({
                message: 'Course updated successfully',
                data: updatedCourse
            });
        } catch (err) {
            next(err);
        }
    });

    // Delete course
    app.delete('/courses/:id', async (req, res, next) => {
        try {
            await service.deleteCourse(req.params.id);
            return res.json({
                message: 'Course deleted successfully'
            });
        } catch (err) {
            next(err);
        }
    });

    // Home route
    app.get('/', (req, res) => {
        res.json({
            message: 'Welcome to Payment Service API',
            version: '1.0.0',
            endpoints: {
                home: '/',
                createCourse: '/create-course',
                courses: '/courses',
                singleCourse: '/courses/:id',
                checkout: '/create-checkout-session',
                webhook: '/webhook'
            }
        });
    });
};
