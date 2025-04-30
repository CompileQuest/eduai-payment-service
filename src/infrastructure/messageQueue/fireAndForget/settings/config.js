import { RABBITMQ_URL, SERVICE_NAME } from '../../../../config/index.js';
import bindingsConfig from './bindingsConfig.js';


export default {
    rabbitMQ: {
        url: RABBITMQ_URL,
        exchange: bindingsConfig[SERVICE_NAME].exchange,
        queue: bindingsConfig[SERVICE_NAME].queue,
        bindings: bindingsConfig[SERVICE_NAME].bindings,
    },
};
