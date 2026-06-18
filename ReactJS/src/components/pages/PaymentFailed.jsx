import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Result, Space } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PaymentFailedPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Tùy chọn: Làm sạch URL để người dùng không thấy các tham số lỗi
        if (location.search) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location]);

    return (
        <div style={{ background: '#fff1f2', minHeight: '100vh', padding: '40px 20px', display: 'flex', alignItems: 'center' }}>
            <Card style={{ maxWidth: 600, margin: 'auto', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.1)', width: '100%' }}>
                <Result
                    status="error"
                    icon={<CloseCircleOutlined style={{ fontSize: 72, color: '#ef4444' }} />}
                    title={<Title level={2} style={{ color: '#b91c1c', marginTop: 16 }}>Thanh toán thất bại!</Title>}
                    subTitle={
                        <Text style={{ fontSize: 16 }}>
                            Đã có lỗi xảy ra trong quá trình thanh toán hoặc bạn đã hủy giao dịch. Vui lòng thử lại.
                        </Text>
                    }
                    extra={
                        <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 24 }}>
                            <Button type="primary" size="large" block onClick={() => navigate('/history')} style={{ borderRadius: 8 }}>
                                Thử lại với đơn hàng đã tạo
                            </Button>
                            <Button size="large" block onClick={() => navigate('/cart')} style={{ borderRadius: 8 }}>
                                Quay lại giỏ hàng
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

export default PaymentFailedPage;