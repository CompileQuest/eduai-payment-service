import mongoose from 'mongoose';
import { MONGODB_URI } from '../config/index.js';
import logger from '../utils/logger.js';




// Todo I need to add a retry mechanism here ( Expenontial Backoff or Circuit Break).
const DatabaseConnection = async () => {
    try {
        await mongoose.connect(MONGODB_URI); // ← Clean, modern syntax
        logger.info('✅ Db Connected');
    } catch (error) {
        logger.error('❌ Error connecting to DB:', error);
        process.exit(1);
    }
};

export default DatabaseConnection;
