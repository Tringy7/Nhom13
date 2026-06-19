import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import { verifyVNPayReturn } from '../util/api/payment.api';

const VnPayReturn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const data = Object.fromEntries(params.entries());

                await verifyVNPayReturn(data);
                navigate('/payment/success');
            } catch (error) {
                message.error(error.response?.data?.message || 'Xác minh thanh toán VNPay thất bại.');
                navigate('/payment/failed');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [location, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spin spinning={loading} size="large" tip="Đang xử lý thanh toán..." />
        </div>
    );
};

export default VnPayReturn;