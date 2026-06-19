import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
    const navigate = useNavigate();

    return (
        <Result
            status="error"
            title="Thanh toán thất bại!"
            subTitle="Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."
            extra={[
                <Button type="primary" key="console" onClick={() => navigate('/checkout')}>
                    Thử lại
                </Button>,
                <Button key="buy" onClick={() => navigate('/')}>
                    Quay về trang chủ
                </Button>,
            ]}
        />
    );
};

export default PaymentFailed;