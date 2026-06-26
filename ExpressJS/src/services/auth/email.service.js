
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport(
    process.env.EMAIL_SERVICE
        ? {
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        }
        : {
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT || 587),
            secure: String(process.env.EMAIL_SECURE || 'false').toLowerCase() === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        }
);

export const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        replyTo: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Mã OTP xác thực đăng ký tài khoản',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #4A90E2;">Xác thực tài khoản</h2>
                <p>Xin chào,</p>
                <p>Mã OTP của bạn là:</p>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333; text-align: center; padding: 16px; background: #f5f5f5; border-radius: 6px;">
                    ${otp}
                </div>
                <p style="color: #888; margin-top: 16px;">Mã có hiệu lực trong <b>${process.env.OTP_EXPIRY / 60 || 5} phút</b>.</p>
                <p style="color: #888;">Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Lỗi gửi email OTP:', error);
        throw error;
    }
};

export const sendOrderSuccessEmail = async (email, order) => {
    const items = Array.isArray(order.items) ? order.items : [];

    const itemsRows = items
        .map((item) => {
            const productName = item.product?.name || `Sản phẩm #${item.productId}`;
            const lineTotal = Number(item.price) * Number(item.quantity);
            return `
                <tr>
                    <td style="padding:8px 0;color:#111827;font-size:14px;">${productName}</td>
                    <td style="padding:8px 0;color:#4b5563;font-size:14px;text-align:center;">x${item.quantity}</td>
                    <td style="padding:8px 0;color:#111827;font-size:14px;text-align:right;">${lineTotal.toLocaleString('vi-VN')} VNĐ</td>
                </tr>
            `;
        })
        .join('');

    const discountRow =
        Number(order.discountAmount) > 0
            ? `
                <p style="margin:8px 0;">
                    <strong>Giảm giá${order.couponCode ? ` (${order.couponCode})` : ''}:</strong>
                    -${Number(order.discountAmount).toLocaleString('vi-VN')} VNĐ
                </p>
            `
            : '';

    const mailOptions = {
        from: process.env.EMAIL_USER,
        replyTo: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `🎉 Đặt hàng thành công - Đơn hàng #${order.id}`,
        html: `
            <div style="background:#f4f6f8;padding:40px 0;font-family:Arial,sans-serif;">
                <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <div style="background:#2563eb;padding:24px;text-align:center;">
                        <h1 style="color:#fff;margin:0;font-size:24px;">
                            UTE Laptop Store
                        </h1>
                    </div>

                    <!-- Content -->
                    <div style="padding:32px;">
                        <h2 style="margin-top:0;color:#111827;">
                            🎉 Đặt hàng thành công!
                        </h2>

                        <p style="color:#4b5563;font-size:15px;line-height:1.6;">
                            Cảm ơn bạn đã mua sắm tại <strong>UTE Laptop Store</strong>.
                            Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý.
                        </p>

                        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:24px 0;">
                            <p style="margin:8px 0;">
                                <strong>Mã đơn hàng:</strong>
                                #${order.id}
                            </p>

                            <p style="margin:8px 0;">
                                <strong>Trạng thái:</strong>
                                ${order.orderStatus}
                            </p>

                            <p style="margin:8px 0;">
                                <strong>Địa chỉ giao hàng:</strong>
                                ${order.shippingAddress}
                            </p>

                            <p style="margin:8px 0;">
                                <strong>Số điện thoại:</strong>
                                ${order.phoneNumber}
                            </p>

                            ${order.note ? `<p style="margin:8px 0;"><strong>Ghi chú:</strong> ${order.note}</p>` : ''}

                            <p style="margin:8px 0;">
                                <strong>Ngày đặt:</strong>
                                ${new Date(order.createdAt || Date.now()).toLocaleString('vi-VN')}
                            </p>
                        </div>

                        ${
            itemsRows
                ? `
                        <table style="width:100%;border-collapse:collapse;margin:24px 0;">
                            <thead>
                                <tr style="border-bottom:2px solid #e5e7eb;">
                                    <th style="padding:8px 0;text-align:left;color:#6b7280;font-size:13px;">Sản phẩm</th>
                                    <th style="padding:8px 0;text-align:center;color:#6b7280;font-size:13px;">SL</th>
                                    <th style="padding:8px 0;text-align:right;color:#6b7280;font-size:13px;">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody style="border-bottom:2px solid #e5e7eb;">
                                ${itemsRows}
                            </tbody>
                        </table>
                        `
                : ''
        }

                        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:24px 0;">
                            <p style="margin:8px 0;">
                                <strong>Tổng tiền:</strong>
                                ${Number(order.totalAmount).toLocaleString('vi-VN')} VNĐ
                            </p>

                            ${discountRow}

                            ${
            Number(order.pointsRedeemed) > 0
                ? `<p style="margin:8px 0;"><strong>Điểm đã sử dụng:</strong> ${order.pointsRedeemed}</p>`
                : ''
        }

                            <p style="margin:8px 0;font-size:16px;">
                                <strong>Tổng thanh toán:</strong>
                                <strong style="color:#2563eb;">${Number(order.totalPrice).toLocaleString('vi-VN')} VNĐ</strong>
                            </p>
                        </div>

                        <p style="color:#4b5563;font-size:15px;line-height:1.6;">
                            Chúng tôi sẽ gửi email tiếp theo khi đơn hàng được xác nhận và chuẩn bị giao.
                        </p>

                        <div style="text-align:center;margin-top:30px;">
                            <a href="${process.env.FRONTEND_URL}/orders"
                               style="background:#2563eb;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;display:inline-block;font-weight:bold;">
                                Xem đơn hàng
                            </a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background:#f9fafb;padding:20px;text-align:center;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb;">
                        <p style="margin:0;">
                            © 2026 UTE Laptop Store
                        </p>
                        <p style="margin-top:8px;">
                            Email này được gửi tự động, vui lòng không trả lời.
                        </p>
                    </div>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Lỗi gửi email xác nhận đơn hàng:', error);
        throw error;
    }
};