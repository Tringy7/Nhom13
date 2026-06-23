import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Typography, Button, Space, Empty, Breadcrumb, Tag, Spin, message, Divider, Image, Rate, Input, Upload, Drawer, Steps } from 'antd';
import { HomeOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, ShoppingOutlined, UploadOutlined, GiftOutlined, CarOutlined, WalletOutlined, UserOutlined, PhoneOutlined, CalendarOutlined, FileTextOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { getOrderById } from '../util/api/order.api';
import { submitReviewApi } from '../util/api/product-feature.api';
import { getImageUrl } from '../util/helpers';
import { styled } from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// --- UTILS & HELPERS (Keep existing) ---
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));
const formatDateTime = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '---';

// --- STYLED COMPONENTS (CSS-in-JS for new design) ---
const PageWrapper = styled.div`
  background: #f8fafc;
  min-height: 100vh;
  padding: 24px 0;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 24px;
  margin-top: 24px;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const RightColumn = styled.div`
  position: sticky;
  top: 24px;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PremiumCard = styled.div`
  background: #ffffff;
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
`;

// --- NEW UI COMPONENTS (Defined within this file) ---

const OrderHero = ({ order }) => {
    const STATUS_CONFIG = {
        NEW: { text: 'Đơn Mới', icon: <GiftOutlined />, color: '#3b82f6' },
        CONFIRMED: { text: 'Đã Xác Nhận', icon: <CheckCircleOutlined />, color: '#10b981' },
        SHIPPING: { text: 'Đang Giao Hàng', icon: <CarOutlined />, color: '#f97316' },
        DELIVERED: { text: 'Đã Giao', icon: <CheckCircleOutlined />, color: '#16a34a' },
        CANCELLED: { text: 'Đã Hủy', icon: <CloseCircleOutlined />, color: '#ef4444' },
        DEFAULT: { text: 'Đang Xử Lý', icon: <SyncOutlined spin />, color: '#6b7280' }
    };
    const currentStatus = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.DEFAULT;
    const timelineSteps = ['NEW', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];
    const currentStep = timelineSteps.indexOf(order.orderStatus);

    return (
        <div style={{
            height: 'auto',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            borderRadius: 32,
            padding: 32,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Title level={4} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                        Mã đơn hàng: #{order.id}
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
                        Ngày đặt: {formatDateTime(order.createdAt)}
                    </Text>
                </div>
                <Tag
                    icon={currentStatus.icon}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        fontSize: 16,
                        fontWeight: 600,
                        padding: '10px 20px',
                        borderRadius: 999
                    }}
                >
                    {currentStatus.text}
                </Tag>
            </div>
            <div style={{ marginTop: 24 }}>
                <Steps current={currentStep} labelPlacement="vertical" size="small">
                    {timelineSteps.map(step => (
                        <Steps.Step
                            key={step}
                            title={<span style={{ color: 'white' }}>{step}</span>}
                            icon={currentStep >= timelineSteps.indexOf(step) ? <CheckCircleOutlined /> : <div style={{ width: 8, height: 8, background: 'rgba(255,255,255,0.5)', borderRadius: '50%' }} />}
                        />
                    ))}
                </Steps>
            </div>
        </div>
    );
};

const ProductItem = ({ item, orderStatus, onReview }) => (
    <div style={{
        display: 'flex',
        gap: 20,
        padding: 20,
        borderRadius: 20,
        background: '#ffffff',
        border: '1px solid #f1f5f9',
        alignItems: 'center',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    }}
    className="product-item-hover">
        <Image
            width={120}
            height={120}
            src={getImageUrl(item.product?.thumbnail)}
            fallback="/placeholder-product.png"
            style={{ objectFit: 'contain', background: '#f8fafc', borderRadius: 16 }}
        />
        <div style={{ flex: 1 }}>
            <Title level={5} style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{item.productName}</Title>
            <Text type="secondary">Số lượng: {item.quantity}</Text>
            <br />
            <Text type="secondary">Đơn giá: {formatPrice(item.price)}</Text>
        </div>
        <div style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 24, fontWeight: 800, color: '#2563eb', display: 'block' }}>
                {formatPrice(Number(item.price) * item.quantity)}
            </Text>
            {orderStatus === 'DELIVERED' ? (
                <Button
                    type="default"
                    onClick={onReview}
                    style={{ borderRadius: 999, marginTop: 8, borderColor: '#2563eb', color: '#2563eb' }}
                >
                    Đánh giá sản phẩm
                </Button>
            ) : (
                <Button disabled style={{ borderRadius: 999, marginTop: 8 }}>Đánh giá sản phẩm</Button>
            )}
        </div>
    </div>
);

const InfoCard = ({ title, icon, children }) => (
    <PremiumCard>
        <Title level={5} style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            {icon} {title}
        </Title>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {children}
        </Space>
    </PremiumCard>
);

const InfoItem = ({ icon, label, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#64748b' }}>{icon}</span>
        <Text style={{ flex: 1 }}>{children || label}</Text>
    </div>
);

const OrderSummary = ({ subtotal, shippingFee, discount, total }) => (
    <PremiumCard>
        <Title level={4} style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Order Summary</Title>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row justify="space-between"><Text>Tạm tính:</Text><Text strong>{formatPrice(subtotal)}</Text></Row>
            <Row justify="space-between"><Text>Phí vận chuyển:</Text><Text strong>{formatPrice(shippingFee)}</Text></Row>
            <Row justify="space-between"><Text style={{ color: 'red' }}>Giảm giá:</Text><Text strong style={{ color: 'red' }}>-{formatPrice(discount)}</Text></Row>
        </Space>
        <Divider style={{ margin: '24px 0' }} />
        <Row justify="space-between" align="middle">
            <Title level={4} style={{ margin: 0 }}>Tổng tiền:</Title>
            <Title level={2} style={{ margin: 0, color: '#2563eb', fontWeight: 900 }}>{formatPrice(total)}</Title>
        </Row>
        <Button
            type="primary"
            size="large"
            style={{
                width: '100%',
                height: 52,
                borderRadius: 999,
                marginTop: 24,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
            }}
        >
            Buy Again
        </Button>
        <Button
            type="default"
            size="large"
            style={{ width: '100%', height: 52, borderRadius: 999, marginTop: 12 }}
        >
            Download Invoice
        </Button>
    </PremiumCard>
);

const UpgradedReviewDrawer = ({ visible, product, orderId, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [imageList, setImageList] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = ({ fileList }) => setImageList(fileList);

    const handleSubmit = async () => {
        if (rating === 0) {
            message.warning('Vui lòng chọn số sao để đánh giá.');
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit({ orderId, rating, comment, images: imageList.map(file => file.originFileObj) });
            onClose(); // Close drawer on success
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (visible) {
            setRating(0);
            setComment('');
            setImageList([]);
        }
    }, [visible]);

    return (
        <Drawer
            title={null}
            placement="right"
            onClose={onClose}
            open={visible}
            width={window.innerWidth > 768 ? 480 : '100%'}
            closable={false}
            bodyStyle={{ padding: 0 }}
            footer={null}
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Drawer Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #f0f0f0' }}>
                    <Title level={4}>Đánh giá sản phẩm</Title>
                    {product && (
                        <Space align="center" style={{ marginTop: 16 }}>
                            <Image width={60} src={getImageUrl(product.product?.thumbnail)} />
                            <div>
                                <Text strong>{product.productName}</Text>
                                <Text block type="secondary">Mã đơn: #{orderId}</Text>
                            </div>
                        </Space>
                    )}
                </div>

                {/* Drawer Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={5}>Chất lượng sản phẩm thế nào?</Title>
                            <Rate value={rating} onChange={setRating} style={{ fontSize: 40 }} />
                        </div>
                        <TextArea
                            rows={5}
                            placeholder="Hãy chia sẻ trải nghiệm thực tế của bạn về sản phẩm này..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            style={{ borderRadius: 16 }}
                        />
                        <Upload.Dragger
                            listType="picture-card"
                            fileList={imageList}
                            onChange={handleFileChange}
                            beforeUpload={() => false}
                            accept=".jpg,.jpeg,.png,.webp"
                            style={{ background: '#f8fafc', borderRadius: 20, borderStyle: 'dashed' }}
                        >
                            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                            <p className="ant-upload-text">Tải ảnh lên</p>
                            <p className="ant-upload-hint">Kéo và thả hoặc nhấp để chọn ảnh</p>
                        </Upload.Dragger>
                    </Space>
                </div>

                {/* Drawer Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', background: 'white' }}>
                    <Row gutter={16}>
                        <Col span={12}><Button size="large" block onClick={onClose} style={{ borderRadius: 999 }}>Hủy</Button></Col>
                        <Col span={12}>
                            <Button
                                type="primary"
                                size="large"
                                block
                                loading={submitting}
                                onClick={handleSubmit}
                                style={{ borderRadius: 999, fontWeight: 700, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', height: 48 }}
                            >
                                Gửi Đánh Giá
                            </Button>
                        </Col>
                    </Row>
                </div>
            </div>
        </Drawer>
    );
};


// --- MAIN PAGE COMPONENT (Refactored) ---
const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewDrawer, setReviewDrawer] = useState({ visible: false, product: null });

    // --- LOGIC (Keep existing) ---
    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const res = await getOrderById(id);
                setOrder(res.data);
            } catch (error) {
                message.error('Không thể tải chi tiết đơn hàng.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleOpenReview = (product) => {
        setReviewDrawer({ visible: true, product });
    };

    const handleCloseReview = () => {
        setReviewDrawer({ visible: false, product: null });
    };

    const handleReviewSubmit = async (reviewData) => {
        try {
            await submitReviewApi(reviewDrawer.product.productId, reviewData);
            message.success('Cảm ơn bạn đã đánh giá sản phẩm!');
        } catch (error) {
            message.error('Gửi đánh giá thất bại.');
            throw error; // Re-throw to keep drawer open on failure
        }
    };

    // --- RENDER ---
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}><Spin size="large" /></div>;
    }

    if (!order) {
        return <PageWrapper><Container><Empty description="Không tìm thấy đơn hàng." /></Container></PageWrapper>;
    }

    const subtotal = order.details.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const shippingFee = Number(order.shippingFee || 0);
    const discount = Number(order.voucherDiscount || 0);
    const total = subtotal + shippingFee - discount;

    const PAYMENT_STATUS_TAG = {
        PENDING: <Tag color="warning">Chờ thanh toán</Tag>,
        PAID: <Tag color="success">Đã thanh toán</Tag>,
        FAILED: <Tag color="error">Thất bại</Tag>,
    };

    return (
        <PageWrapper>
            <Container>
                <Breadcrumb style={{ marginBottom: 24 }}>
                    <Breadcrumb.Item><Link to="/"><HomeOutlined /> Trang chủ</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to="/orders">Lịch sử mua hàng</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>Chi tiết đơn hàng</Breadcrumb.Item>
                </Breadcrumb>

                <OrderHero order={order} />

                <MainGrid>
                    <LeftColumn>
                        <PremiumCard>
                            <Title level={4} style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
                                Purchased Products ({order.details.length})
                            </Title>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                {order.details.map(item => (
                                    <ProductItem
                                        key={item.id}
                                        item={item}
                                        orderStatus={order.orderStatus}
                                        onReview={() => handleOpenReview(item)}
                                    />
                                ))}
                            </Space>
                        </PremiumCard>

                        <InfoCard title="Shipping Information" icon={<CarOutlined />}>
                            <InfoItem icon={<EnvironmentOutlined />}>{order.shippingAddress}</InfoItem>
                            <InfoItem icon={<FileTextOutlined />}>{order.shippingMethod || 'Chưa có thông tin'}</InfoItem>
                            <InfoItem icon={<CalendarOutlined />}>Ngày đặt: {formatDateTime(order.createdAt)}</InfoItem>
                            <InfoItem icon={<CalendarOutlined />}>Cập nhật lần cuối: {formatDateTime(order.updatedAt)}</InfoItem>
                        </InfoCard>

                        <InfoCard title="Payment Information" icon={<WalletOutlined />}>
                            <InfoItem icon={<WalletOutlined />}>Phương thức: {order.payment?.method}</InfoItem>
                            <InfoItem icon={<CheckCircleOutlined />}>Trạng thái: {PAYMENT_STATUS_TAG[order.payment?.status]}</InfoItem>
                        </InfoCard>
                    </LeftColumn>

                    <RightColumn>
                        <OrderSummary
                            subtotal={subtotal}
                            shippingFee={shippingFee}
                            discount={discount}
                            total={total}
                        />
                    </RightColumn>
                </MainGrid>
            </Container>

            <UpgradedReviewDrawer
                visible={reviewDrawer.visible}
                product={reviewDrawer.product}
                orderId={order.id}
                onClose={handleCloseReview}
                onSubmit={handleReviewSubmit}
            />
            <style>{`
              .product-item-hover:hover {
                transform: translateY(-4px);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
              }
              .ant-steps-item-title {
                  color: white !important;
              }
              .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after {
                  background-color: white !important;
              }
            `}</style>
        </PageWrapper>
    );
};

export default OrderDetailPage;
