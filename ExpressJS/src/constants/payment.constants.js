export const PAYMENT_METHOD = Object.freeze({
    COD: 'COD',
    MOMO: 'MOMO',
    VNPAY: 'VNPAY',
    ZALOPAY: 'ZALOPAY'
});

export const PAYMENT_STATUS = Object.freeze({
    PENDING: 'PENDING',      // Đang chờ thanh toán
    PROCESSING: 'PROCESSING',// VNPay đã callback, đang chờ xác thực
    PAID: 'PAID',            // Thanh toán thành công
    FAILED: 'FAILED',        // Thanh toán thất bại
    REFUNDED: 'REFUNDED'     // Đã hoàn tiền
});