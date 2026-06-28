import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Badge, Space, Image, Divider, Empty, Breadcrumb, Tag, Spin, message } from 'antd';
import { ShoppingOutlined, EyeOutlined, ReloadOutlined, FileTextOutlined, AppstoreOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, CarOutlined, InboxOutlined, DollarOutlined, WarningOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders } from '../util/api/order.api';
import { getImageUrl } from '../util/helpers';

const { Title, Text } = Typography;

const STATUS_CONFIG = {
    'NEW': { text: 'Đơn mới', color: 'blue', icon: <SyncOutlined spin /> },
    'CONFIRMED': { text: 'Đã xác nhận', color: 'geekblue', icon: <CheckCircleOutlined /> },
    'PREPARING': { text: 'Đang chuẩn bị', color: 'orange', icon: <ShoppingOutlined /> },
    'SHIPPING': { text: 'Đang giao hàng', color: 'gold', icon: <CarOutlined /> },
    'DELIVERED': { text: 'Giao thành công', color: 'green', icon: <CheckCircleOutlined /> },
    'DELIVERY_FAILED': { text: 'Giao thất bại', color: 'red', icon: <CloseCircleOutlined /> },
    'CANCELLED': { text: 'Đã hủy', color: 'red', icon: <CloseCircleOutlined /> },
    'CANCEL_REQUEST': { text: 'Yêu cầu hủy', color: 'volcano', icon: <SyncOutlined spin /> },
};

const ORDER_DETAIL_STATUS = Object.freeze({
    EXISTED: 'EXISTED',
    CANCELLED: 'CANCELLED'
});

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
};

const OrderHistoryPage = () => {
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const breadcrumbItems = [
        { title: <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a> },
        { title: 'My Orders' }
    ];

    const formatPrice = (price) => {
        const value = Number(price || 0);
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await getOrders();
                const data = res?.data || [];
                
                const formattedOrders = data.map(order => ({
                    id: order.id,
                    createdAt: order.createdAt,
                    date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
                    status: order.orderStatus,
                    totalPrice: Number(order.totalAmount),
                    shippingFee: Number(order.shippingFee || 0),
                    shippingMethod: order.shippingMethod,
                    paymentMethod: order.payment?.method || 'COD',
                    paymentStatus: order.payment?.status,
                    shippingAddress: order.shippingAddress,
                    items: (order.details || []).map((item, index) => ({
                        id: item.productId || `temp-${index}`,
                        name: item.product.name,
                        quantity: Number(item.quantity),
                        price: Number(item.price),
                        status: item.status,
                        image: getImageUrl(item.product.thumbnail)
                    }))
                }));
                
                setOrders(formattedOrders);
            } catch (error) {
                console.error(error);
                // message.error('Lỗi khi tải lịch sử đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = filterStatus === 'ALL' 
        ? orders 
        : filterStatus === 'PROGRESS'
            ? orders.filter(order => ['NEW', 'CONFIRMED', 'PREPARING'].includes(order.status))
            : filterStatus === 'SHIPPING'
                ? orders.filter(order => order.status === 'SHIPPING')
                : filterStatus === 'DELIVERED'
                    ? orders.filter(order => order.status === 'DELIVERED')
                    : filterStatus === 'FAILED'
                        ? orders.filter(order => order.status === 'DELIVERY_FAILED')
                        : filterStatus === 'CANCELLED'
                            ? orders.filter(order => order.status === 'CANCELLED')
                            : filterStatus === 'CANCEL_REQUEST'
                                ? orders.filter(order => order.status === 'CANCEL_REQUEST')
                                : orders;

    const stats = {
        total: orders.length,
        progress: orders.filter(o => ['NEW', 'CONFIRMED', 'PREPARING'].includes(o.status)).length,
        shipping: orders.filter(o => o.status === 'SHIPPING').length,
        delivered: orders.filter(o => o.status === 'DELIVERED').length,
        failed: orders.filter(o => o.status === 'DELIVERY_FAILED').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED').length,
        cancelRequest: orders.filter(o => o.status === 'CANCEL_REQUEST').length,
        totalSpent: orders.filter(o => o.status === 'DELIVERED').reduce((acc, curr) => acc + curr.totalPrice, 0)
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
                .product-name:hover { color: #1677ff !important; }
                .filter-menu-item:hover { background: #f3f4f6; }
                .btn-buy-again:hover { transform: scale(1.02); box-shadow: 0 8px 20px rgba(22, 119, 255, 0.3) !important; }
                .status-badge { box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            `}</style>

            <div style={styles.container}>
                <Row justify="space-between" align="bottom" style={{ marginBottom: 40 }}>
                    <Col xs={24} md={12}>
                        <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16, fontSize: 13, color: '#6b7280' }} />
                        <Title style={styles.heroTitle}>My Orders</Title>
                        <Text style={styles.heroSubtitle}>Track, manage and review all your purchases.</Text>
                    </Col>
                    <Col xs={24} md={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 24 }}>
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
                    <Col xs={24} lg={16}>
                        {filteredOrders.length === 0 ? (
                            <div style={{ padding: '80px 24px', background: '#fff', borderRadius: 28, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                <InboxOutlined style={{ fontSize: 64, color: '#9ca3af', marginBottom: 24 }} />
                                <Title level={3}>No orders yet</Title>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Looks like you haven't made any purchases yet.</Text>
                                <Button type="primary" size="large" onClick={() => navigate('/products')} style={{ borderRadius: 999, height: 50, paddingInline: 32, fontWeight: 600 }}>
                                    Start Shopping
                                </Button>
                            </div>
                        ) : (
                            <Space direction="vertical" size={24} style={{ width: '100%' }}>
                                {filteredOrders.map(order => {
                                    const statusObj = STATUS_CONFIG[order.status] || { text: order.status, color: 'default', icon: null };
                                    const tagBg = statusObj.color === 'blue' ? '#eff6ff' : statusObj.color === 'green' ? '#dcfce7' : statusObj.color === 'gold' ? '#fef3c7' : statusObj.color === 'orange' ? '#ffedd5' : '#fee2e2';
                                    const tagColor = statusObj.color === 'blue' ? '#1d4ed8' : statusObj.color === 'green' ? '#15803d' : statusObj.color === 'gold' ? '#b45309' : statusObj.color === 'orange' ? '#c2410c' : '#b91c1c';

                                    const isCOD = order.paymentMethod === 'COD';
                                    let paymentStatusText = isCOD ? 'Chưa thanh toán' : 'Đã thanh toán';
                                    let paymentStatusColor = isCOD ? 'orange' : 'green';

                                    // If COD and delivered, it's paid
                                    if (isCOD && order.status === 'DELIVERED') {
                                        paymentStatusText = 'Đã thanh toán';
                                        paymentStatusColor = 'green';
                                    }
                                    // If cancelled, payment status is moot
                                    if (order.status === 'CANCELLED') {
                                        paymentStatusText = 'Giao dịch hủy';
                                        paymentStatusColor = 'default';
                                    }


                                    return (
                                        <Card key={order.id} variant="borderless" className="order-card" style={styles.card} bodyStyle={{ padding: 0 }}>
                                            <Row justify="space-between" align="middle" style={{ padding: '20px 32px', borderBottom: '1px solid #f3f4f6' }}>
                                                <Space size="large">
                                                    <div>
                                                        <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Order ID</Text>
                                                        <Text strong style={{ fontSize: 16 }}>#{String(order.id).substring(0,8).toUpperCase()}</Text>
                                                    </div>
                                                    <div>
                                                        <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Date Placed</Text>
                                                        <Text strong style={{ fontSize: 16 }}>{order.date}</Text>
                                                    </div>
                                                </Space>
                                                <div style={{ background: tagBg, color: tagColor, padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }} className="status-badge">
                                                    {statusObj.icon}
                                                    {statusObj.text}
                                                </div>
                                            </Row>
                                            
                                            <div style={{ padding: '0 32px', margin: '24px 0' }}>
                                                {order.items.slice(0, 3).map((item) => {
                                                    const isCancelled = item.status === ORDER_DETAIL_STATUS.CANCELLED;
                                                    const itemStyle = isCancelled ? { opacity: 0.5, textDecoration: 'line-through' } : {};
                                                    return (
                                                        <Row key={item.id} gutter={20} align="middle" style={{ marginBottom: 16, ...itemStyle }}>
                                                            <Col>
                                                                <Image 
                                                                    src={item.image} 
                                                                    width={64} 
                                                                    height={64} 
                                                                    preview={false} 
                                                                    style={{ objectFit: 'contain', borderRadius: 8, border: '1px solid #e5e7eb' }}
                                                                    fallback="/placeholder-product.png"
                                                                />
                                                            </Col>
                                                            <Col flex="auto">
                                                                <Text strong className="product-name">{item.name}</Text>
                                                                <Text type="secondary" style={{ display: 'block' }}>Qty: {item.quantity}</Text>
                                                            </Col>
                                                            <Col>
                                                                <Text strong>{formatPrice(item.price)}</Text>
                                                            </Col>
                                                        </Row>
                                                    );
                                                })}
                                                {order.items.length > 3 && (
                                                    <Text type="secondary" style={{ paddingLeft: 84 }}>+ {order.items.length - 3} more items</Text>
                                                )}
                                            </div>

                                            <Row justify="space-between" align="middle" style={{ background: '#f9fafb', padding: '20px 32px', borderTop: '1px solid #f3f4f6' }}>
                                                <Col>
                                                    <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>Total Amount</Text>
                                                    <Space align="baseline">
                                                        <Text strong style={{ fontSize: 24, color: '#111827' }}>{formatPrice(order.totalPrice)}</Text>
                                                        <Tag color={paymentStatusColor}>{paymentStatusText}</Tag>
                                                    </Space>
                                                </Col>
                                                <Col>
                                                    <Space size={12}>
                                                        <Button icon={<EyeOutlined />} style={styles.outlineBtn} onClick={() => navigate(`/orders/${order.id}`)}>
                                                            View Details
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

                    <Col xs={24} lg={8}>
                        <div style={styles.sidebarCard}>
                            <div style={{ padding: 24, borderBottom: '1px solid #f3f4f6' }}>
                                <Title level={4} style={{ margin: 0, fontWeight: 700 }}><AppstoreOutlined /> Filters</Title>
                            </div>
                            <div style={{ padding: 24 }}>
                                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                    <FilterMenuItem id="ALL" label="Tất cả đơn" icon={<FileTextOutlined />} count={stats.total} active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} />
                                    <FilterMenuItem id="PROGRESS" label="Đang chuẩn bị" icon={<SyncOutlined />} count={stats.progress} active={filterStatus === 'PROGRESS'} onClick={() => setFilterStatus('PROGRESS')} />
                                    <FilterMenuItem id="SHIPPING" label="Đang giao" icon={<CarOutlined />} count={stats.shipping} active={filterStatus === 'SHIPPING'} onClick={() => setFilterStatus('SHIPPING')} />
                                    <FilterMenuItem id="DELIVERED" label="Đã giao" icon={<CheckCircleOutlined />} count={stats.delivered} active={filterStatus === 'DELIVERED'} onClick={() => setFilterStatus('DELIVERED')} />
                                    <FilterMenuItem id="FAILED" label="Giao thất bại" icon={<CloseCircleOutlined />} count={stats.failed} active={filterStatus === 'FAILED'} onClick={() => setFilterStatus('FAILED')} />
                                    <FilterMenuItem id="CANCELLED" label="Đã hủy" icon={<CloseCircleOutlined />} count={stats.cancelled} active={filterStatus === 'CANCELLED'} onClick={() => setFilterStatus('CANCELLED')} />
                                    <FilterMenuItem id="CANCEL_REQUEST" label="Yêu cầu hủy" icon={<WarningOutlined />} count={stats.cancelRequest} active={filterStatus === 'CANCEL_REQUEST'} onClick={() => setFilterStatus('CANCEL_REQUEST')} />
                                </Space>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default OrderHistoryPage;