import stripeClient from '../config/stripeClient.js'; // use preconfigured client
import PaymentRepository from '../database/repository/PaymentRepository.js';
import CourseRepository from '../database/repository/CourseRepository.js';
import { STRIPE_WEBHOOK_SECRET } from '../config/index.js';
import { APIError, AppError, InternalServerError, UnauthorizedError, NotFoundError } from '../utils/app-errors.js';
class PaymentService {
    constructor() {
        this.stripe = stripeClient; // use shared Stripe client
        this.paymentRepository = new PaymentRepository();
        this.courseRepository = new CourseRepository();
        this.endpointSecret = STRIPE_WEBHOOK_SECRET;
    }

    async handleWebhookEvent(event) {
        try {
            const session = event.data.object;
            switch (event.type) {
                case 'checkout.session.completed':
                    await this.paymentRepository.UpdatePaymentIntentStatus(session.id, 'succeeded');
                    break;
                case 'checkout.session.expired':
                    await this.paymentRepository.UpdatePaymentIntentStatus(session.id, 'expired');
                    console.log("sessionExpired", session);
                    break;
                case 'payment_intent.payment_failed':
                    await this.paymentRepository.UpdatePaymentIntentStatus(session.id, 'failed');
                    break;
                default:
                    console.warn(`Unhandled event type: ${event.type}`);
            }
        } catch (err) {
            console.error("Error handling webhook event:", err);
        }
    }

    async createPaymentIntent(courseId, instructorId, courseData) {
        try {
            const course = await this.courseRepository.findById(courseId);
            if (!course) throw new AppError('Course not found');
            if (course.instructor_id !== instructorId) {
                throw new UnauthorizedError('You are not authorized to update this course');
            }

            const editedCourse = await this.courseRepository.update(courseId, courseData);
            if (!editedCourse) throw new AppError('Failed to update course');
            return editedCourse;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new APIError('Failed to create payment intent', error.message);
        }
    }

    async createCheckoutSession({ userId, courseId, success_url, cancel_url }) {
        try {
            // Validate required fields
            this.validateRequiredFields({ userId, courseId, success_url, cancel_url });
            this.validateUrls({ success_url, cancel_url });

            // Fetch course by courseId
            const course = await this.paymentRepository.findByCourseId(courseId);
            if (!course) {
                throw new NotFoundError("Course not found", `Course ID: ${courseId} does not exist`);
            }

            if (!course.stripe_price_id) {
                throw new BadRequestError("Course price not configured", "Missing stripe_price_id on course");
            }

            // Create Stripe checkout session
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: course.stripe_price_id,
                        quantity: 1
                    }
                ],
                mode: 'payment',
                success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url,
                metadata: {
                    userId,
                    courseId
                }
            });

            // Persist payment intent to DB
            await this.paymentRepository.createPaymentIntent({
                payment_intent_id: session.id,
                user_id: userId,
                course_id: courseId,
                amount: session.amount_total ? session.amount_total / 100 : course.price,
                currency: session.currency || course.currency || 'usd',
                status: session.payment_status || 'created'
            });

            return session;

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Failed to create checkout session", error.message);
        }
    }


    async createCourse(courseId, name, price, thumbnail_url) {
        let stripe_product_id = null;
        let stripe_price_id = null;

        try {
            // Check for duplicate course
            const existingCourse = await this.paymentRepository.findByCourseId(courseId);
            if (existingCourse) {
                throw new ConflictError("Course with this ID already exists.");
            }

            // 1. Create Stripe product
            const product = await this.stripe.products.create({
                name,
                images: thumbnail_url ? [thumbnail_url] : []
            }); stripe_product_id = product.id;

            // 2. Create Stripe price
            const stripePrice = await this.stripe.prices.create({
                product: stripe_product_id,
                unit_amount: price * 100,
                currency: 'usd',
            });
            stripe_price_id = stripePrice.id;

            // 3. Create course in the database
            const createdCourse = await this.paymentRepository.createCourse(
                courseId,
                name,
                price,
                thumbnail_url,
                stripe_price_id,
                stripe_product_id
            );

            if (!createdCourse) {
                throw new InternalServerError("Failed to create course in the database.");
            }

            return createdCourse;
        } catch (error) {
            // Rollback if Stripe product or price was created but DB creation failed
            if (stripe_price_id) {
                await this.stripe.prices.update(stripe_price_id, { active: false }).catch(() => { });
            }
            if (stripe_product_id) {
                await this.stripe.products.update(stripe_product_id, { active: false }).catch(() => { });
            }

            if (error instanceof AppError) {
                throw error;
            }

            throw new InternalServerError("Unexpected error during course creation", error.message);
        }
    }

    async getallPayments() {
        try {
            return await this.paymentRepository.findAllpaymento();
        } catch (error) {
            throw new Error(`Get All Payments Error: ${error.message}`);
        }
    }

    async getPayments({ page = 1, limit = 10 }) {
        try {
            this.validatePagination(page, limit);
            return await this.paymentRepository.findAll(page, limit);
        } catch (error) {
            throw new Error(`Get Payments Error: ${error.message}`);
        }
    }

    async getPaymentsByUserId(userId) {
        try {
            return await this.paymentRepository.findByUserId(userId);
        } catch (error) {
            throw new Error(`Get Payments by User ID Error: ${error.message}`);
        }
    }

    async getSuccessfulPaymentsByCourse(courseId) {
        try {
            return await this.paymentRepository.findSuccessfulPaymentsByCourse(courseId);
        } catch (error) {
            throw new Error(`Get Successful Payments Error: ${error.message}`);
        }
    }



    async getCourses({ page = 1, limit = 10 }) {
        try {
            this.validatePagination(page, limit);
            return await this.courseRepository.findAll(page, limit);
        } catch (error) {
            throw new Error(`Get Courses Error: ${error.message}`);
        }
    }

    async getCourseById(id) {
        try {
            const course = await this.courseRepository.findById(id);
            if (!course) throw new Error('Course not found');
            return course;
        } catch (error) {
            throw new Error(`Get Course Error: ${error.message}`);
        }
    }

    async updateCourse(id, updateData) {
        try {
            const course = await this.courseRepository.update(id, updateData);
            if (!course) throw new Error('Course not found');
            return course;
        } catch (error) {
            throw new Error(`Update Course Error: ${error.message}`);
        }
    }

    async deleteCourse(id) {
        try {
            const course = await this.courseRepository.findById(id);
            if (!course) throw new Error('Course not found');

            await this.stripe.products.del(course.stripe_product_id);
            await this.courseRepository.delete(id);
        } catch (error) {
            throw new Error(`Delete Course Error: ${error.message}`);
        }
    }

    async getPaymentsByStatus(status) {
        try {
            this.validatePaymentStatus(status);
            return await this.paymentRepository.findByStatus(status);
        } catch (error) {
            throw new Error(`Get Payments by Status Error: ${error.message}`);
        }
    }

    async getPaymentsByStatusPaginated({ page = 1, limit = 10 }, status) {
        try {
            this.validatePagination(page, limit);
            this.validatePaymentStatus(status);
            return await this.paymentRepository.findByStatusPaginated(page, limit, status);
        } catch (error) {
            throw new Error(`Get Paginated Payments by Status Error: ${error.message}`);
        }
    }

    // -------------------
    // Helpers
    // -------------------

    validatePaymentStatus(status) {
        const validStatuses = ['succeeded', 'pending', 'failed', 'expired', 'created'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid payment status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
        }
    }

    validatePagination(page, limit) {
        if (page < 1 || limit < 1 || limit > 100) {
            throw new Error('Invalid pagination parameters');
        }
    }

    validateRequiredFields(fields) {
        for (const [key, value] of Object.entries(fields)) {
            if (!value) throw new Error(`${key} is required`);
        }
    }

    validateUrls({ success_url, cancel_url }) {
        try {
            new URL(success_url);
            new URL(cancel_url);
        } catch {
            throw new Error('Invalid URL format provided');
        }
    }

    sanitizeUrl(url) {
        return url.replace(/[<>'"]/g, '');
    }
}

export default PaymentService;
