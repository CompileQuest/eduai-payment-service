// utils/logger.js
import winston from 'winston';
import { NODE_ENV } from '../config/index.js';
// Set log level based on environment
const logLevel = NODE_ENV === 'production' ? 'info' : 'debug';

const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize({ all: true }), // colored logs
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(), // Print to terminal
        // Optional: Save to log file
        // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

export default logger;
