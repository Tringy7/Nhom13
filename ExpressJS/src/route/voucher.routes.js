import express from 'express';
import voucherController from '../controllers/voucher.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Lấy danh sách voucher CỦA TÔI (đã nhận)
router.get(
    '/api/vouchers/my',
    verifyToken,
    voucherController.getMyVouchers
);

// Lấy danh sách voucher CÓ SẴN (chưa nhận)
router.get(
    '/api/vouchers/available',
    voucherController.getAvailableVouchers
);

// User "lưu" một voucher vào ví
router.post(
    '/api/vouchers/receive/:voucherId',
    verifyToken,
    voucherController.receiveVoucher
);

// Áp dụng thử voucher ở màn checkout để xem giảm bao nhiêu
router.post(
    '/api/vouchers/apply',
    verifyToken,
    voucherController.applyVoucher
);

// Lấy số điểm hiện có
router.get(
    '/api/rewards/balance',
    verifyToken,
    voucherController.getRewardBalance
);

// Lấy lịch sử điểm
router.get(
    '/api/rewards/history',
    verifyToken,
    voucherController.getRewardHistory
);

export default router;