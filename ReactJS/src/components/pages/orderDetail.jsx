import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Typography, Button, Space, Empty, Breadcrumb, Tag, Spin, message, Divider, Image, Rate, Input, Upload, Drawer, Alert } from 'antd';
import { HomeOutlined, CheckCircleOutlined, DownloadOutlined, CustomerServiceOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined, FileTextOutlined, CloseCircleOutlined, UploadOutlined, CarOutlined, StarOutlined, ShoppingCartOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { getOrderById, cancelOrderItemApi } from '../util/api/order.api';
import { submitReviewApi } from '../util/api/product-feature.api';
import { getImageUrl } from '../util/helpers';
import styled, { keyframes } from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// --- CONSTANTS ---
const ORDER_STATUS = Object.freeze({
    NEW: 'NEW',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    SHIPPING: 'SHIPPING',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    CANCEL_REQUEST: 'CANCEL_REQUEST'
});

const ORDER_DETAIL_STATUS = Object.freeze({
    EXISTED: 'EXISTED',
    CANCELLED: 'CANCELLED'
});

const STATUS_STEPS = [
    { key: 'NEW', step: 1, label: 'Order Placed' },
    { key: 'CONFIRMED', step: 2, label: 'Confirmed' },
    { key: 'PREPARING', step: 3, label: 'Preparing' },
    { key: 'SHIPPING', step: 4, label: 'Shipping' },
    { key: 'DELIVERED', step: 5, label: 'Delivered' },
];

const getActiveStep = (status) => {
    const map = {
        [ORDER_STATUS.NEW]: 1,
        [ORDER_STATUS.CONFIRMED]: 2,
        [ORDER_STATUS.PREPARING]: 3,
        [ORDER_STATUS.SHIPPING]: 4,
        [ORDER_STATUS.DELIVERED]: 5,
    };
    return map[status] ?? 0;
};

// --- UTILS & HELPERS ---
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));
const formatDateTime = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '---';

// --- STYLED COMPONENTS ---
const pulseRing = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(22, 119, 255, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(22, 119, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(22, 119, 255, 0); }
`;

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

const TrackerContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 0;
`;

const StepWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 80px;
  flex: 1;
  position: relative;

  .circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    transition: all 0.3s ease;
  }

  .label {
    margin-top: 8px;
    font-size: 13px;
    transition: all 0.3s ease;
  }

  /* States */
  &.completed .circle {
    background: #1677ff;
    color: #fff;
    border: 2px solid #1677ff;
  }
  &.completed .label {
    color: #262626;
    font-weight: 500;
  }

  &.active .circle {
    background: #1677ff;
    color: #fff;
    border: 2px solid #1677ff;
    animation: ${pulseRing} 1.5s infinite;
  }
  &.active .label {
    color: #1677ff;
    font-weight: 700;
  }

  &.upcoming .circle {
    background: #fff;
    color: #595959;
    border: 2px solid #d9d9d9;
  }
  &.upcoming .label {
    color: #595959;
    font-weight: 400;
  }
`;

const Connector = styled.div`
  height: 3px;
  flex: 1;
  margin: 0 -10px;
  position: relative;
  top: 16px;
  background: ${({ completed }) => (completed === 'true' ? '#1677ff' : '#d9d9d9')};
`;

// --- UI COMPONENTS ---

const OrderStatusTracker = ({ status }) => {
    if (status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.CANCEL_REQUEST) {
        const isCancelled = status === ORDER_STATUS.CANCELLED;
        return (
            <Alert
                style={{ marginTop: 16 }}
                type={isCancelled ? 'error' : 'warning'}
                message={isCancelled ? 'Order Cancelled' : 'Cancellation Requested'}
                description={isCancelled ? 'This order has been cancelled.' : 'Awaiting confirmation for cancellation.'}
                showIcon
                icon={isCancelled ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
            />
        );
    }

    const activeStep = getActiveStep(status);

    return (
        <TrackerContainer>
            {STATUS_STEPS.map((step, index) => {
                const state = step.step < activeStep ? 'completed' : (step.step === activeStep ? 'active' : 'upcoming');
                return (
                    <React.Fragment key={step.key}>
                        <StepWrapper className={state}>
                            <div className="circle">
                                {state === 'completed' ? <CheckOutlined /> : step.step}
                            </div>
                            <div className="label">{step.label}</div>
                        </StepWrapper>
                        {index < STATUS_STEPS.length - 1 && (
                            <Connector completed={(state === 'completed' || state === 'active').toString()} />
                        )}
                    </React.Fragment>
                );
            })}
        </TrackerContainer>
    );
};

const OrderHeader = ({ order }) => {
    return (
        <CardBase>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 'bold', fontSize: 24 }}>Order Details</Title>
                    <Text style={{ color: '#595959' }}>Placed on {formatDateTime(order.createdAt)} • ID: {order.id}</Text>
                </div>
                <Space>
                    <Button icon={<DownloadOutlined />}>Download Invoice</Button>
                    <Button type="primary" icon={<CustomerServiceOutlined />}>Get Support</Button>
                </Space>
            </div>
            <OrderStatusTracker status={order.orderStatus} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', padding: '12px 16px', borderRadius: 8, marginTop: 16 }}>
                <Space size="large">
                    <Text style={{ color: '#595959' }}>Arrived: {formatDateTime(order.updatedAt)}</Text>
                    <Text style={{ color: '#595959' }}>Carrier: {order.shippingMethod || 'Standard'}</Text>
                </Space>
                <Button>Track Shipment</Button>
            </div>
        </CardBase>
    );
};

const ProductItem = ({ item, orderStatus, onReview, onCancelItem }) => {
    const canCancel = [ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED].includes(orderStatus);
    const isCancelled = item.status === ORDER_DETAIL_STATUS.CANCELLED;

    const itemStyle = isCancelled ? { opacity: 0.5, textDecoration: 'line-through' } : {};

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', ...itemStyle }}>
                <Image width={64} height={64} src={getImageUrl(item.product?.thumbnail) || null} style={{ borderRadius: 8, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                    <Text strong>{item.productName}</Text>
                    <br />
                    <Text style={{ color: '#595959' }}>Qty: {item.quantity}</Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <Text style={{ fontSize: 16 }}>{formatPrice(Number(item.price) * item.quantity)}</Text>
                    <div style={{ marginTop: 8 }}>
                        <Space>
                            {orderStatus === ORDER_STATUS.DELIVERED && !isCancelled && (
                                <>
                                    <Button size="small" icon={<StarOutlined />} onClick={onReview}>Review Product</Button>
                                    <Button size="small" icon={<ShoppingCartOutlined />} type="default">Buy Again</Button>
                                </>
                            )}
                            {canCancel && !isCancelled && <Button size="small" danger onClick={onCancelItem}>Cancel</Button>}
                            {isCancelled && <Tag color="red">Cancelled</Tag>}
                        </Space>
                    </div>
                </div>
            </div>
            <Divider style={{ margin: 0 }} />
        </>
    );
};

const ProductListCard = ({ details, orderStatus, onReview, onCancelItem }) => {
    const [isCollapsed, setIsCollapsed] = useState(details.length > 3);
    const itemsToShow = isCollapsed ? details.slice(0, 3) : details;

    return (
        <CardBase>
            <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Purchased Products ({details.length})</Title>
            <div style={{ margin: '0 -24px' }}>
                {itemsToShow.map(item => (
                    <div key={item.id} style={{ padding: '0 24px' }}>
                        <ProductItem item={item} orderStatus={orderStatus} onReview={() => onReview(item)} onCancelItem={() => onCancelItem(item.id)} />
                    </div>
                ))}
            </div>
            {details.length > 3 && (
                <Button type="link" onClick={() => setIsCollapsed(!isCollapsed)} style={{ marginTop: 16, padding: 0 }}>
                    {isCollapsed ? `Show ${details.length - 3} more` : 'Show less'}
                </Button>
            )}
        </CardBase>
    );
};

const ShippingAddressCard = ({ order }) => (
    <CardBase>
        <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Shipping Address</Title>
        <Paragraph strong style={{ marginBottom: 8 }}>{order.fullName || 'Customer Name'}</Paragraph>
        <Paragraph style={{ color: '#595959', marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 8 }} /> {order.phoneNumber || 'No phone provided'}
        </Paragraph>
        <Paragraph style={{ color: '#595959', marginBottom: 16 }}>
            <EnvironmentOutlined style={{ marginRight: 8 }} /> {order.shippingAddress}
        </Paragraph>
        <Divider style={{ margin: '16px 0' }} />
        <Text strong>Instructions:</Text>
        <Paragraph italic style={{ color: '#595959', marginTop: 4 }}>{order.note || 'No special instructions.'}</Paragraph>
    </CardBase>
);

const FeedbackSystemCard = () => (
    <CardBase>
        <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><FileTextOutlined /> Feedback to System</Title>
        <Text style={{ display: 'block', marginBottom: 16, color: '#595959' }}>Help us improve your experience</Text>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Rate />
            <TextArea rows={4} placeholder="Any issues with the order process, payment, or website?" />
            <Button block>Submit Feedback</Button>
        </Space>
    </CardBase>
);

const FeedbackShipperCard = () => {
    const [selectedTags, setSelectedTags] = useState([]);
    const tags = ["On time", "Handled carefully", "Polite & friendly"];

    const handleTagClick = (tag) => {
        const newSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];
        setSelectedTags(newSelectedTags);
    };

    return (
        <CardBase>
            <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><CarOutlined /> Feedback to Shipper</Title>
            <Text style={{ display: 'block', marginBottom: 16, color: '#595959' }}>Rate your delivery experience</Text>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Rate />
                <Space wrap>
                    {tags.map(tag => (
                        <Button
                            key={tag}
                            type={selectedTags.includes(tag) ? 'primary' : 'default'}
                            onClick={() => handleTagClick(tag)}
                        >
                            {tag}
                        </Button>
                    ))}
                </Space>
                <TextArea rows={4} placeholder="Any comments about the delivery?" />
                <Button block>Submit Feedback</Button>
            </Space>
        </CardBase>
    );
};

const OrderSummary = ({ order }) => {
    const activeItems = order.details.filter(item => item.status !== ORDER_DETAIL_STATUS.CANCELLED);
    const subtotal = activeItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const shippingFee = Number(order.shippingFee || 0);
    const total = Number(order.totalAmount);
    const discount = subtotal + shippingFee - total;

    return (
        <CardBase>
            <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 24 }}>Order Summary</Title>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Row justify="space-between"><Text style={{ color: '#595959' }}>Subtotal</Text><Text strong>{formatPrice(subtotal)}</Text></Row>
                <Row justify="space-between"><Text style={{ color: '#595959' }}>Shipping Fee</Text><Text strong>{shippingFee > 0 ? formatPrice(shippingFee) : 'FREE'}</Text></Row>
                {discount > 0 && <Row justify="space-between"><Text style={{ color: 'red' }}>Voucher Discount</Text><Text strong style={{ color: 'red' }}>-{formatPrice(discount)}</Text></Row>}
                <Row justify="space-between"><Text style={{ color: '#595959' }}>Tax (inc.)</Text><Text strong>{formatPrice(0)}</Text></Row>
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
};

const ReviewDrawer = ({ visible, product, orderId, orderDate, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
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
            await onSubmit({ orderId, rating, comment, images: imageList.map(f => f.originFileObj) });
            onClose();
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
            title="Submit Review"
            placement="right"
            onClose={onClose}
            open={visible}
            width={480}
            closeIcon={<CloseOutlined />}
            footer={
                <Button
                    type="primary"
                    size="large"
                    block
                    loading={submitting}
                    onClick={handleSubmit}
                    style={{ height: 52, borderRadius: 999, fontWeight: 600 }}
                >
                    Submit Review
                </Button>
            }
        >
            {product && (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{
                        background: '#f9fafb',
                        borderRadius: 12,
                        padding: 16,
                        display: 'flex',
                        gap: 16,
                        alignItems: 'center',
                        border: '1px solid #e8eaed'
                    }}>
                        <Image
                            width={80}
                            height={80}
                            src={getImageUrl(product.product?.thumbnail)}
                            style={{
                                borderRadius: 10,
                                objectFit: 'cover',
                                border: '1px solid #e8eaed',
                                flexShrink: 0
                            }}
                            preview={true}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOqmgzKDRv3zXbAq1eaGPvVkFsTdsskCImLsZWUTjD0MAXI4fOHS0uIIsAUblC4uPq5uPV5GkGDBsAFQzQWNoLhAwWHN51pAGEn5sEzGNgUGENsgCzN7pLSBqEOYV4C4gNhQGZgYpsIOgcIMGUOAoYOpBYWlgSkRxBioInCGLQJMoJLo0aSBHVRMA+wiuDR9CFAx909hH6+A0jTMAyM2S1zPF5pYVNSq1isd9F2dgIBAwYgBigwIccAhYwRCgIsRvsCRgJHBGMMAs2IChgQjB2pAl8EZg1iDGZfaGNwI3BicGRA1jB2YIBA5gAlPAA4X2h0wAAAABJRU5ErkJggg=="
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Text strong style={{
                                fontSize: 15,
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {product.productName}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                Purchased {formatDateTime(orderDate)}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                #{orderId}
                            </Text>
                        </div>
                    </div>
                    <Divider />
                    <div style={{ textAlign: 'center' }}>
                        <Title level={5} style={{ color: '#8c8c8c', textTransform: 'uppercase' }}>How would you rate this product?</Title>
                        <Rate value={rating} onChange={setRating} style={{ fontSize: 32 }} />
                    </div>
                    <Divider />
                    <Upload.Dragger
                        listType="picture-card"
                        fileList={imageList}
                        onChange={handleFileChange}
                        beforeUpload={() => false}
                        style={{ background: '#fafafa', border: '2px dashed #d9d9d9' }}
                    >
                        <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                        <p className="ant-upload-text">Drag & drop media here</p>
                        <p className="ant-upload-hint">Supports JPG, PNG, and MP4</p>
                    </Upload.Dragger>
                    <TextArea rows={5} placeholder="Share your experience..." value={comment} onChange={e => setComment(e.target.value)} />
                </Space>
            )}
        </Drawer>
    );
};

// --- MAIN PAGE COMPONENT ---
const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewDrawer, setReviewDrawer] = useState({ visible: false, product: null });

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

    useEffect(() => {
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

    const handleCancelItem = async (itemId) => {
        try {
            await cancelOrderItemApi(id, itemId);
            message.success('Item has been cancelled.');
            fetchOrder(); // Refresh order details
        } catch (error) {
            message.error('Failed to cancel item.');
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f5f7' }}><Spin size="large" /></div>;
    }

    if (!order) {
        return <PageWrapper><Container><Empty description="Order not found." /></Container></PageWrapper>;
    }

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
                        <ProductListCard details={order.details} orderStatus={order.orderStatus} onReview={handleOpenReview} onCancelItem={handleCancelItem} />
                        {order.orderStatus === ORDER_STATUS.DELIVERED && (
                            <>
                                <FeedbackSystemCard />
                                <FeedbackShipperCard />
                            </>
                        )}
                    </LeftColumn>

                    <RightColumn>
                        <OrderSummary order={order} />
                        <ShippingAddressCard order={order} />
                    </RightColumn>
                </MainGrid>
            </Container>

            <ReviewDrawer
                visible={reviewDrawer.visible}
                product={reviewDrawer.product}
                orderId={order.id}
                orderDate={order.createdAt}
                onClose={handleCloseReview}
                onSubmit={handleReviewSubmit}
            />
        </PageWrapper>
    );
};

export default OrderDetailPage;