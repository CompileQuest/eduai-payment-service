import { RoutingKeys } from "./routingKeys.js";

const bindingsConfig = {
    payment_service: {
        exchange: "payment_exchange",
        queue: "payment_queue",
        bindings: [
            {
                exchange: "course_exchange", routingKeys: [RoutingKeys.COURSE_CREATED],
            },
            {
                exchange: "webhook_exchange", routingKeys: [RoutingKeys.PAYMENT_FAILED, RoutingKeys.PAYMENT_INTENT_SUCCESS, RoutingKeys.PAYMENT_SESSION_COMPLETED, RoutingKeys.PAYMENT_FAILED]
            }
        ],
    }
};


export default bindingsConfig;
