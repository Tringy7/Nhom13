import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Typography, Button, Space, Empty, Breadcrumb, Tag, Spin, message, Divider, Image, Rate, Input, Upload, Drawer } from 'antd';
import { HomeOutlined, CheckCircleOutlined, DownloadOutlined, CustomerServiceOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined, FileTextOutlined, StarFilled, MessageOutlined, ShopOutlined, CloseOutlined } from '@ant-design/icons';
import { getOrderById } from '../util/api/order.api';
import { submitReviewApi } from '../util/api/product-feature.api';
import { getImageUrl } from '../util/helpers';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// --- MOCK DATA (as per instructions) ---
const MOCK_SHOP = { name: 'Lumina Official', rating: 4.8, reviews: 2400, verified: true, avatar: 'L' };

// --- UTILS & HELPERS (Keep existing) ---
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));
const formatDateTime = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '---';

// --- STYLED COMPONENTS (for new design) ---
const PageWrapper = styled.div`
  background: #f4f5f7;
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

const RightColumn = styled.aside`
  position: sticky;
  top: 24px;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CardBase = styled.div`
  background: #ffffff;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  padding: 24px;
`;

// --- NEW UI COMPONENTS (Defined within this file) ---

const OrderHeader = ({ order }) => (
    <CardBase>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
                <Title level={2} style={{ margin: 0, fontWeight: 'bold', fontSize: 24 }}>Order Details</Title>
                <Text type="secondary">Placed on {formatDateTime(order.createdAt)} • ID: {order.id}</Text>
            </div>
            <Space>
                <Button icon={<DownloadOutlined />}>Download Invoice</Button>
                <Button type="primary" icon={<CustomerServiceOutlined />}>Get Support</Button>
            </Space>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', padding: '12px 16px', borderRadius: 8 }}>
            <Space size="large">
                <Tag icon={<CheckCircleOutlined />} style={{ background: '#e6f4ea', color: '#137333', borderRadius: 999, padding: '4px 10px', border: 'none', fontWeight: 500 }}>
                    Delivered
                </Tag>
                <Text type="secondary">Arrived {formatDateTime(order.updatedAt)}</Text>
                <Text type="secondary">Carrier: {order.shippingMethod || 'Standard'}</Text>
                <Text type="secondary">Signature: Not required</Text>
            </Space>
            <Button>Track Shipment</Button>
        </div>
    </CardBase>
);

const ProductItem = ({ item, onReview }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Image width={48} height={48} src={getImageUrl(item.product?.thumbnail)} style={{ borderRadius: 8, objectFit: 'cover' }} />
        <div style={{ flex: 1 }}>
            <Text strong>{item.productName}</Text>
            <br />
            <Text type="secondary">Qty: {item.quantity}</Text>
        </div>
        <div style={{ textAlign: 'right' }}>
            <Text style={{ color: '#1677ff', fontWeight: 700, fontSize: 16 }}>{formatPrice(Number(item.price) * item.quantity)}</Text>
            <div style={{ marginTop: 4 }}>
                <Link onClick={onReview} style={{ fontSize: 12 }}>Review Product</Link>
                <Text type="secondary" style={{ margin: '0 8px' }}>•</Text>
                <Link href="#" style={{ fontSize: 12, color: '#8c8c8c' }}>Buy Again</Link>
            </div>
        </div>
    </div>
);

const ProductListCard = ({ details, orderStatus, onReview }) => {
    const [isCollapsed, setIsCollapsed] = useState(details.length > 3);
    const itemsToShow = isCollapsed ? details.slice(0, 3) : details;

    return (
        <CardBase>
            <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 24 }}>Purchased Products ({details.length})</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {itemsToShow.map(item => (
                    <ProductItem key={item.id} item={item} orderStatus={orderStatus} onReview={() => onReview(item)} />
                ))}
            </Space>
            {details.length > 3 && (
                <Button type="link" onClick={() => setIsCollapsed(!isCollapsed)} style={{ marginTop: 16 }}>
                    {isCollapsed ? `Show ${details.length - 3} more` : 'Show less'}
                </Button>
            )}
        </CardBase>
    );
};

const ShippingAddressCard = ({ order }) => (
    <CardBase>
        <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><UserOutlined /> Shipping Address</Title>
        <Paragraph strong style={{ marginBottom: 4 }}>{order.customer?.fullName || 'Customer Name'}</Paragraph>
        <Paragraph style={{ color: '#8c8c8c', marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 8 }} /> {order.customer?.phone || 'No phone provided'}
        </Paragraph>
        <Paragraph style={{ color: '#8c8c8c', marginBottom: 16 }}>
            <EnvironmentOutlined style={{ marginRight: 8 }} /> {order.shippingAddress}
        </Paragraph>
        <Divider style={{ margin: '16px 0' }} />
        <Text strong>Instructions:</Text>
        <Paragraph italic style={{ color: '#8c8c8c', marginTop: 4 }}>{order.note || 'No special instructions.'}</Paragraph>
    </CardBase>
);

const SellerCard = () => (
    <CardBase style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space size="middle">
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e6f4ff', color: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold' }}>
                {MOCK_SHOP.avatar}
            </div>
            <div>
                <Space>
                    <Text strong>{MOCK_SHOP.name}</Text>
                    {MOCK_SHOP.verified && <Tag color="success" icon={<CheckCircleOutlined />}>Verified</Tag>}
                </Space>
                <br />
                <Text type="secondary"><StarFilled style={{ color: '#faad14', marginRight: 4 }} /> {MOCK_SHOP.rating} ({MOCK_SHOP.reviews.toLocaleString()} reviews)</Text>
            </div>
        </Space>
        <Space>
            <Button icon={<MessageOutlined />}>Message Shop</Button>
            <Button icon={<ShopOutlined />}>View Storefront</Button>
        </Space>
    </CardBase>
);

const OrderSummary = ({ subtotal, shippingFee, discount, total }) => (
    <CardBase>
        <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 24 }}>Order Summary</Title>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row justify="space-between"><Text type="secondary">Subtotal</Text><Text strong>{formatPrice(subtotal)}</Text></Row>
            <Row justify="space-between"><Text type="secondary">Shipping Fee</Text><Text strong>{shippingFee > 0 ? formatPrice(shippingFee) : 'FREE'}</Text></Row>
            {discount > 0 && <Row justify="space-between"><Text style={{ color: 'red' }}>Holiday Promo</Text><Text strong style={{ color: 'red' }}>-{formatPrice(discount)}</Text></Row>}
            <Row justify="space-between"><Text type="secondary">Tax (inc.)</Text><Text strong>{formatPrice(0)}</Text></Row>
        </Space>
        <Divider style={{ margin: '24px 0' }} />
        <Row justify="space-between" align="middle">
            <Title level={4} style={{ margin: 0 }}>Total</Title>
            <Title level={2} style={{ margin: 0, color: '#1677ff', fontWeight: 'bold', fontSize: 28 }}>{formatPrice(total)}</Title>
        </Row>
        <Button type="primary" size="large" style={{ width: '100%', height: 48, borderRadius: 8, marginTop: 24, fontWeight: 600 }}>
            Reorder All Items
        </Button>
    </CardBase>
);

const ReviewDrawer = ({ visible, product, orderId, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [shopRating, setShopRating] = useState(0);
    const [comment, setComment] = useState('');
    const [imageList, setImageList] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = ({ fileList }) => setImageList(fileList);

    const handleSubmit = async () => {
        if (rating === 0) {
            message.warning('Please rate the product to continue.');
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit({ orderId, rating, comment, images: imageList.map(f => f.originFileObj), shopRating });
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (visible) {
            setRating(0);
            setShopRating(0);
            setComment('');
            setImageList([]);
        }
    }, [visible]);

    return (
        <Drawer
            title="Submit Review"
            placement="right"
            onClose={onClose}
            open={visible}
            width={480}
            closeIcon={<CloseOutlined />}
        >
            {product && (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                        <Image width={48} src={getImageUrl(product.product?.thumbnail)} style={{ borderRadius: 4 }} />
                        <div>
                            <Text strong>{product.productName}</Text>
                            <Text block type="secondary">Order #{orderId}</Text>
                        </div>
                    </div>
                    <div>
                        <Title level={5}>HOW WOULD YOU RATE THIS PRODUCT?</Title>
                        <Rate value={rating} onChange={setRating} style={{ fontSize: 28 }} />
                    </div>
                    <Upload.Dragger
                        listType="picture"
                        fileList={imageList}
                        onChange={handleFileChange}
                        beforeUpload={() => false}
                        style={{ background: '#f9fafb', borderRadius: 8 }}
                    >
                        <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                        <p className="ant-upload-text">Drag & drop media here</p>
                    </Upload.Dragger>
                    <TextArea rows={4} placeholder="Share your experience..." value={comment} onChange={e => setComment(e.target.value)} />
                    <Divider />
                    <div>
                        <Title level={5}>HOW WAS THE SHOP?</Title>
                        <Text type="secondary">Your rating for {MOCK_SHOP.name}</Text>
                        <div style={{ marginTop: 8 }}>
                            <Rate value={shopRating} onChange={setShopRating} style={{ fontSize: 28 }} />
                        </div>
                    </div>
                    <Button type="primary" size="large" block loading={submitting} onClick={handleSubmit} style={{ height: 48, borderRadius: 8, fontWeight: 600 }}>
                        Submit Review
                    </Button>
                </Space>
            )}
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
                message.error('Could not load order details.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleOpenReview = (product) => setReviewDrawer({ visible: true, product });
    const handleCloseReview = () => setReviewDrawer({ visible: false, product: null });

    const handleReviewSubmit = async (reviewData) => {
        try {
            await submitReviewApi(reviewDrawer.product.productId, reviewData);
            message.success('Thank you for your review!');
        } catch (error) {
            message.error('Failed to submit review.');
            throw error;
        }
    };

    // --- RENDER ---
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f5f7' }}><Spin size="large" /></div>;
    }

    if (!order) {
        return <PageWrapper><Container><Empty description="Order not found." /></Container></PageWrapper>;
    }

    const subtotal = order.details.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const shippingFee = Number(order.shippingFee || 0);
    const discount = Number(order.voucherDiscount || 0);
    const total = subtotal + shippingFee - discount;

    return (
        <PageWrapper>
            <Container>
                <Breadcrumb style={{ marginBottom: 24 }}>
                    <Breadcrumb.Item><Link to="/"><HomeOutlined /> Home</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to="/orders">Order History</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>Order Details</Breadcrumb.Item>
                </Breadcrumb>

                <MainGrid>
                    <LeftColumn>
                        <OrderHeader order={order} />
                        <ProductListCard details={order.details} orderStatus={order.orderStatus} onReview={handleOpenReview} />
                        <ShippingAddressCard order={order} />
                        <SellerCard />
                    </LeftColumn>

                    <RightColumn>
                        <OrderSummary subtotal={subtotal} shippingFee={shippingFee} discount={discount} total={total} />
                    </RightColumn>
                </MainGrid>
            </Container>

            <ReviewDrawer
                visible={reviewDrawer.visible}
                product={reviewDrawer.product}
                orderId={order.id}
                onClose={handleCloseReview}
                onSubmit={handleReviewSubmit}
            />
        </PageWrapper>
    );
};

export default OrderDetailPage;