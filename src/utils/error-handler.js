const { createLogger, transports } = require('winston');
const { AppError } = require('./app-errors');


const LogErrors = createLogger({
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'app_error.log' })
    ]
  });
    

  class ErrorLogger {
    constructor() {}

    async logError(err) {
        // Capture the current date and time for the log entry
        const timestamp = new Date().toISOString();
        
        console.log('==================== Start Error Logger ===============');
        console.log(`Error Type: ${err.name}`); // Log the type of the error (e.g., TypeError)
        console.log('\n')
        console.log(`=====Error Message Start Here=====`); // Log the message associated with the error
        console.log('\n')
        console.log(`Error Message: ${err.message}`); // Log the message associated with the error
        console.log('\n')
        console.log(`=====Error Message ends Here======`); // Log the message associated with the error
        console.log('\n')
        console.log(`===========Error stack Starts here =========`)
        console.log('\n')
        console.log(`Error Stack: ${err.stack}`); // Log the stack trace for more details
        console.log('\n')
        console.log(`===========Error stack Ends here =========`)
        console.log('\n')


        console.log('==================== End Error Logger ===============');
        
        // This is a winston loger can use it or get rid of it for now i prefer mine the custome format i in the above code
        LogErrors.log({
            private: true,
            level: 'error',
            message: `${timestamp} - Error Type: ${err.name}, Message: ${err.message}, Stack: ${err.stack}`
        });

        return false;
    }

    isTrustError(error) {
        if (error instanceof AppError) {
            return error.isOperational;
        } else {
            return false;
        }
    }
}

const ErrorHandler = async(err,req,res,next) => {
    
    const errorLogger = new ErrorLogger();

    process.on('uncaughtException', (reason, promise) => {
        console.log(reason, 'UNHANDLED');
        throw reason; // need to take care
    })

    process.on('uncaughtException', (error) => {
        errorLogger.logError(error);
        if(errorLogger.isTrustError(err)){
            //process exist // need restart
        }
    })
    
    // console.log(err.description, '-------> DESCRIPTION')
    // console.log(err.message, '-------> MESSAGE')
    // console.log(err.name, '-------> NAME')
    if(err){
        await errorLogger.logError(err);
        if(errorLogger.isTrustError(err)){
            if(err.errorStack){
                const errorDescription = err.errorStack;
                return res.status(err.statusCode).json({'message': errorDescription})
            }
            return res.status(err.statusCode).json({'message': err.message })
        }else{
            //process exit // terriablly wrong with flow need restart
        }
        return res.status(err.statusCode).json({'message': err.message})
    }
    next();
}

module.exports = ErrorHandler;