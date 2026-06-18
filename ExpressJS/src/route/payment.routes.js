import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import { authorize, verifyToken } from '../middleware/auth.middleware.js';
import { USER_ROLE } from '../constants/user.constants.js';

const router = express.Router();

// Frontend gọi để tạo URL thanh toán
router.post(
    '/api/payment/create-vnpay',
    verifyToken,
    authorize(USER_ROLE.USER, USER_ROLE.ADMIN),
    paymentController.createPaymentUrl
);

// VNPay gọi về (server-to-server)
router.get(
    '/api/payment/vnpay-ipn',
    paymentController.vnpayIpn
);

// User được redirect về từ VNPay
router.get(
    '/api/payment/vnpay-return',
    paymentController.vnpayReturn
);

// API cho Frontend gọi để xác thực chữ ký (trả về JSON)
router.get(
    '/api/payment/verify-return',
    paymentController.verifyReturnUrlAPI
);

// Frontend gọi để kiểm tra trạng thái
router.get(
    '/api/payment/order/:id/status',
    verifyToken,
    authorize(USER_ROLE.USER, USER_ROLE.ADMIN),
    paymentController.getPaymentStatus
);

export default router;
