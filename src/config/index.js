// config/config.js or config/env.js
import dotenv from 'dotenv';



dotenv.config();

// Define required environment variables
const requiredEnvVars = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  SERVICE_NAME: process.env.SERVICE_NAME,
  NODE_ENV: process.env.NODE_ENV
};

// Validate
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
} else {
  console.log('✅ All environment variables loaded successfully');
}

// Export them for use
export const {
  PORT,
  MONGODB_URI,
  STRIPE_PUBLIC_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_SECRET_KEY,
  RABBITMQ_URL,
  SERVICE_NAME,
  NODE_ENV
} = requiredEnvVars;
