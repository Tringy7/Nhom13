import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Typography, Button, Spin, Result, Row, Col, Divider, Image, Space, Form, Input, message, Modal, Empty, Tag, Radio } from 'antd';
import { ArrowLeftOutlined, WalletOutlined, EnvironmentOutlined, PhoneOutlined, UserOutlined, MailOutlined, TagOutlined, StarOutlined, RightOutlined } from '@ant-design/icons';
import { createOrder } from '../util/api/order.api';
import { createVNPayPaymentApi } from '../util/api/payment.api';
import { getMyVouchersApi, applyVoucherApi, getRewardBalanceApi } from '../util/api/voucher.api.js';
import { getImageUrl } from '../util/helpers';
import vnpayLogo from '../../assets/vnpay-logo.png';

const { Title, Text, Paragraph } = Typography;

const styles = {
    pageWrapper: { background: '#f5f7fb', minHeight: '100vh', padding: '40px 0', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: 1400, margin: '0 auto', padding: '0 24px' },
    card: { background: '#fff', borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' },
    input: { height: 52, borderRadius: 14, background: '#f9fafb', border: '1px solid #e5e7eb', fontSize: 15 },
    primaryBtn: { height: 56, borderRadius: 16, fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)', border: 'none' },
    summaryCard: { borderRadius: 28, boxShadow: '0 14px 40px rgba(0,0,0,0.06)', position: 'sticky', top: 24, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' },
    voucherRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', cursor: 'pointer' },
    voucherModalCard: { border: '1px solid #e5e7eb', borderRadius: 12, marginBottom: 12, padding: 16, transition: 'all 0.2s ease' },
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();
    
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');

    const [myVouchers, setMyVouchers] = useState([]);
    const [isVoucherModalVisible, setIsVoucherModalVisible] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    
    const [userPoints, setUserPoints] = useState(0);
    const [pointsToUse, setPointsToUse] = useState('');
    const [pointsError, setPointsError] = useState(null);

    const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = 0;
    const pointsDiscount = Number(pointsToUse) || 0;
    const total = Math.max(0, subtotal + shippingFee - voucherDiscount - pointsDiscount);

    useEffect(() => {
        if (location.state && location.state.selectedItems) {
            const items = location.state.selectedItems;
            setOrderItems(items);
            fetchInitialData();
        } else {
            setLoading(false);
        }
    }, [location.state]);

    const fetchInitialData = async () => {
        try {
            const [vouchersRes, balanceRes] = await Promise.all([
                getMyVouchersApi(),
                getRewardBalanceApi()
            ]);
            setMyVouchers(vouchersRes.data || []);
            setUserPoints(balanceRes.data?.points || 0);
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu ưu đãi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const pointsValue = Number(pointsToUse);
        const maxPointsCanUse = Math.min(userPoints, subtotal - voucherDiscount);

        if (pointsValue > maxPointsCanUse) {
            setPointsError(`Số điểm sử dụng không được vượt quá ${Math.floor(maxPointsCanUse).toLocaleString()}`);
        } else {
            setPointsError(null);
        }
    }, [pointsToUse, userPoints, subtotal, voucherDiscount]);

    const handleSelectVoucher = async (userVoucher) => {
        try {
            const res = await applyVoucherApi(userVoucher.rewardCode, subtotal);
            const { discountAmount } = res.data;
            
            setSelectedVoucher(userVoucher);
            setVoucherDiscount(discountAmount);
            setIsVoucherModalVisible(false);
            message.success(`Áp dụng voucher "${userVoucher.voucher.code}" thành công!`);
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể áp dụng voucher này.');
        }
    };

    const handleUseMaxPoints = () => {
        const maxPointsCanUse = Math.floor(Math.min(userPoints, subtotal - voucherDiscount));
        setPointsToUse(maxPointsCanUse);
    };

    const handleConfirmOrder = async (values) => {
        if (pointsError) {
            message.error(pointsError);
            return;
        }
        setSubmitting(true);
        try {
            const orderPayload = {
                shippingAddress: values.shippingAddress,
                phoneNumber: values.phoneNumber,
                note: values.note,
                items: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                })),
                couponCode: selectedVoucher ? selectedVoucher.rewardCode : null,
                pointsToUse: Number(pointsToUse) || 0,
                paymentMethod: paymentMethod,
            };
            
            const orderResponse = await createOrder(orderPayload);
            const createdOrder = orderResponse.data.data ?? orderResponse.data;

            if (paymentMethod === 'VNPAY') {
                const paymentUrl = createdOrder?.paymentUrl || orderResponse.data.paymentUrl;
                if (paymentUrl) {
                    window.location.href = paymentUrl;
                } else {
                    throw new Error('Không thể tạo link thanh toán VNPay.');
                }
            } else {
                message.success('Đặt hàng thành công!');
                navigate('/history');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng.');
            setSubmitting(false);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Spin size="large" /></div>;
    }

    if (orderItems.length === 0) {
        return <Result status="404" title="Không có sản phẩm" subTitle="Vui lòng quay lại giỏ hàng." extra={<Button type="primary" onClick={() => navigate('/cart')}>Về giỏ hàng</Button>} />;
    }

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <div style={{ marginBottom: 40 }}>
                    <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ color: '#6b7280', fontWeight: 500, padding: 0 }}>Quay lại</Button>
                    <Title level={2} style={{ fontSize: 36, fontWeight: 800, color: '#111827', marginTop: 16 }}>Thanh toán</Title>
                </div>

                <Form form={form} layout="vertical" onFinish={handleConfirmOrder} size="large">
                    <Row gutter={[40, 40]}>
                        <Col xs={24} lg={15}>
                            <Space direction="vertical" size={32} style={{ width: '100%' }}>
                                <Card title={<Space><EnvironmentOutlined /> <Text strong>Thông tin giao hàng</Text></Space>} bordered={false} style={styles.card}>
                                    <Row gutter={24}>
                                        <Col span={12}><Form.Item name="fullName" rules={[{ required: true }]}><Input prefix={<UserOutlined />} placeholder="Họ và tên" style={styles.input} /></Form.Item></Col>
                                        <Col span={12}><Form.Item name="phoneNumber" rules={[{ required: true }]}><Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" style={styles.input} /></Form.Item></Col>
                                    </Row>
                                    <Form.Item name="shippingAddress" rules={[{ required: true }]}><Input prefix={<MailOutlined />} placeholder="Địa chỉ" style={styles.input} /></Form.Item>
                                    <Form.Item name="note"><Input.TextArea placeholder="Ghi chú (tùy chọn)" style={{...styles.input, height: 'auto' }} /></Form.Item>
                                </Card>
                                
                                <Card title={<Text strong>Sản phẩm</Text>} bordered={false} style={styles.card}>
                                    {orderItems.map((item, idx) => (
                                        <Row key={idx} gutter={16} align="middle" style={{ padding: '12px 0', borderBottom: idx < orderItems.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                            <Col><Image src={getImageUrl(item.image)} width={64} height={64} style={{ objectFit: 'contain', borderRadius: 8, background: '#f9fafb' }} /></Col>
                                            <Col flex="auto"><Text strong>{item.name}</Text><div><Text type="secondary">SL: {item.quantity}</Text></div></Col>
                                            <Col><Text strong>{formatPrice(item.price * item.quantity)}</Text></Col>
                                        </Row>
                                    ))}
                                </Card>

                                <Card title={<Space><WalletOutlined /> <Text strong>Phương thức thanh toán</Text></Space>} bordered={false} style={styles.card}>
                                    <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod} style={{ width: '100%' }}>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <div style={{ padding: '16px', border: `1px solid ${paymentMethod === 'COD' ? '#4f46e5' : '#e5e7eb'}`, borderRadius: 12, cursor: 'pointer' }} onClick={() => setPaymentMethod('COD')}>
                                                <Radio value="COD"><Text strong>Thanh toán khi nhận hàng (COD)</Text></Radio>
                                                <Paragraph type="secondary" style={{ marginLeft: 28, marginBottom: 0 }}>Thanh toán bằng tiền mặt khi shipper giao hàng.</Paragraph>
                                            </div>
                                            <div style={{ padding: '16px', border: `1px solid ${paymentMethod === 'VNPAY' ? '#4f46e5' : '#e5e7eb'}`, borderRadius: 12, cursor: 'pointer' }} onClick={() => setPaymentMethod('VNPAY')}>
                                                <Radio value="VNPAY">
                                                    <Space>
                                                        <Text strong>Thanh toán qua VNPAY</Text>
                                                        <img src={vnpayLogo} alt="VNPay" style={{ height: 20 }} />
                                                    </Space>
                                                </Radio>
                                                <Paragraph type="secondary" style={{ marginLeft: 28, marginBottom: 0 }}>Thanh toán qua cổng VNPAY (Thẻ ATM, Visa, Master, ...)</Paragraph>
                                            </div>
                                        </Space>
                                    </Radio.Group>
                                </Card>
                            </Space>
                        </Col>

                        <Col xs={24} lg={9}>
                            <Card bordered={false} style={styles.summaryCard} bodyStyle={{ padding: 32 }}>
                                <div style={{ ...styles.voucherRow, marginBottom: 24 }} onClick={() => setIsVoucherModalVisible(true)}>
                                    <Space><TagOutlined style={{ color: '#2563eb' }} /> <Text strong>Mã giảm giá</Text></Space>
                                    <Space>
                                        {selectedVoucher ? (
                                            <Tag color="blue">{selectedVoucher.voucher.code}</Tag>
                                        ) : (
                                            <Text type="secondary">
                                                {myVouchers.length === 0 ? 'Không có voucher' : 'Chọn voucher'}
                                            </Text>
                                        )}
                                        <RightOutlined />
                                    </Space>
                                </div>

                                <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16, border: '1px solid #e5e7eb', marginBottom: 24 }}>
                                    <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                                        <Space><StarOutlined style={{ color: '#f59e0b' }} /> <Text strong>Điểm thưởng</Text></Space>
                                        <Text type="secondary">Hiện có: {userPoints.toLocaleString()}</Text>
                                    </Row>
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Input 
                                            type="number" 
                                            placeholder="Nhập số điểm" 
                                            value={pointsToUse} 
                                            onChange={e => setPointsToUse(e.target.value)} 
                                            style={{ height: 44 }} 
                                        />
                                        <Button type="default" onClick={handleUseMaxPoints} style={{ height: 44 }}>Dùng tối đa</Button>
                                    </Space.Compact>
                                    {pointsError && <Text type="danger" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>{pointsError}</Text>}
                                    <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>1 điểm = 1 VNĐ</Text>
                                </div>

                                <Title level={4} style={{ marginBottom: 20 }}>Tóm tắt đơn hàng</Title>
                                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                    <Row justify="space-between"><Text type="secondary">Tạm tính</Text><Text>{formatPrice(subtotal)}</Text></Row>
                                    <Row justify="space-between"><Text type="secondary">Phí vận chuyển</Text><Text>{formatPrice(shippingFee)}</Text></Row>
                                    {voucherDiscount > 0 && <Row justify="space-between"><Text style={{ color: '#22c55e' }}>Voucher giảm</Text><Text style={{ color: '#22c55e' }}>- {formatPrice(voucherDiscount)}</Text></Row>}
                                    {pointsDiscount > 0 && <Row justify="space-between"><Text style={{ color: '#22c55e' }}>Điểm thưởng</Text><Text style={{ color: '#22c55e' }}>- {formatPrice(pointsDiscount)}</Text></Row>}
                                    <Divider style={{ margin: '8px 0' }} />
                                    <Row justify="space-between" align="bottom">
                                        <Text strong style={{ fontSize: 18 }}>Tổng cộng</Text>
                                        <Title level={2} style={{ color: '#4f46e5', margin: 0 }}>{formatPrice(total)}</Title>
                                    </Row>
                                </Space>

                                <div style={{ marginTop: 32 }}>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        block 
                                        loading={submitting} 
                                        style={styles.primaryBtn}
                                        disabled={!!pointsError || submitting}
                                    >
                                        Xác nhận đặt hàng
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </div>

            <Modal
                title="Voucher của tôi"
                open={isVoucherModalVisible}
                onCancel={() => setIsVoucherModalVisible(false)}
                footer={null}
                bodyStyle={{ maxHeight: '60vh', overflowY: 'auto', padding: '8px' }}
            >
                {myVouchers.length > 0 ? myVouchers.map(uv => (
                    <div key={uv.id} style={styles.voucherModalCard}>
                        <Row justify="space-between">
                            <Col>
                                <Title level={5} style={{ margin: 0 }}>{uv.voucher.title}</Title>
                                <Text type="secondary" style={{ fontSize: 12 }}>HSD: {new Date(uv.voucher.endDate).toLocaleDateString('vi-VN')}</Text>
                            </Col>
                            <Col>
                                <Button type="primary" onClick={() => handleSelectVoucher(uv)}>Sử dụng</Button>
                            </Col>
                        </Row>
                        <Divider style={{ margin: '12px 0' }} />
                        <Text>{uv.voucher.description}</Text>
                    </div>
                )) : <Empty description="Bạn không có voucher nào." />}
            </Modal>
        </div>
    );
};

export default CheckoutPage;
