import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    return (
        <Result
            status="success"
            title="Thanh toán thành công!"
            subTitle="Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý."
            extra={[
                <Button type="primary" key="console" onClick={() => navigate('/history')}>
                    Xem lịch sử đơn hàng
                </Button>,
                <Button key="buy" onClick={() => navigate('/')}>
                    Tiếp tục mua sắm
                </Button>,
            ]}
        />
    );
};

export default PaymentSuccess;