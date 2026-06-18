import 'dotenv/config';

const vnpayConfig = {
    vnp_TmnCode: process.env.VNP_TMNCODE || 'YOUR_VNPAY_TMNCODE',
    vnp_HashSecret: process.env.VNP_HASHSECRET || 'YOUR_VNPAY_HASHSECRET',
    vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: process.env.VNP_RETURN_URL || process.env.VNP_RETURNURL || 'http://localhost:5173/payment/success',
};

export default vnpayConfig;