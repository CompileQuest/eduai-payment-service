const PaymentService = require('../../services/payment-service');

module.exports = (app) => {
    const service = new PaymentService();

    app.post('/create-payment-intent', async (req, res, next) => {
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
};
