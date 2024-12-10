// todo : routes => controller => service => repository 
// todo : unit testing for each layer 


const express = require('express');
const { PORT } = require('./config');
const { DatabaseConnection } = require('./database');
const expressApp = require('./express-app');

const StartServer = async() => {

    const app = express();
    
    await DatabaseConnection();
    
    await expressApp(app);
    
    app.listen(PORT, () => {
        console.log(`listening to port ${PORT}`);
    })
    .on('error', (err) => {
        console.log(err);
        process.exit(); 
    })
}

StartServer();