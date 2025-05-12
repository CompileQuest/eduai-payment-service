import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

import apiRoutes from './api/routes/index.js';
import HandleErrors from './utils/error-handler.js';
import './config/stripeClient.js'
import './infrastructure/messageQueue/fireAndForget/RabbitMQClient.js';
// ESM replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.dev';
dotenv.config({ path: envFile });

const setupApp = async (app) => {
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true,
    }));
    app.use(cookieParser());

    app.use(express.static(path.join(__dirname, 'public')));

    // API routes
    apiRoutes(app);

    // Error handling middleware
    app.use(HandleErrors);
};

export default setupApp;
