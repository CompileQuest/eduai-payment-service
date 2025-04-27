const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PaymentRouter } = require('./api/routes');
const HandleErrors = require('./utils/error-handler')

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.dev';
dotenv.config({ path: envFile });

module.exports = async (app) => {

    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true, // if you're using cookies, sessions, or auth headers
    }));
    app.use(express.static(__dirname + '/public'))

    // app.use((req,res,next)=>{
    //     console.log(req);
    //     next();
    // })
    // Listen to Events
    // appEvent(app);



    //api
    PaymentRouter(app);

    // error handling
    app.use(HandleErrors);

}