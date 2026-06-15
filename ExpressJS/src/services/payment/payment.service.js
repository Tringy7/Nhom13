import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment';
import vnpayConfig from '../../config/vnpay.js';
import db from '../../models/index.js';

const { Order, Payment } = db;

function sortObject(obj) {
    const plainObj = Object.fromEntries(Object.entries(obj || {}));
    const sorted = {};

    Object.keys(plainObj)
        .sort((a, b) => a.localeCompare(b))
        .forEach((key) => {
            sorted[key] = encodeURIComponent(plainObj[key]).replace(/%20/g, "+");
        });

    return sorted;
}

const createPaymentUrl = async (orderId, amount, ipAddr, transaction = null) => {
    const order = await Order.findByPk(orderId, { transaction });
    if (!order) throw new Error('Order not found');

    const tmnCode = vnpayConfig.vnp_TmnCode;
    const secretKey = vnpayConfig.vnp_HashSecret;
    let vnpUrl = vnpayConfig.vnp_Url;
    const returnUrl = vnpayConfig.vnp_ReturnUrl;
    
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const txnRef = `${orderId}_${date.getTime()}`;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = txnRef;
    vnp_Params['vnp_OrderInfo'] = `Thanh toan cho don hang #${orderId}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;

    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    return vnpUrl;
};

const verifyReturn = (vnp_Params) => {
    const params = Object.fromEntries(Object.entries(vnp_Params || {}));
    const secureHash = params['vnp_SecureHash'];
    const secretKey = vnpayConfig.vnp_HashSecret;

    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    const sortedParams = sortObject(params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    return secureHash === signed;
};

export default {
    createPaymentUrl,
    verifyReturn
};
