import PaymentService from "../../services/payment-service.js";
import { RoutingKeys } from "./fireAndForget/settings/routingKeys.js";
import { randomUUID } from 'crypto';

class MessageHandler {
    constructor() {
        this.paymentService = new PaymentService();

        // Bind handlers
        this.handleCourseCreated = this.handleCourseCreated.bind(this);
        this.handlePaymentCompleted = this.handlePaymentCompleted.bind(this);
        this.handleUnknownMessage = this.handleUnknownMessage.bind(this);


        // Use routing keys instead of hardcoded strings
        this.handlers = {
            [RoutingKeys.COURSE_CREATED]: this.handleCourseCreated,
            [RoutingKeys.USER_UPDATED]: this.handleUserUpdated,
            [RoutingKeys.PAYMENT_SESSION_COMPLETED]: this.handlePaymentCompleted,
        };
    }

    async handleMessage(message) {
        const { type, payload } = message;
        const handler = this.handlers[type] || this.handleUnknownMessage;
        return await handler(payload, type);
    }

    async handleCourseCreated(payload, type) {
        console.log(`📘 [${type}] Course Created Payload:`, payload);

        const { id, title, price, thumbnailUrl } = payload;
        console.log("this si the price ", price);

        try {
            const createdCourse = await this.paymentService.createCourse(id, title, price, thumbnailUrl);

            return {
                success: true,
                message: `Successfully handled ${type}`,
                data: createdCourse,
            };
        } catch (error) {
            console.error(`❌ Failed to handle ${type}:`, error);

            return {
                success: false,
                message: `Failed to handle ${type}: ${error.message}`,
            };
        }
    }




    async handlePaymentCompleted(payload, type) {
        try {
            console.log(`💰 [${type}] Payment Completed:`, payload);

            // Extract sessionId and paymentIntent from the payload
            const sessionId = payload.id;
            const paymentIntent = payload.payment_intent;

            console.log("this is the session id ", sessionId);
            console.log("this is the paymentIntent ", paymentIntent);

            // Handle the completed payment
            const result = await this.paymentService.completePaymentIntent(payload);

            // Log result if successful
            console.log("Payment Intent completed successfully:", result);

            return { success: true, message: `Handled ${type} successfully` };
        } catch (error) {
            // Log the error for debugging purposes
            console.error(`❌ Error processing ${type} payment:`, error);

            // Return error response with details for tracking
            return { success: false, message: `Error handling ${type}: ${error.message}` };
        }
    }


    async handleUnknownMessage(payload, type) {
        console.warn(`❓ Unknown message type: ${type}`, payload);
        return { success: false, message: `Unknown message type: ${type}` };
    }
}

export default MessageHandler;
