import UserRouterV1 from './v1/payment.js';
import appEventRouterV1 from './v1/app-events.js';

export default (app) => {
    app.use('/api/v1/payment', UserRouterV1);
    app.use('/api/v1/payment/app-events', appEventRouterV1); // Corrected route path.
};