import express from 'express';
import authController from '../controllers/auth.controller.js';

import {
    registerLimiter,
    otpLimiter
} from '../middleware/rateLimiter.js';

import {
    registerValidator,
    verifyOtpValidator
} from '../middleware/validator.js';

import authRoutes from './auth.routes.js';
import homeRoutes from './home.routes.js';
import productRoutes from './product.routes.js';
import productFeatureRoutes from './product-feature.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import voucherRoutes from './voucher.routes.js'; // Thêm route mới


let router = express.Router();

let initWebRoutes = (app) => {

    router.post(
        '/api/auth/register',
        registerLimiter,
        registerValidator,
        authController.register
    );

    router.post(
        '/api/auth/verify-otp',
        otpLimiter,
        verifyOtpValidator,
        authController.verifyRegistrationOtp
    );

    router.post(
        '/api/auth/resend-otp',
        otpLimiter,
        authController.resendRegistrationOtp
    );

    // mount API routes from auth.routes, home.routes and product.routes
    app.use('/', authRoutes);
    app.use('/', homeRoutes);
    app.use('/', productRoutes);
    app.use('/', productFeatureRoutes);
    app.use('/', cartRoutes);
    app.use('/', orderRoutes);
    app.use('/', voucherRoutes); // Sử dụng route mới


    return app.use('/', router);
};

export default initWebRoutes;