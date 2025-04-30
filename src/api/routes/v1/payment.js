import express from "express";
import PaymentService from "../../../services/payment-service.js";
import validateUrls from "../../../middlewares/url-validator.js";
import { APIError, AppError, BadRequestError } from "../../../utils/app-errors.js";

const router = express.Router();
const service = new PaymentService();

// Stripe Webhook route
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_ENDPOINT_SECRET);
        console.log("✅ Webhook Event:", event);
    } catch (err) {
        console.log("⚠️ Webhook verification failed, parsing raw payload");
        event = typeof req.body === "object" ? req.body : JSON.parse(req.body.toString("utf8"));
    }

    await service.handleWebhookEvent(event);
    res.json({ received: true });
});


router.get("/hello", async (req, res) => {
    res.status(200).json({ message: "the payment service says hello !!" })
});


// Create Checkout Session
router.post("/create-checkout-session", validateUrls, async (req, res, next) => {
    try {
        const data = req.body;
        if (!data) throw new BadRequestError("Request body is missing");

        const session = await service.createCheckoutSession(data);
        res.status(200).json({ success: true, message: "Checkout session created", data: session.url });
    } catch (error) {
        next(error);
    }
});

// Create Payment
router.post("/create-payment", validateUrls, async (req, res, next) => {
    try {
        const data = req.body;
        if (!data) throw new BadRequestError("Request body is missing");

        const createdPayment = await service.createPayment(data);
        res.status(200).json({ success: true, message: "Payment created", data: createdPayment });
    } catch (error) {
        next(error);
    }
});

// Get all payments (non-paginated)
router.get("/paymentsAll", async (req, res, next) => {
    try {
        const payments = await service.getallPayments(req.query);
        res.status(200).json(payments);
    } catch (error) {
        next(error);
    }
});

// Get payments with pagination
router.get("/payments", async (req, res, next) => {
    try {
        const result = await service.getPayments(req.query);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

// Get payments by user ID
router.get("/payments/user/:userId", async (req, res, next) => {
    try {
        const payments = await service.getPaymentsByUserId(req.params.userId);
        res.status(200).json(payments);
    } catch (error) {
        next(error);
    }
});

// Get successful payments by course
router.get("/courses/:id/successful-payments", async (req, res, next) => {
    try {
        const result = await service.getSuccessfulPaymentsByCourse(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

// Courses endpoints
router.post("/createCourse", async (req, res, next) => {
    try {

        const { courseId, name, price, thumbnail_url } = req.body;
        console.log("this is the course id ", courseId);
        console.log("this is the name ", name);
        console.log("this is the price ", price);
        console.log("this is the image url ", thumbnail_url);

        if (!courseId || !name || !price) {
            return res.status(400).json({ error: "Missing required fields" });
        }


        const course = await service.createCourse(courseId, name, price, thumbnail_url);
        res.status(201).json(course);
    } catch (error) {
        next(error);
    }
});

router.get("/courses", async (req, res, next) => {
    try {
        const courses = await service.getCourses(req.query);
        res.status(200).json(courses);
    } catch (error) {
        next(error);
    }
});

router.get("/courses/:id", async (req, res, next) => {
    try {
        const course = await service.getCourseById(req.params.id);
        res.status(200).json(course);
    } catch (error) {
        next(error);
    }
});

router.put("/courses/:id", async (req, res, next) => {
    try {
        const course = await service.updateCourse(req.params.id, req.body);
        res.status(200).json(course);
    } catch (error) {
        next(error);
    }
});

router.delete("/courses/:id", async (req, res, next) => {
    try {
        await service.deleteCourse(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Filtered payments by status (non-paginated)
router.get("/paymentsAll/status/:status", async (req, res, next) => {
    try {
        const payments = await service.getPaymentsByStatus(req.params.status);
        res.status(200).json(payments);
    } catch (error) {
        next(error);
    }
});

// Filtered payments by status (paginated)
router.get("/payments/status/:status", async (req, res, next) => {
    try {
        const result = await service.getPaymentsByStatusPaginated(req.query, req.params.status);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

// Root test route
router.get("/", (req, res) => {
    res.send("🎉 Welcome to the Payments Service!");
});

export default router;
