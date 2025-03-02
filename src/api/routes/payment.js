const express = require('express');

module.exports = (app) => {
    const PaymentService = require('../../services/payment-service');
    const service = new PaymentService();
    const validateUrls = require('../middlewares/url-validator');
    // Webhook route - needs raw body

    
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
    app.use(express.json());

    

    app.post('/create-checkout-session', 

        validateUrls,
    
        async (req, res) => {
    
            try {
                const session = await service.createCheckoutSession(req.body);
                res.status(200).json({ url: session.url });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        }
    
    );

    app.get('/payments', async (req, res) => {
        try {
            const result = await service.getPayments(req.query);
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
};