import { AppError } from './app-errors.js';
import chalk from 'chalk'; // For colored terminal output

class ErrorLogger {
    constructor() { }

    async logError(err) {
        // Define colors for different error types
        const errorColors = {
            Error: chalk.red.bold, // Red for generic errors
            TypeError: chalk.yellow.bold, // Yellow for type errors
            AppError: chalk.blue.bold, // Blue for custom AppError
            default: chalk.white.bold, // White for other errors
        };

        // Get the color for the current error type
        const color = errorColors[err.name] || errorColors.default;

        // Print the error in a clean, colorful format
        console.log(chalk.bgRed('🚨 [Error Logger] ===================='));
        console.log(color(`📛 Error Name: ${err.name}`));
        console.log(color(`📛 Error Description: ${err.description}`));
        console.log(color(`📛 status Code: ${err.statusCode}`));
        console.log(color(`📝 Message: ${err.message}`));
        console.log(color(`🔍 Stack: ${err.stack}`));
        console.log(chalk.bgRed('======================================'));
    }

    isTrustError(error) {
        // Check if the error is an instance of AppError
        return error instanceof AppError;
    }
}

const ErrorHandler = async (err, req, res, next) => {
    const errorLogger = new ErrorLogger();

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        console.log(chalk.bgRed('🛑 [Uncaught Exception]'), error);
        errorLogger.logError(error);
        if (!errorLogger.isTrustError(error)) {
            process.exit(1); // Exit process for untrusted errors
        }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        console.log(chalk.bgRed('🛑 [Unhandled Rejection]'), reason);
        throw reason; // Re-throw to handle it in the uncaughtException handler
    });

    // Handle the error
    if (err) {
        await errorLogger.logError(err);
        if (errorLogger.isTrustError(err)) {
            return res.status(err.statusCode).json({
                success: false,
                message: err.description // Message from the AppError instance
            });
        } else {
            // Untrusted error: Exit process
            console.log(chalk.bgRed('🛑 Fatal error encountered. Shutting down...'));
            process.exit(1);
        }
    }

    next();
};

export default ErrorHandler;