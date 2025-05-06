// config/stripeClient.js
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from './index.js';
import logger from '../utils/logger.js';

let stripeInstance;

try {
    if (!STRIPE_SECRET_KEY) {
        throw new Error('Stripe secret key is missing!');
    }

    stripeInstance = new Stripe(STRIPE_SECRET_KEY);
    logger.info('✅ Stripe initialized successfully');
} catch (error) {
    logger.error('❌ Stripe initialization failed:', error.message);
    process.exit(1); // Optional: kill the process if Stripe is critical
}

export default stripeInstance;