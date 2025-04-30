import PaymentService from "../payment-service.js";
import { APIError, AppError, BadRequestError, NotFoundError } from "../../utils/app-errors.js"; // Assuming you have these custom error classes
const paymentService = new PaymentService();

const eventHandlers = {
    "user.created": async (payload) => {
        console.log("Handling user.created event...");
        return await paymentService.AddUser(payload);
    },
    "user.deleted": async (payload) => {
        console.log("Handling user.deleted event...");

        try {
            // Call the service method, no need for additional validation here
            const deletedUser = await paymentService.deleteUserById(payload.userId);

            // Return success response
            return {
                success: true,
                message: "User deleted successfully",
                data: deletedUser
            };
        } catch (error) {
            if (error instanceof AppError) {
                // Return error response if it's an instance of AppError
                return {
                    success: false,
                    message: error.message,
                    statusCode: error.statusCode
                };
            }

            // Return generic error if it's not an AppError
            return {
                success: false,
                message: "Failed to delete user",
                statusCode: 500
            };
        }
    },
    "user.exists": async (payload) => {
        console.log("Handling user.exists event...");
        return await paymentService.checkIfUserExistByUserName(payload.data);
    },

    // Add more event handlers as needed
};

/**
 * Resolves the appropriate handler for a given event type.
 * @param {string} eventType - The event type (e.g., "user.created").
 * @param {object} payload - The event payload.
 */
export const handleEvent = async (eventType, payload) => {
    if (eventHandlers[eventType]) {
        return await eventHandlers[eventType](payload);
    } else {
        console.warn(`No handler found for event: ${eventType}`);
        return {
            success: false,
            message: "Event handler not found",
            statusCode: 404
        };
    }
};


export default handleEvent;