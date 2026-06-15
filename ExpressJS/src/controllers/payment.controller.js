import paymentService from '../services/payment/payment.service.js';
import db from '../models/index.js';
import { PAYMENT_METHOD, PAYMENT_STATUS } from '../constants/payment.constants.js';
import { ORDER_STATUS } from '../constants/order.constants.js';
import qs from 'qs';

const { Order, Payment, sequelize } = db;

const createPaymentUrl = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.id;

        const order = await Order.findOne({ where: { id: orderId, userId } });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const [payment, created] = await Payment.findOrCreate({
            where: { orderId: order.id },
            defaults: {
                method: PAYMENT_METHOD.VNPAY,
                status: PAYMENT_STATUS.PENDING,
                amount: order.totalPrice,
            }
        });

        if (!created && payment.status === PAYMENT_STATUS.PAID) {
            return res.status(400).json({ success: false, message: 'Order has been paid' });
        }
        
        if (payment.method !== PAYMENT_METHOD.VNPAY) {
            await payment.update({ method: PAYMENT_METHOD.VNPAY });
        }

        const ipAddr = req?.headers?.['x-forwarded-for']
            || req?.connection?.remoteAddress
            || req?.ip
            || '127.0.0.1';
        const paymentUrl = await paymentService.createPaymentUrl(order.id, order.totalPrice, ipAddr);

        res.status(200).json({ success: true, paymentUrl });
    } catch (error) {
        console.error('Create VNPay URL error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const vnpayIpn = async (req, res) => {
    const vnp_Params = req.query;
    const isValidSignature = paymentService.verifyReturn(vnp_Params);

    if (!isValidSignature) {
        return res.status(200).json({ RspCode: '97', Message: 'Invalid Signature' });
    }

    const orderId = vnp_Params['vnp_TxnRef'].split('_')[0];
    const amount = Number(vnp_Params['vnp_Amount']) / 100;
    const responseCode = vnp_Params['vnp_ResponseCode'];

    const t = await sequelize.transaction();
    try {
        const payment = await Payment.findOne({ where: { orderId }, transaction: t });

        if (!payment) {
            await t.rollback();
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }

        if (payment.status === PAYMENT_STATUS.PAID) {
            await t.rollback();
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        if (Number(payment.amount) !== amount) {
            await t.rollback();
            return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
        }

        if (responseCode === '00') {
            await payment.update({
                status: PAYMENT_STATUS.PAID,
                transactionId: vnp_Params['vnp_TransactionNo'],
                paidAt: new Date()
            }, { transaction: t });

            await Order.update(
                { status: ORDER_STATUS.CONFIRMED },
                { where: { id: orderId }, transaction: t }
            );
        } else {
            await payment.update({ status: PAYMENT_STATUS.FAILED }, { transaction: t });
        }

        await t.commit();

        const successResponse = { RspCode: '00', Message: 'Confirm Success' };
        console.log('VNPay IPN success response JSON:', JSON.stringify(successResponse, null, 2));
        res.status(200).json(successResponse);
    } catch (error) {
        await t.rollback();
        console.error('IPN Error:', error);
        res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};

const vnpayReturn = (req, res) => {
    const vnp_Params = req.query;
    const isValid = paymentService.verifyReturn(vnp_Params);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (isValid && vnp_Params['vnp_ResponseCode'] === '00') {
        res.redirect(`${frontendUrl}/payment/success?${qs.stringify(vnp_Params, { encode: false })}`);
    } else {
        res.redirect(`${frontendUrl}/payment/failed?${qs.stringify(vnp_Params, { encode: false })}`);
    }
};

// API cho Frontend gọi để xác thực chữ ký và trả về trạng thái đơn giản
const verifyReturnUrlAPI = async (req, res) => {
    const vnp_Params = req.query;
    const isValid = paymentService.verifyReturn(vnp_Params);

    if (!isValid) {
        return res.status(400).json({
            success: false,
            message: 'Chữ ký không hợp lệ'
        });
    }

    const orderId = vnp_Params['vnp_TxnRef'] ? vnp_Params['vnp_TxnRef'].split('_')[0] : null;
    const amount = Number(vnp_Params['vnp_Amount'] || 0) / 100;
    const responseCode = vnp_Params['vnp_ResponseCode'] || '99';

    const t = await sequelize.transaction();

    try {
        if (!orderId) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Thanh toán thất bại' });
        }

        const payment = await Payment.findOne({ where: { orderId }, transaction: t });

        if (!payment) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Thanh toán thất bại' });
        }

        if (Number(payment.amount) !== amount) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Thanh toán thất bại' });
        }

        if (responseCode === '00') {
            await payment.update({
                status: PAYMENT_STATUS.PAID,
                transactionId: vnp_Params['vnp_TransactionNo'] || payment.transactionId,
                paidAt: new Date()
            }, { transaction: t });

            await Order.update(
                { status: ORDER_STATUS.CONFIRMED },
                { where: { id: orderId }, transaction: t }
            );
        } else {
            await payment.update({ status: PAYMENT_STATUS.FAILED }, { transaction: t });
        }

        await t.commit();

        return res.status(responseCode === '00' ? 200 : 400).json({
            success: responseCode === '00',
            message: responseCode === '00' ? 'Thanh toán thành công' : 'Thanh toán thất bại'
        });
    } catch (error) {
        await t.rollback();
        console.error('Verify VNPay return error:', error);
        return res.status(500).json({ success: false, message: 'Thanh toán thất bại' });
    }
};

const getPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id, {
            include: [{ model: Payment, as: 'payment' }]
        });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({
            orderId: order.id,
            paymentStatus: order.payment?.status,
            orderStatus: order.status
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export default {
    createPaymentUrl,
    vnpayIpn,
    vnpayReturn,
    verifyReturnUrlAPI,
    getPaymentStatus
};
