import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Typography, Button, Spin, Result, Row, Col, Divider, Image, Space, Form, Input, Popconfirm, message } from 'antd';
import { ArrowLeftOutlined, DollarCircleOutlined, WalletOutlined, CheckCircleOutlined, EnvironmentOutlined, PhoneOutlined, UserOutlined, MailOutlined, CarOutlined, RocketOutlined, TagOutlined, EditOutlined } from '@ant-design/icons';
import { getOrderById, createOrder } from '../util/api/order.api';
import { getUserCouponsApi, previewDiscountApi } from '../util/api/product-feature.api';
import { getImageUrl } from '../util/helpers';
import axios from '../util/axios.customize';

const { Title, Text, Paragraph } = Typography;

const styles = {
    pageWrapper: { background: '#f5f7fb', minHeight: '100vh', padding: '40px 0', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: 1400, margin: '0 auto', padding: '0 24px' },
    card: { background: '#fff', borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' },
    input: { height: 52, borderRadius: 14, background: '#f9fafb', border: '1px solid #e5e7eb', fontSize: 15 },
    primaryBtn: { height: 56, borderRadius: 16, fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)', border: 'none' },
    selectableCard: (selected) => ({
        padding: '20px 24px',
        borderRadius: 18,
        border: selected ? '2px solid #4f46e5' : '2px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        background: selected ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)' : '#fff',
        boxShadow: selected ? '0 0 20px rgba(79, 70, 229, 0.1)' : 'none',
    }),
    summaryCard: { borderRadius: 28, boxShadow: '0 14px 40px rgba(0,0,0,0.06)', position: 'sticky', top: 24, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' },
};

const CheckoutPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [deliveryMethod, setDeliveryMethod] = useState("standard");
    const [submitting, setSubmitting] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [pointsToUse, setPointsToUse] = useState(0);
    const [discountPreview, setDiscountPreview] = useState(null);
    const [coupons, setCoupons] = useState([]);

    useEffect(() => {
        if (orderId && orderId !== 'new') {
            fetchOrderDetails();
        } else if (location.state && location.state.selectedItems) {
            setOrder({
                id: 'Mới',
                items: location.state.selectedItems,
                status: 'new'
            });
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [orderId, location.state]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const res = await getOrderById(orderId);
            const data = res?.data?.data || res?.data;
            if (data) setOrder(data);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin đơn hàng:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCoupons = async () => {
        try {
            const res = await getUserCouponsApi();
            const data = res?.data || res || [];
            setCoupons(data);
        } catch (error) {
            setCoupons([]);
        }
    };

    const refreshDiscountPreview = async (nextCouponCode = couponCode, nextPoints = pointsToUse) => {
        if (!orderItems || orderItems.length === 0) return;

        try {
            const res = await previewDiscountApi({
                subtotal,
                couponCode: nextCouponCode || null,
                pointsToUse: Number(nextPoints || 0)
            });
            const data = res?.data || res;
            setDiscountPreview(data);
        } catch (error) {
            setDiscountPreview(null);
            if (nextCouponCode || Number(nextPoints || 0) > 0) {
                message.error(error?.response?.data?.message || 'Không áp dụng được ưu đãi');
            }
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

    const handleConfirmOrder = async (values) => {
        if (paymentMethod !== 'COD') {
            return message.info('Tính năng đang được phát triển 🚧');
        }
        setSubmitting(true);
        try {
            const payload = {
                paymentMethod: 'COD',
                shippingAddress: values.shippingAddress,
                phoneNumber: values.phoneNumber,
                note: values.note,
                couponCode: couponCode || null,
                pointsToUse: Number(pointsToUse || 0),
                items: order.items.map(item => ({
                    productId: item.productId || item.product?.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };
            
            await createOrder(payload);
            message.success('Đặt hàng thành công!');
            navigate('/history');
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xác nhận đơn hàng');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f7fb' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ background: '#f5f7fb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Result
                    status="404"
                    title="Không tìm thấy đơn hàng"
                    subTitle="Vui lòng quay lại giỏ hàng và chọn sản phẩm để thanh toán."
                    extra={<Button type="primary" onClick={() => navigate('/cart')} style={styles.primaryBtn}>Quay lại giỏ hàng</Button>}
                />
            </div>
        );
    }

    const isOrderConfirmed = order.status !== 'new' && order.status !== 'PENDING' && order.status !== 'pending';

    if (isOrderConfirmed) {
        return (
            <div style={{ background: '#f5f7fb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Result
                    status="success"
                    icon={<CheckCircleOutlined style={{ color: '#10b981' }} />}
                    title="Đơn hàng đã được xác nhận"
                    subTitle={`Đơn hàng #${order.id} của bạn đang được xử lý. Chúng tôi sẽ thông báo cho bạn khi đơn hàng được vận chuyển.`}
                    extra={[
                        <Button type="primary" key="history" onClick={() => navigate('/history')} style={styles.primaryBtn}>Xem lịch sử đơn hàng</Button>,
                        <Button key="home" onClick={() => navigate('/')} style={{ height: 56, borderRadius: 16 }}>Về trang chủ</Button>
                    ]}
                />
            </div>
        );
    }

    const orderItems = order.items || order.OrderItems || [];
    const subtotal = order.totalPrice || orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = deliveryMethod === 'express' ? 40000 : 0;
    const discountAmount = Number(discountPreview?.discountAmount || 0);
    const total = Math.max(0, subtotal + shippingFee - discountAmount);

    useEffect(() => {
        fetchCoupons();
    }, []);

    useEffect(() => {
        if (orderItems.length > 0) {
            refreshDiscountPreview();
        }
    }, [orderItems.length]);

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <div style={{ marginBottom: 40 }}>
                    <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/cart')} style={{ color: '#6b7280', fontWeight: 500, padding: 0 }}>
                        Quay lại giỏ hàng
                    </Button>
                    <Title level={2} style={{ fontSize: 36, fontWeight: 800, color: '#111827', marginTop: 16, letterSpacing: '-0.02em' }}>Thanh toán đơn hàng</Title>
                    <Paragraph style={{ fontSize: 16, color: '#6b7280' }}>Hoàn tất thông tin để xác nhận đơn hàng của bạn.</Paragraph>
                </div>

                <Form form={form} layout="vertical" onFinish={handleConfirmOrder} size="large">
                    <Row gutter={[40, 40]}>
                        {/* Left Column */}
                        <Col xs={24} lg={16}>
                            <Space direction="vertical" size={32} style={{ width: '100%' }}>
                                {/* Shipping Info */}
                                <Card title={<Space><EnvironmentOutlined style={{fontSize: 20}} /> <Text strong style={{fontSize: 18}}>Thông tin giao hàng</Text></Space>} bordered={false} style={styles.card} bodyStyle={{padding: 32}}>
                                    <Row gutter={24}>
                                        <Col span={12}>
                                            <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                                                <Input prefix={<UserOutlined style={{color: '#9ca3af'}} />} placeholder="Họ và tên người nhận" style={styles.input} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="phoneNumber" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                                                <Input prefix={<PhoneOutlined style={{color: '#9ca3af'}} />} placeholder="Số điện thoại" style={styles.input} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Form.Item name="shippingAddress" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
                                        <Input prefix={<MailOutlined style={{color: '#9ca3af'}} />} placeholder="Địa chỉ giao hàng chi tiết" style={styles.input} />
                                    </Form.Item>
                                    <Form.Item name="note" label={<Text strong style={{fontSize: 16, color: '#4b5563'}}>Ghi chú (tùy chọn)</Text>}>
                                        <Input.TextArea placeholder="Thêm ghi chú cho đơn hàng của bạn..." style={{...styles.input, height: 'auto', minHeight: 100, padding: 16}} />
                                    </Form.Item>
                                </Card>

                                {/* Order Items */}
                                <Card title={<Space><Text strong style={{fontSize: 18}}>Sản phẩm trong đơn hàng</Text></Space>} bordered={false} style={styles.card} bodyStyle={{padding: '8px 32px 32px'}}>
                                    <Space direction="vertical" style={{ width: '100%' }} size={0}>
                                        {orderItems.map((item, idx) => (
                                            <div key={item.id || idx} style={{padding: '20px 0', borderBottom: idx < orderItems.length - 1 ? '1px solid #f0f0f0' : 'none'}}>
                                                <Row gutter={24} align="middle">
                                                    <Col>
                                                        <div style={{width: 88, height: 88, background: '#f9fafb', borderRadius: 16, padding: 8, border: '1px solid #e5e7eb'}}>
                                                            <Image src={getImageUrl(item.product?.thumbnail || item.thumbnail || item.image || '')} preview={false} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                                                        </div>
                                                    </Col>
                                                    <Col flex="auto">
                                                        <Text strong style={{ fontSize: 16, display: 'block' }}>{item.product?.name || item.name || 'Sản phẩm'}</Text>
                                                        <Text type="secondary">Số lượng: {item.quantity}</Text>
                                                    </Col>
                                                    <Col>
                                                        <Text strong style={{ color: '#111827', fontSize: 18 }}>{formatPrice(item.price * item.quantity)}</Text>
                                                    </Col>
                                                </Row>
                                            </div>
                                        ))}
                                    </Space>
                                </Card>

                                {/* Delivery Method */}
                                <Card title={<Space><CarOutlined style={{fontSize: 20}} /> <Text strong style={{fontSize: 18}}>Phương thức vận chuyển</Text></Space>} bordered={false} style={styles.card} bodyStyle={{padding: 32}}>
                                    <Space direction="vertical" style={{width: '100%'}} size={16}>
                                        <div style={styles.selectableCard(deliveryMethod === 'standard')} onClick={() => setDeliveryMethod('standard')}>
                                            <Row justify="space-between" align="middle">
                                                <Space size="large">
                                                    <CarOutlined style={{fontSize: 24, color: '#4f46e5'}} />
                                                    <div>
                                                        <Text strong style={{fontSize: 16, display: 'block'}}>Giao hàng tiêu chuẩn</Text>
                                                        <Text type="secondary">Dự kiến 2-4 ngày</Text>
                                                    </div>
                                                </Space>
                                                <Text strong style={{fontSize: 16}}>Miễn phí</Text>
                                            </Row>
                                        </div>
                                        <div style={styles.selectableCard(deliveryMethod === 'express')} onClick={() => setDeliveryMethod('express')}>
                                            <Row justify="space-between" align="middle">
                                                <Space size="large">
                                                    <RocketOutlined style={{fontSize: 24, color: '#4f46e5'}} />
                                                    <div>
                                                        <Text strong style={{fontSize: 16, display: 'block'}}>Giao hàng nhanh</Text>
                                                        <Text type="secondary">Trong ngày (nội thành)</Text>
                                                    </div>
                                                </Space>
                                                <Text strong style={{fontSize: 16}}>+ {formatPrice(40000)}</Text>
                                            </Row>
                                        </div>
                                    </Space>
                                </Card>
                            </Space>
                        </Col>

                        {/* Right Column */}
                        <Col xs={24} lg={8}>
                            <Card bordered={false} style={styles.summaryCard} bodyStyle={{padding: 32}}>
                                <Title level={4} style={{ marginBottom: 32, fontWeight: 700, color: '#111827' }}>Tóm tắt đơn hàng</Title>
                                
                                <Space direction="vertical" size={20} style={{ width: '100%' }}>
                                    <Row justify="space-between"><Text style={{fontSize: 15, color: '#6b7280'}}>Tạm tính</Text><Text strong style={{fontSize: 15}}>{formatPrice(subtotal)}</Text></Row>
                                    <Row justify="space-between"><Text style={{fontSize: 15, color: '#6b7280'}}>Phí vận chuyển</Text><Text strong style={{fontSize: 15}}>{formatPrice(shippingFee)}</Text></Row>
                                    <Row justify="space-between"><Text style={{fontSize: 15, color: '#6b7280'}}>Giảm giá</Text><Text strong style={{fontSize: 15, color: '#10b981'}}>- {formatPrice(discountAmount)}</Text></Row>
                                    
                                    <div style={{padding: '16px 0'}}>
                                        <Space.Compact style={{ width: '100%' }}>
                                            <Input
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Mã giảm giá"
                                                size="large"
                                                style={{...styles.input, height: 48, borderRight: 'none'}}
                                                prefix={<TagOutlined style={{color: '#9ca3af'}} />}
                                            />
                                            <Button
                                                type="primary"
                                                size="large"
                                                onClick={() => refreshDiscountPreview(couponCode, pointsToUse)}
                                                style={{ height: 48, borderRadius: '0 14px 14px 0', background: '#111827', borderColor: '#111827', fontWeight: 600 }}
                                            >
                                                Áp dụng
                                            </Button>
                                        </Space.Compact>
                                        <div style={{ marginTop: 8 }}>
                                            <Text type="secondary">Điểm tích lũy sử dụng</Text>
                                            <Input
                                                value={pointsToUse}
                                                onChange={(e) => setPointsToUse(Number(e.target.value || 0))}
                                                placeholder="Nhập số điểm muốn dùng"
                                                style={{...styles.input, height: 44, marginTop: 6}}
                                            />
                                            <Button type="link" style={{ paddingLeft: 0 }} onClick={() => refreshDiscountPreview(couponCode, pointsToUse)}>
                                                Tính lại ưu đãi
                                            </Button>
                                            {coupons.length > 0 && (
                                                <div style={{ marginTop: 6 }}>
                                                    <Text type="secondary">Mã khả dụng: {coupons.slice(0, 3).map(c => c.code).join(', ')}</Text>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Divider style={{ margin: '8px 0' }} />

                                    <Row justify="space-between" align="bottom">
                                        <Text style={{ fontSize: 18, color: '#111827', fontWeight: 600 }}>Tổng cộng</Text>
                                        <Title level={2} style={{ color: '#4f46e5', margin: 0, fontWeight: 800 }}>{formatPrice(total)}</Title>
                                    </Row>
                                </Space>

                                <Divider style={{ margin: '24px 0' }} />

                                <Title level={5} style={{ marginBottom: 20, fontWeight: 600 }}>Phương thức thanh toán</Title>
                                <Space direction="vertical" style={{width: '100%'}} size={16}>
                                    <div style={styles.selectableCard(paymentMethod === 'COD')} onClick={() => setPaymentMethod('COD')}>
                                        <Space size="large">
                                            <DollarCircleOutlined style={{fontSize: 24, color: '#4f46e5'}} />
                                            <div>
                                                <Text strong style={{fontSize: 16, display: 'block'}}>Thanh toán khi nhận hàng (COD)</Text>
                                                <Text type="secondary">Thanh toán bằng tiền mặt</Text>
                                            </div>
                                        </Space>
                                    </div>
                                    <div style={{...styles.selectableCard(paymentMethod === 'E-Wallet'), opacity: 0.5, cursor: 'not-allowed'}} onClick={() => message.info('Tính năng đang được phát triển 🚧')}>
                                        <Space size="large">
                                            <WalletOutlined style={{fontSize: 24, color: '#6b7280'}} />
                                            <div>
                                                <Text strong style={{fontSize: 16, display: 'block', color: '#6b7280'}}>Ví điện tử / QR Code</Text>
                                                <Text type="secondary">MoMo, ZaloPay, VNPay (Coming soon)</Text>
                                            </div>
                                        </Space>
                                    </div>
                                </Space>

                                <div style={{ marginTop: 32 }}>
                                    <Button type="primary" htmlType="submit" block loading={submitting} style={styles.primaryBtn}>
                                        Xác nhận đặt hàng
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
};

export default CheckoutPage;