import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Typography, Button, Space, Empty, Breadcrumb, Tag, Spin, message, Divider, Image, Rate, Input, Upload, Drawer, Alert, Modal } from 'antd';
import { HomeOutlined, CheckCircleOutlined, DownloadOutlined, CustomerServiceOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined, FileTextOutlined, CloseCircleOutlined, UploadOutlined, CarOutlined, StarOutlined, ShoppingCartOutlined, CheckOutlined, CloseOutlined, GiftOutlined, UndoOutlined } from '@ant-design/icons';
import { getOrderById, cancelOrderItemApi, cancelOrderApi, requestCancelOrderApi, submitOrderFeedbackApi, submitShipperFeedbackApi, requestReturnOrderItemApi } from '../util/api/order.api';
import { submitReviewApi, claimReviewRewardApi } from '../util/api/product-feature.api';
import { addToCart } from '../util/api/cart.api';
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
    CANCEL_REQUEST: 'CANCEL_REQUEST',
    DELIVERY_FAILED: 'DELIVERY_FAILED'
});

const ORDER_DETAIL_STATUS = Object.freeze({
    EXISTED: 'EXISTED',
    CANCELLED: 'CANCELLED',
    RETURN_REQUESTED: 'RETURN_REQUESTED',
    RETURNED: 'RETURNED'
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

const OrderStatusTracker = ({ order }) => {
    const status = order.orderStatus;
    if (status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.CANCEL_REQUEST) {
        const isCancelled = status === ORDER_STATUS.CANCELLED;
        const reasonText = order.cancellationRequest?.reason
            ? `Lý do hủy: ${order.cancellationRequest.reason}`
            : (order.note ? `Ghi chú: ${order.note}` : '');
        const adminNotesText = order.cancellationRequest?.adminNotes
            ? `Phản hồi của Shop: ${order.cancellationRequest.adminNotes}`
            : '';

        return (
            <Alert
                style={{ marginTop: 16 }}
                type={isCancelled ? 'error' : 'warning'}
                message={isCancelled ? 'Đơn hàng đã hủy' : 'Yêu cầu hủy đơn hàng'}
                description={
                    <div>
                        <p>{isCancelled ? 'Đơn hàng này đã bị hủy.' : 'Đang chờ shop xác nhận yêu cầu hủy.'}</p>
                        {reasonText && <p style={{ fontWeight: 500, margin: '4px 0 0' }}>{reasonText}</p>}
                        {adminNotesText && <p style={{ fontWeight: 500, margin: '4px 0 0', color: '#cf1322' }}>{adminNotesText}</p>}
                    </div>
                }
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
            <OrderStatusTracker order={order} />
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

const ProductItem = ({ item, orderStatus, onReview, onCancelItem, onReturnItem, onClaimReward, onBuyAgain, hasReview }) => {
    const canCancel = [ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED].includes(orderStatus);
    const canReturn = orderStatus === ORDER_STATUS.DELIVERED;
    const isCancelled = item.status === ORDER_DETAIL_STATUS.CANCELLED;
    const isReturnRequested = item.status === ORDER_DETAIL_STATUS.RETURN_REQUESTED;
    const isReturned = item.status === ORDER_DETAIL_STATUS.RETURNED;

    const itemStyle = (isCancelled || isReturned) ? { opacity: 0.5, textDecoration: 'line-through' } : {};

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
                            {orderStatus === ORDER_STATUS.DELIVERED && !isCancelled && !isReturnRequested && !isReturned && (
                                <>
                                    {hasReview ? (
                                        hasReview.rewardToken ? (
                                            <Tag icon={<CheckCircleOutlined />} color="success">Đã nhận thưởng</Tag>
                                        ) : (
                                            <Button size="small" icon={<GiftOutlined />} type="primary" onClick={() => onClaimReward(hasReview.id)}>
                                                Nhận 100,000 điểm
                                            </Button>
                                        )
                                    ) : (
                                        <div style={{ textAlign: 'right' }}>
                                            <Text style={{ fontSize: 12, color: '#faad14', display: 'block', marginBottom: 4 }}>
                                                <GiftOutlined /> Nhận ngay 100,000 điểm
                                            </Text>
                                            <Button size="small" icon={<StarOutlined />} onClick={onReview}>Đánh giá sản phẩm</Button>
                                        </div>
                                    )}
                                </>
                            )}
                            {canCancel && !isCancelled && <Button size="small" danger onClick={onCancelItem}>Hủy</Button>}
                            {canReturn && !isCancelled && !isReturnRequested && !isReturned && <Button size="small" icon={<UndoOutlined />} onClick={onReturnItem}>Trả hàng</Button>}
                            {isCancelled && <Tag color="red">Đã hủy</Tag>}
                            {isReturnRequested && <Tag color="orange">Chờ duyệt trả hàng</Tag>}
                            {isReturned && <Tag color="red">Đã trả hàng</Tag>}
                        </Space>
                    </div>
                </div>
            </div>
            <Divider style={{ margin: 0 }} />
        </>
    );
};

const ProductListCard = ({ details, orderStatus, productReviews = [], onReview, onCancelItem, onReturnItem, onClaimReward, onBuyAgain }) => {
    const [isCollapsed, setIsCollapsed] = useState(details.length > 3);
    const itemsToShow = isCollapsed ? details.slice(0, 3) : details;

    return (
        <CardBase>
            <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Sản phẩm đã mua ({details.length})</Title>
            <div style={{ margin: '0 -24px' }}>
                {itemsToShow.map(item => {
                    const hasReview = productReviews.find(r => r.productId === item.productId);
                    return (
                        <div key={item.id} style={{ padding: '0 24px' }}>
                            <ProductItem
                                item={item}
                                orderStatus={orderStatus}
                                onReview={() => onReview(item)}
                                onCancelItem={() => onCancelItem(item.id)}
                                onReturnItem={() => onReturnItem(item.id)}
                                onClaimReward={onClaimReward}
                                onBuyAgain={onBuyAgain}
                                hasReview={hasReview}
                            />
                        </div>
                    );
                })}
            </div>
            {details.length > 3 && (
                <Button type="link" onClick={() => setIsCollapsed(!isCollapsed)} style={{ marginTop: 16, padding: 0 }}>
                    {isCollapsed ? `Xem thêm ${details.length - 3} sản phẩm` : 'Thu gọn'}
                </Button>
            )}
        </CardBase>
    );
};

const ShippingAddressCard = ({ order }) => (
    <CardBase>
        <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Địa chỉ giao hàng</Title>
        <Paragraph strong style={{ marginBottom: 8 }}>{order.fullName || 'Customer Name'}</Paragraph>
        <Paragraph style={{ color: '#595959', marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 8 }} /> {order.phoneNumber || 'No phone provided'}
        </Paragraph>
        <Paragraph style={{ color: '#595959', marginBottom: 16 }}>
            <EnvironmentOutlined style={{ marginRight: 8 }} /> {order.shippingAddress}
        </Paragraph>
        <Divider style={{ margin: '16px 0' }} />
        <Text strong>Ghi chú:</Text>
        <Paragraph italic style={{ color: '#595959', marginTop: 4 }}>{order.note || 'Không có ghi chú đặc biệt.'}</Paragraph>
    </CardBase>
);

const FeedbackSystemCard = ({ orderId, existingFeedback }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (existingFeedback) {
            setRating(existingFeedback.rating);
            setComment(existingFeedback.comment);
            setSubmitted(true);
        }
    }, [existingFeedback]);

    const handleSubmit = async () => {
        if (rating === 0) {
            message.warning('Vui lòng chọn số sao đánh giá hệ thống!');
            return;
        }
        setLoading(true);
        try {
            await submitOrderFeedbackApi(orderId, { rating, comment });
            message.success('Cảm ơn bạn đã đóng góp ý kiến đánh giá hệ thống!');
            setSubmitted(true);
        } catch (err) {
            message.error(err.response?.data?.message || 'Gửi đánh giá thất bại.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <CardBase style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#389e0d' }}>
                    <CheckCircleOutlined /> Đánh giá hệ thống & Trải nghiệm
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>
                        <Text type="secondary" style={{ marginRight: 8 }}>Điểm đánh giá:</Text>
                        <Rate disabled value={rating} />
                    </div>
                    {comment && (
                        <div>
                            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Bình luận của bạn:</Text>
                            <Paragraph italic style={{ color: '#434343', background: '#ffffff', padding: '8px 12px', borderRadius: 8, border: '1px solid #f0f0f0', margin: 0 }}>
                                "{comment}"
                            </Paragraph>
                        </div>
                    )}
                </div>
            </CardBase>
        );
    }

    return (
        <CardBase>
            <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><FileTextOutlined style={{ color: '#1677ff' }} /> Đánh giá hệ thống & Trải nghiệm</Title>
            <Text style={{ display: 'block', marginBottom: 16, color: '#595959' }}>Ý kiến của bạn giúp chúng tôi cải thiện dịch vụ mua sắm tốt hơn</Text>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Rate value={rating} onChange={setRating} />
                <TextArea rows={4} value={comment} onChange={e => setComment(e.target.value)} placeholder="Nhập cảm nhận của bạn về quy trình mua sắm, thanh toán hoặc website..." />
                <Button type="primary" block loading={loading} onClick={handleSubmit}>Gửi đánh giá hệ thống</Button>
            </Space>
        </CardBase>
    );
};

const FeedbackShipperCard = ({ orderId, shipper, existingFeedback }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (existingFeedback) {
            setRating(existingFeedback.rating);
            const match = existingFeedback.comment?.match(/^\[Tags:\s*([^\]]+)\]\s*(.*)/);
            if (match) {
                setSelectedTags(match[1].split(',').map(t => t.trim()));
                setComment(match[2]);
            } else {
                setComment(existingFeedback.comment);
            }
            setSubmitted(true);
        }
    }, [existingFeedback]);

    if (!shipper) return null;

    const tags = ["Giao hàng nhanh", "Cẩn thận", "Thân thiện & lịch sự", "Đúng hẹn"];

    const handleTagClick = (tag) => {
        const newSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];
        setSelectedTags(newSelectedTags);
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            message.warning('Vui lòng chọn số sao đánh giá shipper!');
            return;
        }
        setLoading(true);
        try {
            await submitShipperFeedbackApi(orderId, { rating, comment, tags: selectedTags });
            message.success('Cảm ơn bạn đã đánh giá dịch vụ giao hàng!');
            setSubmitted(true);
        } catch (err) {
            message.error(err.response?.data?.message || 'Gửi đánh giá thất bại.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <CardBase style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#389e0d' }}>
                    <CheckCircleOutlined /> Đánh giá Shipper ({shipper.fullName})
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>
                        <Text type="secondary" style={{ marginRight: 8 }}>Điểm đánh giá:</Text>
                        <Rate disabled value={rating} />
                    </div>
                    {selectedTags.length > 0 && (
                        <Space wrap style={{ marginTop: 4 }}>
                            {selectedTags.map(tag => <Tag key={tag} color="blue">{tag}</Tag>)}
                        </Space>
                    )}
                    {comment && (
                        <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Bình luận của bạn:</Text>
                            <Paragraph italic style={{ color: '#434343', background: '#ffffff', padding: '8px 12px', borderRadius: 8, border: '1px solid #f0f0f0', margin: 0 }}>
                                "{comment}"
                            </Paragraph>
                        </div>
                    )}
                </div>
            </CardBase>
        );
    }

    return (
        <CardBase>
            <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><CarOutlined style={{ color: '#52c41a' }} /> Đánh giá Shipper ({shipper.fullName})</Title>
            <Text style={{ display: 'block', marginBottom: 16, color: '#595959' }}>Hãy chia sẻ trải nghiệm nhận hàng của bạn</Text>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Rate value={rating} onChange={setRating} />
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
                <TextArea rows={4} value={comment} onChange={e => setComment(e.target.value)} placeholder="Nhập phản hồi về quá trình vận chuyển & giao hàng..." />
                <Button type="primary" block loading={loading} onClick={handleSubmit}>Gửi đánh giá Shipper</Button>
            </Space>
        </CardBase>
    );
};

const ShipperCard = ({ shipper, status }) => {
    if (!shipper) return null;
    return (
        <CardBase style={{ border: '1px solid #e6f7ff', background: '#f0f5ff', borderRadius: 12 }}>
            <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CarOutlined style={{ color: '#1890ff' }} /> Thông tin Shipper giao hàng
            </Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#1890ff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    fontWeight: 'bold',
                    flexShrink: 0
                }}>
                    {shipper.fullName?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: 16, display: 'block' }}>{shipper.fullName}</Text>
                    <Text type="secondary" style={{ display: 'block', fontSize: 13, marginTop: 4 }}>
                        <PhoneOutlined /> {shipper.phone || 'Chưa cập nhật SĐT'}
                    </Text>
                </div>
                <div>
                    <Tag color={status === 'DELIVERED' ? 'green' : (status === 'DELIVERY_FAILED' ? 'red' : 'blue')} style={{ margin: 0, fontWeight: 500 }}>
                        {status === 'DELIVERED' ? 'Đã giao hàng' : (status === 'DELIVERY_FAILED' ? 'Giao thất bại' : 'Đang giao hàng')}
                    </Tag>
                </div>
            </div>
            {shipper.phone && (
                <>
                    <Divider style={{ margin: '16px 0' }} />
                    <Button
                        type="primary"
                        ghost
                        icon={<PhoneOutlined />}
                        href={`tel:${shipper.phone}`}
                        style={{ width: '100%', borderRadius: 8, height: 40, fontWeight: 500 }}
                    >
                        Liên hệ Shipper
                    </Button>
                </>
            )}
        </CardBase>
    );
};

const CancelOrderCard = ({ order, onCancelInitiated }) => {
    const status = order.orderStatus;

    if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.DELIVERED, ORDER_STATUS.SHIPPING].includes(status)) {
        return null;
    }
    if (status === ORDER_STATUS.CANCEL_REQUEST) {
        return (
            <CardBase>
                <Alert
                    type="warning"
                    showIcon
                    message="Yêu cầu hủy đơn đã được gửi"
                    description="Shop đang xem xét yêu cầu hủy của bạn. Vui lòng chờ phản hồi."
                />
            </CardBase>
        );
    }

    const canDirectCancel = (status === ORDER_STATUS.NEW || status === ORDER_STATUS.CONFIRMED);
    const canRequestCancel = (status === ORDER_STATUS.PREPARING);

    if (!canDirectCancel && !canRequestCancel) return null;

    return (
        <CardBase style={{ border: '1px solid #ffa39e', background: '#fff1f0' }}>
            <Title level={5} style={{ color: '#cf1322', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CloseCircleOutlined /> Hủy đơn hàng
            </Title>
            {canDirectCancel && (
                <>
                    <Text style={{ display: 'block', marginBottom: 12, color: '#595959', fontSize: 13 }}>
                        Đơn hàng của bạn đang ở trạng thái {status === ORDER_STATUS.NEW ? 'Đơn mới' : 'Đã xác nhận'}. Bạn có thể hủy trực tiếp đơn hàng này.
                    </Text>
                    <Button danger type="primary" icon={<CloseCircleOutlined />} onClick={() => onCancelInitiated('direct')} block>
                        Hủy đơn hàng
                    </Button>
                </>
            )}
            {canRequestCancel && (
                <>
                    <Text style={{ display: 'block', marginBottom: 12, color: '#595959', fontSize: 13 }}>
                        Shop đang chuẩn bị hàng. Bạn chỉ có thể gửi yêu cầu hủy, shop sẽ xem xét và phản hồi.
                    </Text>
                    <Button danger icon={<CloseCircleOutlined />} onClick={() => onCancelInitiated('request')} block>
                        Gửi yêu cầu hủy đơn
                    </Button>
                </>
            )}
        </CardBase>
    );
};

const OrderSummary = ({ order }) => {
    const activeItems = order.details.filter(item => item.status !== ORDER_DETAIL_STATUS.CANCELLED && item.status !== ORDER_DETAIL_STATUS.RETURNED);
    const subtotal = activeItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const shippingFee = Number(order.shippingFee || 30000);
    const total = Number(order.totalAmount);

    const vDiscount = Number(order.voucherDiscount || 0);
    const pDiscount = Number(order.pointsDiscount || 0);

    return (
        <CardBase>
            <Title level={4} style={{ fontWeight: 600, fontSize: 18, marginBottom: 24 }}>Tóm tắt đơn hàng</Title>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Row justify="space-between"><Text style={{ color: '#595959' }}>Tạm tính</Text><Text strong>{formatPrice(subtotal)}</Text></Row>
                <Row justify="space-between"><Text style={{ color: '#595959' }}>Phí vận chuyển</Text><Text strong>{formatPrice(shippingFee)}</Text></Row>
                {order.voucher && (
                    <Row justify="space-between">
                        <Text style={{ color: '#52c41a' }}>Voucher ({order.voucher.code})</Text>
                        <Text strong style={{ color: '#52c41a' }}>-{formatPrice(vDiscount)}</Text>
                    </Row>
                )}
                {vDiscount > 0 && !order.voucher && (
                    <Row justify="space-between">
                        <Text style={{ color: '#52c41a' }}>Giảm giá Voucher</Text>
                        <Text strong style={{ color: '#52c41a' }}>-{formatPrice(vDiscount)}</Text>
                    </Row>
                )}
                {pDiscount > 0 && (
                    <Row justify="space-between">
                        <Text style={{ color: '#fa8c16' }}>Dùng điểm tích lũy</Text>
                        <Text strong style={{ color: '#fa8c16' }}>-{formatPrice(pDiscount)}</Text>
                    </Row>
                )}
                <Row justify="space-between"><Text style={{ color: '#595959' }}>Thuế (VAT)</Text><Text strong>{formatPrice(0)}</Text></Row>
            </Space>
            <Divider style={{ margin: '24px 0' }} />
            <Row justify="space-between" align="middle">
                <Title level={4} style={{ margin: 0 }}>Tổng cộng</Title>
                <Title level={2} style={{ margin: 0, color: '#1677ff', fontWeight: 'bold', fontSize: 28 }}>{formatPrice(total)}</Title>
            </Row>
            <Button type="primary" size="large" style={{ width: '100%', height: 48, borderRadius: 8, marginTop: 24, fontWeight: 600 }}>
                Đặt lại tất cả
            </Button>
        </CardBase>
    );
};

// ✅ FIX: ReviewDrawer — lọc originFileObj trước khi gửi
const ReviewDrawer = ({ visible, product, orderId, orderDate, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [imageList, setImageList] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = ({ fileList }) => setImageList(fileList);

    const handleSubmit = async () => {
        if (rating === 0) {
            message.warning('Vui lòng chọn sao để đánh giá sản phẩm.');
            return;
        }
        setSubmitting(true);
        try {
            // ✅ FIX: Lọc bỏ undefined/null — originFileObj có thể undefined nếu file bị lỗi
            const validImages = imageList
                .map(f => f.originFileObj)
                .filter(Boolean);

            await onSubmit({ orderId, rating, comment, images: validImages });
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
            title="Gửi đánh giá"
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
                    Gửi đánh giá
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
                                Đã mua ngày {formatDateTime(orderDate)}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                #{orderId}
                            </Text>
                        </div>
                    </div>
                    <Divider />
                    <div style={{ textAlign: 'center' }}>
                        <Title level={5} style={{ color: '#8c8c8c', textTransform: 'uppercase' }}>Bạn đánh giá sản phẩm này thế nào?</Title>
                        <Rate value={rating} onChange={setRating} style={{ fontSize: 32 }} />
                    </div>
                    <Divider />
                    <Upload.Dragger
                        listType="picture-card"
                        fileList={imageList}
                        onChange={handleFileChange}
                        beforeUpload={() => false}
                        accept="image/jpeg,image/png,video/mp4"
                        style={{ background: '#fafafa', border: '2px dashed #d9d9d9' }}
                    >
                        <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                        <p className="ant-upload-text">Kéo & thả ảnh/video vào đây</p>
                        <p className="ant-upload-hint">Hỗ trợ JPG, PNG, và MP4</p>
                    </Upload.Dragger>
                    <TextArea rows={5} placeholder="Hãy chia sẻ trải nghiệm của bạn..." value={comment} onChange={e => setComment(e.target.value)} />
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
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelType, setCancelType] = useState('direct');
    const [cancelReasonInput, setCancelReasonInput] = useState('');
    const [returnModal, setReturnModal] = useState({ visible: false, itemId: null, reason: '' });

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

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleOpenReview = (product) => setReviewDrawer({ visible: true, product });
    const handleCloseReview = () => setReviewDrawer({ visible: false, product: null });

    const handleReviewSubmit = async (reviewData) => {
        try {
            const formData = new FormData();
            formData.append('orderId', reviewData.orderId);
            formData.append('rating', reviewData.rating);
            formData.append('comment', reviewData.comment || '');

            if (reviewData.images && reviewData.images.length > 0) {
                reviewData.images.forEach((file) => {
                    formData.append('images', file);
                });
            }

            await submitReviewApi(reviewDrawer.product.productId, formData);
            message.success('Đánh giá sản phẩm thành công! Bạn có thể nhận thưởng ngay.');
            fetchOrder();
        } catch (error) {
            message.error('Gửi đánh giá thất bại.');
            throw error;
        }
    };

    const handleClaimReward = async (reviewId) => {
        try {
            const res = await claimReviewRewardApi(reviewId);
            message.success(res.data.message || 'Nhận thưởng thành công! +100,000 điểm.');
            fetchOrder();
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể nhận thưởng.');
        }
    };

    const handleBuyAgain = async (productId, quantity) => {
        try {
            await addToCart({ productId, quantity });
            message.success('Sản phẩm đã được thêm vào giỏ hàng!');
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng.');
        }
    };

    const handleCancelItem = (itemId) => {
        Modal.confirm({
            title: 'Xác nhận hủy sản phẩm',
            content: 'Bạn có chắc chắn muốn hủy sản phẩm này khỏi đơn hàng không?',
            okText: 'Xác nhận',
            cancelText: 'Không',
            onOk: async () => {
                try {
                    await cancelOrderItemApi(id, itemId);
                    message.success('Sản phẩm đã được hủy.');
                    fetchOrder();
                } catch (error) {
                    message.error('Hủy sản phẩm thất bại.');
                }
            }
        });
    };

    const handleReturnItem = (itemId) => {
        setReturnModal({ visible: true, itemId, reason: '' });
    };

    const handleConfirmReturnItem = async () => {
        const { itemId, reason } = returnModal;
        if (!reason.trim()) {
            return message.warning('Vui lòng nhập lý do trả hàng!');
        }
        try {
            await requestReturnOrderItemApi(id, itemId, reason);
            message.success('Yêu cầu trả hàng đã được gửi.');
            setReturnModal({ visible: false, itemId: null, reason: '' });
            fetchOrder();
        } catch (error) {
            message.error(error.response?.data?.message || 'Gửi yêu cầu thất bại.');
        }
    };

    const handleCancelInitiated = (type) => {
        setCancelType(type);
        setCancelReasonInput('');
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        const reason = cancelReasonInput.trim();
        if (!reason) {
            return message.warning('Vui lòng nhập lý do hủy đơn hàng!');
        }

        if (cancelType === 'direct') {
            try {
                await cancelOrderApi(id, reason);
                message.success('Đơn hàng đã được hủy thành công.');
                fetchOrder();
            } catch (error) {
                message.error(error?.response?.data?.message || 'Không thể hủy đơn hàng.');
            }
        } else {
            try {
                await requestCancelOrderApi(id, reason);
                message.success('Yêu cầu hủy đơn đã được gửi đến shop.');
                fetchOrder();
            } catch (error) {
                message.error(error?.response?.data?.message || 'Không thể gửi yêu cầu hủy.');
            }
        }
        setIsCancelModalOpen(false);
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f5f7' }}><Spin size="large" /></div>;
    }

    if (!order) {
        return <PageWrapper><Container><Empty description="Không tìm thấy đơn hàng." /></Container></PageWrapper>;
    }

    return (
        <PageWrapper>
            <Container>
                <Breadcrumb style={{ marginBottom: 24 }}>
                    <Breadcrumb.Item><Link to="/"><HomeOutlined /> Trang chủ</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to="/orders">Lịch sử mua hàng</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>Chi tiết đơn hàng</Breadcrumb.Item>
                </Breadcrumb>

                <MainGrid>
                    <LeftColumn>
                        <OrderHeader order={order} />
                        {order.cancellationRequest?.status === 'REJECTED' && (
                            <Alert
                                type="error"
                                showIcon
                                message="Yêu cầu hủy đơn bị từ chối"
                                description={
                                    <div>
                                        <p>Yêu cầu hủy đơn hàng của bạn đã bị từ chối bởi cửa hàng.</p>
                                        {order.cancellationRequest.adminNotes && (
                                            <p style={{ fontWeight: 500, margin: '4px 0 0' }}>
                                                Lý do từ chối: {order.cancellationRequest.adminNotes}
                                            </p>
                                        )}
                                    </div>
                                }
                                style={{ marginBottom: 16 }}
                            />
                        )}
                        <ProductListCard
                            details={order.details}
                            orderStatus={order.orderStatus}
                            productReviews={order.productReviews}
                            onReview={handleOpenReview}
                            onCancelItem={handleCancelItem}
                            onReturnItem={handleReturnItem}
                            onClaimReward={handleClaimReward}
                            onBuyAgain={handleBuyAgain}
                        />
                        <CancelOrderCard
                            order={order}
                            onCancelInitiated={handleCancelInitiated}
                        />
                        {order.orderStatus === ORDER_STATUS.DELIVERED && (
                            <>
                                <FeedbackSystemCard orderId={order.id} existingFeedback={order.feedbacks?.find(f => f.targetType === 'ORDER')} />
                                <FeedbackShipperCard orderId={order.id} shipper={order.shipper} existingFeedback={order.feedbacks?.find(f => f.targetType === 'SHOP')} />
                            </>
                        )}
                    </LeftColumn>

                    <RightColumn>
                        <OrderSummary order={order} />
                        <ShippingAddressCard order={order} />
                        <ShipperCard shipper={order.shipper} status={order.orderStatus} />
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

            <Modal
                title={cancelType === 'direct' ? "Xác nhận hủy đơn hàng" : "Gửi yêu cầu hủy đơn hàng"}
                open={isCancelModalOpen}
                onOk={handleConfirmCancel}
                onCancel={() => setIsCancelModalOpen(false)}
                okText="Xác nhận"
                cancelText="Hủy"
                destroyOnClose
            >
                <div style={{ marginTop: 16 }}>
                    {cancelType === 'request' && (
                        <Text style={{ display: 'block', marginBottom: 12, color: '#595959', fontSize: 13 }}>
                            Bạn đã quá thời gian hủy trực tiếp hoặc shop đang chuẩn bị hàng.
                            Vui lòng nhập lý do để gửi yêu cầu hủy cho shop xét duyệt.
                        </Text>
                    )}
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        Lý do hủy đơn hàng <Text type="danger">*</Text>
                    </Text>
                    <Input.TextArea
                        rows={4}
                        placeholder={cancelType === 'direct' ? "Nhập lý do hủy đơn trực tiếp..." : "Nhập lý do gửi yêu cầu hủy đơn..."}
                        value={cancelReasonInput}
                        onChange={(e) => setCancelReasonInput(e.target.value)}
                    />
                </div>
            </Modal>

            <Modal
                title="Yêu cầu trả hàng"
                open={returnModal.visible}
                onOk={handleConfirmReturnItem}
                onCancel={() => setReturnModal({ visible: false, itemId: null, reason: '' })}
                okText="Gửi yêu cầu"
                cancelText="Hủy"
            >
                <div style={{ marginTop: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        Lý do trả hàng <Text type="danger">*</Text>
                    </Text>
                    <Input.TextArea
                        rows={4}
                        placeholder="Vui lòng mô tả chi tiết lý do bạn muốn trả sản phẩm này..."
                        value={returnModal.reason}
                        onChange={(e) => setReturnModal(prev => ({ ...prev, reason: e.target.value }))}
                    />
                </div>
            </Modal>
        </PageWrapper>
    );
};

export default OrderDetailPage;