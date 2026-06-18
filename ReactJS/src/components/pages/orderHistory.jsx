import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Badge, Space, Image, Divider, Empty, Breadcrumb, Tag, Spin, message, Modal, Timeline, Descriptions, Alert, Drawer, Rate, Input } from 'antd';
import { ShoppingOutlined, EyeOutlined, ReloadOutlined, FileTextOutlined, AppstoreOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, CarOutlined, InboxOutlined, CompassOutlined, DollarOutlined, RightOutlined, CreditCardOutlined, ExclamationCircleOutlined, CameraOutlined, ShopOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders, getOrderById, cancelOrder } from '../util/api/order.api';
import { submitReviewApi } from '../util/api/product-feature.api';
import { getImageUrl } from '../util/helpers';

const { Title, Text } = Typography;

const STATUS_CONFIG = {
    'NEW': { text: 'Đơn hàng mới', color: 'blue', icon: <SyncOutlined spin /> },
    'CONFIRMED': { text: 'Đã xác nhận', color: 'geekblue', icon: <CheckCircleOutlined /> },
    'PREPARING': { text: 'Shop đang chuẩn bị hàng', color: 'orange', icon: <ShoppingOutlined /> },
    'SHIPPING': { text: 'Đang giao hàng', color: 'gold', icon: <CarOutlined /> },
    'DELIVERED': { text: 'Đã giao thành công', color: 'green', icon: <CarOutlined /> },
    'CANCELLED': { text: 'Đã hủy', color: 'red', icon: <CloseCircleOutlined /> },
    'CANCEL_REQUEST': { text: 'Yêu cầu hủy đơn', color: 'volcano', icon: <SyncOutlined spin /> },
};

const styles = {
    pageWrapper: { background: '#f5f7fb', minHeight: '100vh', padding: '40px 0', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: 1440, margin: '0 auto', padding: '0 24px' },
    heroTitle: { fontSize: 40, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' },
    heroSubtitle: { fontSize: 16, color: '#6b7280', marginTop: 8 },
    card: { borderRadius: 28, boxShadow: '0 10px 30px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #e5e7eb', transition: 'all 0.25s ease', background: '#fff' },
    sidebarCard: { borderRadius: 28, boxShadow: '0 10px 30px rgba(0,0,0,0.06)', position: 'sticky', top: 32, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' },
    menuItem: (active) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 12, cursor: 'pointer', background: active ? '#eff6ff' : 'transparent', color: active ? '#1d4ed8' : '#4b5563', fontWeight: active ? 600 : 500, transition: 'all 0.2s ease' }),
    statCard: { background: '#f9fafb', padding: '16px 20px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16 },
    primaryBtn: { height: 44, borderRadius: 12, fontWeight: 600, background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)', border: 'none', boxShadow: '0 4px 12px rgba(22, 119, 255, 0.2)' },
    outlineBtn: { height: 44, borderRadius: 12, fontWeight: 600, color: '#4b5563', borderColor: '#d1d5db' },
    ghostBtn: { height: 44, borderRadius: 12, fontWeight: 600, color: '#1677ff' },
};

const OrderHistoryPage = () => {
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [reviewDrawerVisible, setReviewDrawerVisible] = useState(false);
    const [reviewTargetItem, setReviewTargetItem] = useState(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [shopRating, setShopRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    const breadcrumbItems = [
        {
            title: <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
        },
        {
            title: 'My Orders'
        }
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await getOrders();
            const data = res?.data?.data || res?.data || res || [];
            
            const formattedOrders = data.map(order => ({
                id: order.id,
                createdAt: order.createdAt,
                date: new Date(order.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' }),
                status: order.status,
                totalPrice: order.totalPrice,
                paymentMethod: order.payment?.method || 'COD',
                statusHistory: order.statusHistory || [],
                items: order.items?.map(item => ({
                    id: item.productId,
                    name: item.product?.name || 'Sản phẩm',
                    quantity: item.quantity,
                    image: getImageUrl(item.product?.thumbnail || '') || 'https://via.placeholder.com/60?text=P'
                })) || []
            }));
            
            setOrders(formattedOrders);
        } catch (error) {
            console.error(error);
            message.error('Lỗi khi tải lịch sử đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const loadOrderDetail = async (orderId) => {
        setDetailVisible(true);
        setDetailLoading(true);
        try {
            const res = await getOrderById(orderId);
            const data = res?.data?.data || res?.data || null;
            setSelectedOrder(data);
        } catch (error) {
            message.error(error?.response?.data?.message || 'Không tải được chi tiết đơn hàng');
            setDetailVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const canCancelOrder = (order) => {
        if (!order) return false;
        if (!['NEW', 'CONFIRMED', 'PREPARING'].includes(order.status)) return false;

        const createdAt = new Date(order.createdAt);
        const diffMinutes = (Date.now() - createdAt.getTime()) / 1000 / 60;
        return diffMinutes <= 30;
    };

    const handleCancelOrder = async (orderId) => {
        setActionLoadingId(orderId);
        try {
            await cancelOrder(orderId);
            message.success('Cập nhật trạng thái hủy đơn thành công');
            await fetchOrders();
            if (selectedOrder?.id === orderId) {
                await loadOrderDetail(orderId);
            }
        } catch (error) {
            message.error(error?.response?.data?.message || 'Không thể hủy đơn hàng');
        } finally {
            setActionLoadingId(null);
        }
    };

    const openReviewDrawer = (item) => {
        setReviewTargetItem(item);
        setReviewRating(0);
        setShopRating(0);
        setReviewComment('');
        setReviewDrawerVisible(true);
    };

    const handleSubmitReview = async () => {
        if (!selectedOrder?.id || !reviewTargetItem) return;
        if (!reviewRating) {
            message.warning('Vui lòng chọn số sao đánh giá sản phẩm');
            return;
        }

        setReviewSubmitting(true);
        try {
            const productId = reviewTargetItem.productId || reviewTargetItem.product?.id;
            await submitReviewApi(productId, {
                orderId: selectedOrder.id,
                rating: reviewRating,
                comment: reviewComment
            });

            message.success('Gửi đánh giá thành công. Bạn đã nhận thưởng điểm hoặc mã giảm giá.');
            setReviewDrawerVisible(false);
            await loadOrderDetail(selectedOrder.id);
        } catch (error) {
            message.error(error?.response?.data?.message || 'Không thể gửi đánh giá sản phẩm');
        } finally {
            setReviewSubmitting(false);
        }
    };

    const filteredOrders = filterStatus === 'ALL' 
        ? orders 
        : filterStatus === 'PROGRESS'
            ? orders.filter(order => ['NEW', 'CONFIRMED', 'PREPARING', 'SHIPPING'].includes(order.status))
            : orders.filter(order => order.status === filterStatus);

    const stats = {
        total: orders.length,
        progress: orders.filter(o => ['NEW', 'CONFIRMED', 'PREPARING', 'SHIPPING'].includes(o.status)).length,
        confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
        shipping: orders.filter(o => o.status === 'SHIPPING').length,
        delivered: orders.filter(o => o.status === 'DELIVERED').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED').length,
        cancel_request: orders.filter(o => o.status === 'CANCEL_REQUEST').length,
        totalSpent: orders.filter(o => o.status === 'DELIVERED').reduce((acc, curr) => acc + curr.totalPrice, 0)
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDateTime = (value) => {
        if (!value) return '---';
        return new Date(value).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const FilterMenuItem = ({ id, label, icon, count, active, onClick }) => (
        <div style={styles.menuItem(active)} onClick={onClick} className="filter-menu-item">
            <Space>
                {icon}
                <span>{label}</span>
            </Space>
            <Badge count={count} style={{ backgroundColor: active ? '#3b82f6' : '#d1d5db', color: '#fff', boxShadow: 'none' }} />
        </div>
    );

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f7fb' }}><Spin size="large" /></div>;
    }

    return (
        <div style={styles.pageWrapper}>
            <style>{`
                .order-card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(0,0,0,0.1) !important; }
                .product-img { transition: transform 0.3s ease; }
                .product-img:hover { transform: scale(1.1); }
                .product-name:hover { color: #1677ff !important; }
                .filter-menu-item:hover { background: #f3f4f6; }
                .btn-buy-again:hover { transform: scale(1.02); box-shadow: 0 8px 20px rgba(22, 119, 255, 0.3) !important; }
                .status-badge { box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                .timeline-step { position: relative; padding-bottom: 24px; }
                .timeline-step:not(:last-child)::before { content: ''; position: absolute; left: 15px; top: 32px; bottom: 0; width: 2px; background: #e5e7eb; }
                .filter-chips::-webkit-scrollbar { display: none; }
            `}</style>

            <div style={styles.container}>
                {/* Hero Section */}
                <Row justify="space-between" align="bottom" style={{ marginBottom: 40 }}>
                    <Col xs={24} md={12}>
                        <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16, fontSize: 13, color: '#6b7280' }} />
                        <Title style={styles.heroTitle}>My Orders</Title>
                        <Text style={styles.heroSubtitle}>Track, manage and review all your purchases.</Text>
                    </Col>
                    <Col xs={24} md={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: { xs: 24, md: 0 } }}>
                        <div style={styles.statCard}>
                            <div style={{ background: '#e0e7ff', padding: 12, borderRadius: 12, color: '#4f46e5' }}><DollarOutlined style={{ fontSize: 20 }}/></div>
                            <div>
                                <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Total Spent</Text>
                                <Text strong style={{ fontSize: 18, color: '#111827' }}>{formatPrice(stats.totalSpent)}</Text>
                            </div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={{ background: '#dcfce7', padding: 12, borderRadius: 12, color: '#16a34a' }}><InboxOutlined style={{ fontSize: 20 }}/></div>
                            <div>
                                <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Delivered</Text>
                                <Text strong style={{ fontSize: 18, color: '#111827' }}>{stats.delivered} Orders</Text>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row gutter={[40, 40]}>
                    {/* Left: Orders List */}
                    <Col xs={24} lg={16}>
                        {/* Mobile Filter Chips */}
                        <div className="filter-chips" style={{ display: 'flex', gap: 12, overflowX: 'auto', marginBottom: 24, paddingBottom: 8, padding: '0 4px' }}>
                            <div style={{ display: 'none' /* Will show on mobile via CSS if needed, skipped for simplicity here */ }}></div>
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div style={{ padding: '80px 24px', background: '#fff', borderRadius: 28, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                <div style={{ padding: 32, background: '#f9fafb', borderRadius: '50%', display: 'inline-block', marginBottom: 24 }}>
                                    <InboxOutlined style={{ fontSize: 64, color: '#9ca3af' }} />
                                </div>
                                <Title level={3} style={{ color: '#111827', marginBottom: 8 }}>No orders yet</Title>
                                <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 24 }}>Looks like you haven't made any purchases yet.</Text>
                                <Button type="primary" size="large" onClick={() => navigate('/products')} style={{ borderRadius: 999, height: 50, paddingInline: 32, fontWeight: 600, background: '#111827', borderColor: '#111827' }}>
                                    Start Shopping
                                </Button>
                            </div>
                        ) : (
                            <Space orientation="vertical" size={24} style={{ width: '100%' }}>
                                {filteredOrders.map(order => {
                                    const statusObj = STATUS_CONFIG[order.status] || { text: order.status, color: 'default', icon: null };
                                    const isPending = ['NEW', 'CONFIRMED', 'PREPARING'].includes(order.status);
                                    const showCancel = canCancelOrder(order);
                                    
                                    // Custom colors for status tags
                                    const tagBg = statusObj.color === 'blue' ? '#eff6ff' : statusObj.color === 'green' ? '#dcfce7' : statusObj.color === 'gold' ? '#fef3c7' : statusObj.color === 'orange' ? '#ffedd5' : '#fee2e2';
                                    const tagColor = statusObj.color === 'blue' ? '#1d4ed8' : statusObj.color === 'green' ? '#15803d' : statusObj.color === 'gold' ? '#b45309' : statusObj.color === 'orange' ? '#c2410c' : '#b91c1c';

                                    return (
                                        <Card key={order.id} variant="borderless" className="order-card" style={styles.card} styles={{ body: { padding: 32 } }}>
                                            {/* Order Header */}
                                            <Row justify="space-between" align="middle" style={{ paddingBottom: 20, borderBottom: '1px solid #f3f4f6', marginBottom: 24 }}>
                                                <Space size="large">
                                                    <div>
                                                        <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Order ID</Text>
                                                        <Text strong style={{ fontSize: 16, color: '#111827' }}>#{String(order.id).substring(0,8).toUpperCase()}</Text>
                                                    </div>
                                                    <div>
                                                        <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Date Placed</Text>
                                                        <Text strong style={{ fontSize: 16, color: '#111827' }}>{order.date}</Text>
                                                    </div>
                                                </Space>
                                                <div style={{ background: tagBg, color: tagColor, padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }} className="status-badge">
                                                    {statusObj.icon}
                                                    {statusObj.text}
                                                </div>
                                            </Row>
                                            
                                            {/* Products Preview */}
                                            <div style={{ marginBottom: 32 }}>
                                                {order.items.slice(0, 3).map((item, index) => (
                                                    <Row key={item.id} gutter={20} align="middle" style={{ marginBottom: 16 }}>
                                                        <Col>
                                                            <div style={{ width: 64, height: 64, borderRadius: 12, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                                                <Image src={item.image} preview={false} style={{ width: '80%', height: '80%', objectFit: 'contain', mixBlendMode: 'multiply' }} className="product-img" />
                                                            </div>
                                                        </Col>
                                                        <Col flex="auto">
                                                            <Text strong style={{ fontSize: 16, color: '#111827', cursor: 'pointer' }} className="product-name">{item.name}</Text>
                                                            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>Qty: {item.quantity}</Text>
                                                        </Col>
                                                    </Row>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <div style={{ paddingLeft: 84 }}>
                                                        <Text type="secondary" style={{ fontWeight: 500 }}>+ {order.items.length - 3} more items</Text>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Footer / Actions */}
                                            <Row justify="space-between" align="bottom" style={{ background: '#f9fafb', padding: '20px 24px', borderRadius: 20, margin: '0 -8px' }}>
                                                <Col>
                                                    <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>Total Amount</Text>
                                                    <Text strong style={{ fontSize: 24, color: '#111827', display: 'block', lineHeight: 1 }}>{formatPrice(order.totalPrice)}</Text>
                                                    <Text type="secondary" style={{ fontSize: 13, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <CreditCardOutlined /> Paid via {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                                                    </Text>
                                                </Col>
                                                <Col>
                                                    <Space size={12}>
                                                        {isPending && (
                                                            <Button type="text" icon={<CompassOutlined />} style={styles.ghostBtn}>
                                                                Track Order
                                                            </Button>
                                                        )}
                                                        <Button icon={<EyeOutlined />} style={styles.outlineBtn} onClick={() => loadOrderDetail(order.id)}>
                                                            View Details
                                                        </Button>
                                                        {showCancel && (
                                                            <Button
                                                                danger
                                                                icon={<ExclamationCircleOutlined />}
                                                                loading={actionLoadingId === order.id}
                                                                onClick={() => handleCancelOrder(order.id)}
                                                            >
                                                                Hủy đơn
                                                            </Button>
                                                        )}
                                                        <Button type="primary" icon={<ReloadOutlined />} style={styles.primaryBtn} className="btn-buy-again">
                                                            Buy Again
                                                        </Button>
                                                    </Space>
                                                </Col>
                                            </Row>
                                        </Card>
                                    );
                                })}
                            </Space>
                        )}
                    </Col>

                    {/* Right: Sidebar Filters & Stats */}
                    <Col xs={24} lg={8}>
                        <div style={styles.sidebarCard}>
                            <div style={{ padding: 24, borderBottom: '1px solid #f3f4f6' }}>
                                <Title level={4} style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <AppstoreOutlined style={{ color: '#6b7280' }}/> Filters
                                </Title>
                            </div>
                            
                            <div style={{ padding: 24 }}>
                                <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                                    <FilterMenuItem id="ALL" label="All Orders" icon={<FileTextOutlined />} count={stats.total} active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} />
                                    <FilterMenuItem id="PROGRESS" label="Processing" icon={<SyncOutlined />} count={stats.progress} active={filterStatus === 'PROGRESS'} onClick={() => setFilterStatus('PROGRESS')} />
                                    <FilterMenuItem id="CONFIRMED" label="Confirmed" icon={<CheckCircleOutlined />} count={stats.confirmed} active={filterStatus === 'CONFIRMED'} onClick={() => setFilterStatus('CONFIRMED')} />
                                    <FilterMenuItem id="SHIPPING" label="Shipping" icon={<CarOutlined />} count={stats.shipping} active={filterStatus === 'SHIPPING'} onClick={() => setFilterStatus('SHIPPING')} />
                                    <FilterMenuItem id="DELIVERED" label="Delivered" icon={<CarOutlined />} count={stats.delivered} active={filterStatus === 'DELIVERED'} onClick={() => setFilterStatus('DELIVERED')} />
                                    <FilterMenuItem id="CANCELLED" label="Cancelled" icon={<CloseCircleOutlined />} count={stats.cancelled} active={filterStatus === 'CANCELLED'} onClick={() => setFilterStatus('CANCELLED')} />
                                </Space>
                            </div>

                            <div style={{ background: '#f9fafb', padding: 24, borderTop: '1px solid #f3f4f6', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
                                <Title level={5} style={{ marginTop: 0, marginBottom: 16, color: '#4b5563' }}>Recent Activity</Title>
                                {orders.length > 0 ? (
                                    <div style={{ fontSize: 14 }}>
                                        <div className="timeline-step">
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}><CheckCircleOutlined /></div>
                                                <div>
                                                    <Text strong style={{ display: 'block', color: '#111827' }}>Order Delivered</Text>
                                                    <Text type="secondary" style={{ fontSize: 13 }}>Your order #{String(orders[0].id).substring(0,6).toUpperCase()} has been delivered successfully.</Text>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="timeline-step" style={{ paddingBottom: 0 }}>
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}><DollarOutlined /></div>
                                                <div>
                                                    <Text strong style={{ display: 'block', color: '#111827' }}>Payment Confirmed</Text>
                                                    <Text type="secondary" style={{ fontSize: 13 }}>Payment for order #{String(orders[0].id).substring(0,6).toUpperCase()} was successful.</Text>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Text type="secondary">No recent activity.</Text>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Modal
                title={selectedOrder ? `Chi tiết đơn #${String(selectedOrder.id).substring(0, 8).toUpperCase()}` : 'Chi tiết đơn hàng'}
                open={detailVisible}
                onCancel={() => {
                    setDetailVisible(false);
                    setReviewDrawerVisible(false);
                }}
                footer={null}
                width={920}
                destroyOnHidden
            >
                {detailLoading || !selectedOrder ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Space orientation="vertical" size={20} style={{ width: '100%' }}>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={(STATUS_CONFIG[selectedOrder.status] || { color: 'default' }).color}>
                                    {(STATUS_CONFIG[selectedOrder.status] || { text: selectedOrder.status }).text}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">{formatDateTime(selectedOrder.createdAt)}</Descriptions.Item>
                            <Descriptions.Item label="Thanh toán">{selectedOrder.payment?.method || 'COD'}</Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">{formatPrice(selectedOrder.totalPrice)}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>{selectedOrder.shippingAddress || '---'}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{selectedOrder.phoneNumber || '---'}</Descriptions.Item>
                            <Descriptions.Item label="Ghi chú">{selectedOrder.note || '---'}</Descriptions.Item>
                        </Descriptions>

                        {selectedOrder.status === 'PREPARING' && (
                            <Alert
                                type="warning"
                                showIcon
                                message="Đơn đang ở bước Shop đang chuẩn bị hàng"
                                description="Nếu bạn muốn hủy, hệ thống sẽ gửi yêu cầu hủy cho shop/admin thay vì hủy ngay lập tức."
                            />
                        )}

                        <div>
                            <Title level={5}>Lịch sử trạng thái</Title>
                            <Timeline
                                items={(selectedOrder.statusHistory || []).map(history => {
                                    const meta = STATUS_CONFIG[history.status] || { text: history.status, color: 'default' };
                                    const actor = history.changedByUser
                                        ? `${history.changedByUser.firstName || ''} ${history.changedByUser.lastName || ''}`.trim() || history.changedByUser.email
                                        : 'Hệ thống';

                                    return {
                                        color: meta.color,
                                        children: (
                                            <div>
                                                <Text strong>{meta.text}</Text>
                                                <div><Text type="secondary">{history.note || '---'}</Text></div>
                                                <div><Text type="secondary">Bởi: {actor}</Text></div>
                                                <div><Text type="secondary">{formatDateTime(history.createdAt)}</Text></div>
                                            </div>
                                        )
                                    };
                                })}
                            />
                        </div>

                        <div>
                            <Title level={5}>Sản phẩm</Title>
                            <Space orientation="vertical" style={{ width: '100%' }} size={12}>
                                {(selectedOrder.items || []).map(item => (
                                    <Card key={item.id} size="small" style={{ borderRadius: 16 }}>
                                        <Row gutter={16} align="middle">
                                            <Col>
                                                <Image
                                                    src={item.product?.thumbnail ? getImageUrl(item.product.thumbnail) : 'https://via.placeholder.com/64?text=P'}
                                                    preview={false}
                                                    width={64}
                                                    height={64}
                                                    style={{ objectFit: 'contain' }}
                                                />
                                            </Col>
                                            <Col flex="auto">
                                                <Text strong>{item.product?.name || 'Sản phẩm'}</Text>
                                                <div><Text type="secondary">Số lượng: {item.quantity}</Text></div>
                                                {selectedOrder.status === 'DELIVERED' && (
                                                    <div style={{ marginTop: 8 }}>
                                                        <Button type="link" style={{ padding: 0 }} onClick={() => openReviewDrawer(item)}>
                                                            Đánh giá sản phẩm
                                                        </Button>
                                                    </div>
                                                )}
                                            </Col>
                                            <Col>
                                                <Text strong>{formatPrice(item.price * item.quantity)}</Text>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                            </Space>
                        </div>
                    </Space>
                )}
            </Modal>

            <Drawer
                title="Submit Review"
                placement="right"
                open={reviewDrawerVisible}
                onClose={() => setReviewDrawerVisible(false)}
                size="default"
                styles={{ body: { background: '#f8fafc', padding: 0 } }}
            >
                <div style={{ padding: 20 }}>
                    <Card variant="borderless" styles={{ body: { padding: 12 } }} style={{ borderRadius: 14, marginBottom: 16 }}>
                        <Space>
                            <Image
                                src={reviewTargetItem?.product?.thumbnail ? getImageUrl(reviewTargetItem.product.thumbnail) : 'https://via.placeholder.com/72?text=P'}
                                preview={false}
                                width={72}
                                height={72}
                                style={{ objectFit: 'contain', background: '#f1f5f9', borderRadius: 12 }}
                            />
                            <div>
                                <Text strong>{reviewTargetItem?.product?.name || 'Sản phẩm'}</Text>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Purchased {selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN') : '---'}
                                    </Text>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        #{selectedOrder ? String(selectedOrder.id).padStart(6, '0') : '------'}
                                    </Text>
                                </div>
                            </div>
                        </Space>
                    </Card>

                    <Text strong style={{ display: 'block', marginBottom: 8 }}>HOW WOULD YOU RATE THIS PRODUCT?</Text>
                    <Rate value={reviewRating} onChange={setReviewRating} style={{ fontSize: 30, marginBottom: 16 }} />

                    <div style={{ border: '1px dashed #cbd5e1', borderRadius: 14, padding: 18, textAlign: 'center', marginBottom: 16, color: '#64748b' }}>
                        <CameraOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                        <div>Drag & drop media here</div>
                        <div style={{ fontSize: 12 }}>Supports JPG, PNG and MP4 files</div>
                    </div>

                    <Input.TextArea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                        rows={4}
                        style={{ borderRadius: 12, marginBottom: 16 }}
                    />

                    <Card size="small" style={{ borderRadius: 14, marginBottom: 16 }}>
                        <Row justify="space-between" align="middle">
                            <Space>
                                <ShopOutlined style={{ color: '#2563eb' }} />
                                <div>
                                    <Text strong>Lumina Official</Text>
                                    <div><Text type="secondary" style={{ fontSize: 12 }}>99.8% Approval</Text></div>
                                </div>
                            </Space>
                            <Text type="secondary" style={{ fontSize: 12 }}>Fast Response</Text>
                        </Row>
                    </Card>

                    <Text strong style={{ display: 'block', marginBottom: 8 }}>RATING SHOP?</Text>
                    <Rate value={shopRating} onChange={setShopRating} style={{ fontSize: 24, marginBottom: 20 }} />

                    <Button
                        type="primary"
                        block
                        loading={reviewSubmitting}
                        onClick={handleSubmitReview}
                        style={{ height: 46, borderRadius: 999, fontWeight: 600 }}
                    >
                        Submit Review
                    </Button>
                </div>
            </Drawer>
        </div>
    );
};

export default OrderHistoryPage;