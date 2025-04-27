const express = require('express');
const { APIError, AppError, BadRequestError } = require('../../utils/app-errors');

module.exports = (app) => {

    const PaymentService = require('../../services/payment-service');
    const service = new PaymentService();
    const validateUrls = require('../middlewares/url-validator');
    // Webhook route - needs raw body




    // TODO move this to the webhook service 
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


        res.json({ received: true });
    });


    // Apply JSON parsing middleware for other routes
    // Modify this later 
    app.use(express.json());



    app.post('/payment/create-checkout-session',
        validateUrls,
        async (req, res, next) => {
            try {
                data = req.body;
                if (!data) {
                    throw new BadRequestError("Body REquest is not available ");
                }
                const session = await service.createCheckoutSession(req.body);

                res.status(200).json({
                    success: true,
                    message: 'Checkout session created successfully',
                    data: session.url,
                });
            } catch (error) {
                next(error);
            }
        }
    );






    // Template on how to write clean code with error handling !!
    app.post('/create-payment',
        validateUrls,
        async (req, res, next) => {
            try {
                data = req.body;
                if (!data) {
                    throw new BadRequestError("Body REquest is not available ");
                }

                const createdPayment = await service.createPayment(req.body);

                res.status(200).json({
                    success: true,
                    message: 'Payment created successfully',
                    data: createdPayment,
                });
            } catch (error) {
                next(error);
            }
        }
    );


    app.get('/', (req, res) => {
        res.send('🎉 Welcome to the Payments Service!');
    });

    //get all payments
    app.get('/paymentsAll', async (req, res) => {
        try {
            const payments = await service.getallPayments(req.query);
            res.status(200).json(payments);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    // ✅ Get all payments with pagination


    app.get('/payments', async (req, res) => {
        try {
            const result = await service.getPayments(req.query);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });


    // ✅ Get payments for a specific user
    app.get('/payments/user/:userId', async (req, res) => {
        try {
            const payments = await service.getPaymentsByUserId(req.params.userId);
            res.status(200).json(payments);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });


    // ✅ Get successful payments for a specific course
    app.get('/courses/:id/successful-payments', async (req, res) => {
        try {
            const { id: courseId } = req.params;
            const result = await service.getSuccessfulPaymentsByCourse(courseId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });


    // Course routes
    app.post('/courses', async (req, res) => {
        try {
            const course = await service.createCourse(req.body);
            res.status(201).json(course);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    app.get('/courses', async (req, res) => {
        try {
            const courses = await service.getCourses(req.query);
            res.status(200).json(courses);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    app.get('/courses/:id', async (req, res) => {
        try {
            const course = await service.getCourseById(req.params.id);
            res.status(200).json(course);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    app.put('/courses/:id', async (req, res) => {
        try {
            const course = await service.updateCourse(req.params.id, req.body);
            res.status(200).json(course);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    app.delete('/courses/:id', async (req, res) => {
        try {
            await service.deleteCourse(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    //////////////////////////
    // Get all payments filtered by status (non-paginated)
    app.get('/paymentsAll/status/:status', async (req, res) => {
        try {
            const { status } = req.params;
            const payments = await service.getPaymentsByStatus(status);
            res.status(200).json(payments);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Get all payments with pagination filtered by status
    app.get('/payments/status/:status', async (req, res) => {
        try {
            const { status } = req.params;
            const result = await service.getPaymentsByStatusPaginated(req.query, status);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

};