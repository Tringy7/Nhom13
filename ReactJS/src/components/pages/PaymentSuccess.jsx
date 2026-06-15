import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Result, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        // Nếu có vnp_ResponseCode và nó khác '00', tức là thất bại, chuyển hướng
        if (params.has('vnp_ResponseCode') && params.get('vnp_ResponseCode') !== '00') {
            navigate('/payment/failed', { replace: true });
            return;
        }

        // Tùy chọn: Làm sạch URL (xóa đi chuỗi query loằng ngoằng của VNPay)
        // để người dùng chỉ thấy /payment/success
        if (location.search) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location.search, navigate]);

    return (
        <div style={{ background: '#f0f9ff', minHeight: '100vh', padding: '40px 20px', display: 'flex', alignItems: 'center' }}>
            <Card style={{ maxWidth: 600, margin: 'auto', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.1)', width: '100%' }}>
                <Result
                    status="success"
                    icon={<CheckCircleOutlined style={{ fontSize: 72, color: '#22c55e' }} />}
                    title={<Title level={2} style={{ color: '#15803d', marginTop: 16 }}>Thanh toán thành công!</Title>}
                    subTitle={<Text style={{ fontSize: 16 }}>Đơn hàng của bạn đã được thanh toán và ghi nhận. Cảm ơn bạn đã tin tưởng mua sắm tại UTESHOP.</Text>}
                    extra={
                        <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 24 }}>
                            <Button type="primary" size="large" block onClick={() => navigate('/history')} style={{ borderRadius: 8 }}>
                                Xem đơn hàng của tôi
                            </Button>
                            <Button size="large" block onClick={() => navigate('/products')} style={{ borderRadius: 8 }}>
                                Tiếp tục mua sắm
                            </Button>
                            <Button type="link" onClick={() => navigate('/')}>
                                Về trang chủ
                            </Button>
                        </Space>
                    }
                />
            </Card>
        </div>
    );
};

export default PaymentSuccessPage;
