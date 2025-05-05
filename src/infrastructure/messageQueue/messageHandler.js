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
            [RoutingKeys.PAYMENT_COMPLETED]: this.handlePaymentCompleted,
        };
    }

    async handleMessage(message) {
        const { type, payload } = message;
        const handler = this.handlers[type] || this.handleUnknownMessage;
        return await handler(payload, type);
    }

    async handleCourseCreated(payload, type) {
        console.log(`📘 [${type}] Course Created Payload:`, payload);

        const { id, title, price, thumbnail_url } = payload;
        const randomId = randomUUID(); // Generate a unique test ID

        try {
            const createdCourse = await this.paymentService.createCourse(randomId, title, price, thumbnail_url);

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
        console.log(`💰 [${type}] Payment Completed:`, payload);
        return { success: true, message: `Handled ${type}` };
    }

    async handleUnknownMessage(payload, type) {
        console.warn(`❓ Unknown message type: ${type}`, payload);
        return { success: false, message: `Unknown message type: ${type}` };
    }
}

export default MessageHandler;
