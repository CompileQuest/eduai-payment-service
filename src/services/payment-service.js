
const Stripe = require('stripe');
const { PaymentRepository, CourseRepository } = require('../database');
const { UnauthorizedError, APIError, AppError } = require('../utils/app-errors');
class PaymentService {
    constructor() {
        this.stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        this.paymentRepository = new PaymentRepository();
        this.repository = new PaymentRepository();
        this.courseRepository = new CourseRepository();
        this.endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
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
                case 'checkout.session.expired':
                    const sessionExpired = event.data.object;
                    await this.repository.UpdatePaymentIntentStatus(
                        sessionExpired.id,
                        'expired'

                    );
                    console.log("sessionExpired", sessionExpired);
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
            console.log("signature lesa");
        }
    }



    // template for coding 
    async createPaymentIntent(cousreId, instructorId, courseData) {
        try {
            // edit course 
            const course = await this.courseRepository.findById(cousreId);
            if (!course) {
                throw new AppiError('Course not found');
            }



            // Validate the course belongs to the current user!!!
            if (course.instructor_id !== instructorId) {
                throw new UnauthorizedError('You are not authorized to update this course');
            }



            const editedCourse = await this.courseRepository.update(cousreId, courseData);
            if (!editedCourse) {
                throw new AppiError('Failed to update course');
            }



            return editedCourse;

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            throw new APIError('Failed to create payment intent', error.message);
        }
    }







    async createCheckoutSession({ userId, courseId, success_url, cancel_url }) {

        try {

            // Validate all required fields

            this.validateRequiredFields({

                userId,

                courseId,

                success_url,

                cancel_url

            });



            // Validate URLs

            this.validateUrls({ success_url, cancel_url });


            const course = await this.courseRepository.findById(courseId);

            if (!course) throw new Error('Course not found');

            if (!course.stripe_price_id) throw new Error('Course price not configured');


            const session = await this.stripe.checkout.sessions.create({

                payment_method_types: ['card'],

                line_items: [{

                    price: course.stripe_price_id,

                    quantity: 1,

                }],

                mode: 'payment',

                success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,

                cancel_url: cancel_url,

                metadata: { userId, courseId }

            });


            await this.paymentRepository.create({

                payment_intent_id: session.id,

                user_id: userId,

                course_id: courseId,

                amount: session.amount_total / 100,

                currency: session.currency,

                status: session.payment_status

            });


            return session;

        } catch (error) {

            throw new Error(`Checkout Session Error: ${error.message}`);

        }

    }
    async getallPayments(_) {
        try {
            return await this.paymentRepository.findAllpaymento();
        } catch (error) {
            throw new Error(`Get All Payments Error: ${error.message}`);
        }



    }
    ///////////////////////
    async getPayments({ page = 1, limit = 10 }) {
        try {
            this.validatePagination(page, limit);
            return await this.paymentRepository.findAll(page, limit);
        } catch (error) {
            throw new Error(`Get Payments Error: ${error.message}`);
        }
    }

    // ✅ Get payments for a specific user
    async getPaymentsByUserId(userId) {
        try {
            return await this.paymentRepository.findByUserId(userId);
        } catch (error) {
            throw new Error(`Get Payments by User ID Error: ${error.message}`);
        }
    }

    // ✅ Get successful payments for a specific course
    async getSuccessfulPaymentsByCourse(courseId) {
        try {
            return await this.paymentRepository.findSuccessfulPaymentsByCourse(courseId);
        } catch (error) {
            throw new Error(`Get Successful Payments Error: ${error.message}`);
        }
    }

    async createCourse({ name, price }) {
        try {
            this.validateRequiredFields({ name, price });

            const product = await this.stripe.products.create({ name });
            const stripePrice = await this.stripe.prices.create({
                product: product.id,
                unit_amount: price * 100,
                currency: 'usd'
            });

            return await this.courseRepository.create({
                name,
                stripe_product_id: product.id,
                stripe_price_id: stripePrice.id,
                price
            });
        } catch (error) {
            throw new Error(`Create Course Error: ${error.message}`);
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

            // Delete from Stripe
            await this.stripe.products.del(course.stripe_product_id);
            await this.courseRepository.delete(id);
        } catch (error) {
            throw new Error(`Delete Course Error: ${error.message}`);
        }
    }


    ///////////////////////////
    // Add these methods to the PaymentService class

    async getPaymentsByStatus(status) {
        try {
            // Validate the status parameter
            this.validatePaymentStatus(status);

            return await this.paymentRepository.findByStatus(status);
        } catch (error) {
            throw new Error(`Get Payments by Status Error: ${error.message}`);
        }
    }

    async getPaymentsByStatusPaginated({ page = 1, limit = 10 }, status) {
        try {
            // Validate pagination parameters
            this.validatePagination(page, limit);

            // Validate the status parameter
            this.validatePaymentStatus(status);

            return await this.paymentRepository.findByStatusPaginated(page, limit, status);
        } catch (error) {
            throw new Error(`Get Paginated Payments by Status Error: ${error.message}`);
        }
    }

    // Add this helper method to validate status
    validatePaymentStatus(status) {
        const validStatuses = ['succeeded', 'pending', 'failed', 'expired', 'created'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid payment status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
        }
    }

    // Private methods
    /*  async handleWebhookEvent(event) {
          const handlers = {
              'checkout.session.completed': async (session) => {
                  await this.paymentRepository.updateStatus(session.id, 'succeeded');
              },
              'checkout.session.expired': async (session) => {
                  await this.paymentRepository.updateStatus(session.id, 'expired');
              },
              'payment_intent.payment_failed': async (paymentIntent) => {
                  await this.paymentRepository.updateStatus(paymentIntent.id, 'failed');
              }
          };
  
          const handler = handlers[event.type];
          if (handler) await handler(event.data.object);
      }*/

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

            // Validate both URLs

            new URL(success_url);

            new URL(cancel_url);

        } catch (error) {

            throw new Error('Invalid URL format provided');

        }

    }

    sanitizeUrl(url) {

        // Remove any dangerous characters or scripts

        return url.replace(/[<>'"]/g, '');

    }
}

module.exports = PaymentService;