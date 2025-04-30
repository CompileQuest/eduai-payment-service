import { RoutingKeys } from "./routingKeys.js";

const bindingsConfig = {
    payment_service: {
        exchange: "payment_exchange",
        queue: "payment_queue",
        bindings: [
            { exchange: "course_exchange", routingKeys: [RoutingKeys.COURSE_CREATED] },
        ],
    }
};


export default bindingsConfig;
