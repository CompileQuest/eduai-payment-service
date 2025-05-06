// todo : routes => controller => service => repository 
// todo : unit testing for each layer 

import express from 'express';
import { PORT } from './src/config/index.js';
import DatabaseConnection from './src/database/connection.js';
import expressApp from './src/express-app.js';
import logger from './src/utils/logger.js';


const StartServer = async () => {

    const app = express();

    await DatabaseConnection();

    await expressApp(app);

    app.listen(PORT, () => {
        logger.info(`✅ listening to port ${PORT}`);
    })
        .on('error', (err) => {
            logger.error(err);
            process.exit();
        })
}

StartServer();