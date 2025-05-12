import express from "express";
import PaymentService from "../../../services/payment-service.js";
import validateUrls from "../../../middlewares/url-validator.js";
import { APIError, AppError, BadRequestError } from "../../../utils/app-errors.js";
import { checkAuth, checkRole, getUserId, getCurrentRole } from "../../../middlewares/auth/authHelper.js";
import ROLES from "../../../config/roles.js";
const router = express.Router();
const service = new PaymentService();




router.get("/hello", async (req, res) => {
    res.status(200).json({ message: "the payment service says hello !!" })
});


// Create Checkout Session
router.post("/create-checkout-session", validateUrls, checkAuth, checkRole([ROLES.STUDENT]), async (req, res, next) => {
    try {

        const userId = getUserId(req.auth);
        const { courseIds, success_url, cancel_url } = req.body;
        if (!courseIds || !success_url || !cancel_url) {
            throw new BadRequestError("Some fields are missing here !!");
        }
        const session = await service.createCheckoutSession(userId, courseIds, success_url, cancel_url);
        res.status(200).json({ success: true, message: "Checkout session created", data: session.url });
    } catch (error) {
        next(error);
    }
});




router.delete("/delete-all-products", async (req, res, next) => {
    try {
        const result = await service.deleteAllStripeProducts();
        res.status(200).json({ success: result.success, message: result.message, data: [result.productsDeleted, result.pricesDeleted] });
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
