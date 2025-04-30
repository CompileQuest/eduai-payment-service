import mongoose from 'mongoose';
import { MONGODB_URI } from '../config/index.js';

const DatabaseConnection = async () => {
    try {
        await mongoose.connect(MONGODB_URI); // ← Clean, modern syntax
        console.log('✅ Db Connected');
    } catch (error) {
        console.log('❌ Error connecting to DB:', error);
        process.exit(1);
    }
};

export default DatabaseConnection;
