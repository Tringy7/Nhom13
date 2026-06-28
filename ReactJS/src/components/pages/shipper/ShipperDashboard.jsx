import React, { useState, useEffect, useContext } from 'react';
import {
    Typography, Button, Tag, Space, Spin, message, Badge, Avatar,
    Modal, Input, Empty, Divider, Row, Col, Form, Upload, Progress
} from 'antd';
import {
    CarOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined,
    EnvironmentOutlined, PhoneOutlined, UserOutlined, LogoutOutlined,
    InboxOutlined, ShoppingOutlined, TrophyOutlined, ClockCircleOutlined,
    EditOutlined, SaveOutlined, BarChartOutlined, UploadOutlined,
    RiseOutlined, WalletOutlined, StarOutlined, TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth.context';
import { logoutApi } from '../../util/api/auth.api';
import { getUser, updateUserProfileApi } from '../../util/api/user.api';
import {
    getShipperOrdersApi, acceptOrderApi,
    markDeliveredApi, markDeliveryFailedApi,
    getShipperStatsApi
} from '../../util/api/shipper.api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const STATUS_CONFIG = {
    CONFIRMED:       { text: 'Chờ nhận đơn',  color: '#3b82f6', bg: '#eff6ff', icon: <InboxOutlined /> },
    SHIPPING:        { text: 'Đang giao',      color: '#f59e0b', bg: '#fffbeb', icon: <CarOutlined /> },
    DELIVERED:       { text: 'Đã giao',        color: '#10b981', bg: '#ecfdf5', icon: <CheckCircleOutlined /> },
    DELIVERY_FAILED: { text: 'Giao thất bại',  color: '#ef4444', bg: '#fef2f2', icon: <CloseCircleOutlined /> },
};

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));

const formatDateTime = (val) => val ? new Date(val).toLocaleString('vi-VN') : '---';

// ─── Order Card ──────────────────────────────────────────────────────────────
const OrderCard = ({ order, onAccept, onDelivered, onFailed }) => {
    const status = STATUS_CONFIG[order.orderStatus] || { text: order.orderStatus, color: '#6b7280', bg: '#f9fafb', icon: null };
    const itemCount = (order.details || []).length;
    const total = formatPrice(order.totalAmount);

    return (
        <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: 24,
            marginBottom: 20,
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            border: `1.5px solid ${status.color}22`,
            transition: 'transform 0.2s',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <Text style={{ fontSize: 13, color: '#9ca3af', display: 'block' }}>Đơn hàng</Text>
                    <Text strong style={{ fontSize: 18, letterSpacing: '-0.01em' }}>
                        #{String(order.id).substring(0, 8).toUpperCase()}
                    </Text>
                </div>
                <div style={{
                    background: status.bg,
                    color: status.color,
                    borderRadius: 999,
                    padding: '6px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                }}>
                    {status.icon} {status.text}
                </div>
            </div>

            <Divider style={{ margin: '0 0 16px' }} />

            <Space direction="vertical" style={{ width: '100%' }} size={8}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <EnvironmentOutlined style={{ color: '#ef4444', marginTop: 3, flexShrink: 0 }} />
                    <Text style={{ color: '#374151' }}>{order.shippingAddress}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <UserOutlined style={{ color: '#6b7280' }} />
                    <Text>{order.fullName}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <PhoneOutlined style={{ color: '#6b7280' }} />
                    <Text>{order.phoneNumber}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShoppingOutlined style={{ color: '#6b7280' }} />
                    <Text>{itemCount} sản phẩm</Text>
                    <Text type="secondary">•</Text>
                    <Text strong style={{ color: '#1677ff' }}>{total}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ClockCircleOutlined style={{ color: '#9ca3af' }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>{formatDateTime(order.createdAt)}</Text>
                </div>
            </Space>

            <div style={{ background: '#f9fafb', borderRadius: 12, padding: '12px 16px', marginTop: 16 }}>
                {(order.details || []).slice(0, 3).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <Text ellipsis style={{ maxWidth: '60%' }}>{item.productName || item.product?.name}</Text>
                        <Text type="secondary">x{item.quantity}</Text>
                        <Text strong>{formatPrice(item.price)}</Text>
                    </div>
                ))}
                {(order.details || []).length > 3 && (
                    <Text type="secondary" style={{ fontSize: 12 }}>... và {order.details.length - 3} sản phẩm khác</Text>
                )}
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                {order.orderStatus === 'CONFIRMED' && (
                    <Button
                        type="primary"
                        icon={<CarOutlined />}
                        onClick={() => onAccept(order.id)}
                        style={{ flex: 1, borderRadius: 12, height: 44, fontWeight: 600, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                    >
                        Nhận đơn &amp; Bắt đầu giao
                    </Button>
                )}
                {order.orderStatus === 'SHIPPING' && (
                    <>
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => onDelivered(order.id)}
                            style={{ flex: 1, borderRadius: 12, height: 44, fontWeight: 600, background: 'linear-gradient(135deg, #10b981, #059669)' }}
                        >
                            Giao thành công
                        </Button>
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => onFailed(order.id)}
                            style={{ borderRadius: 12, height: 44, fontWeight: 600 }}
                        >
                            Giao thất bại
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Stats Tab ────────────────────────────────────────────────────────────────
const StatsTab = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getShipperStatsApi();
                setStats(res?.data?.data || res?.data || null);
            } catch {
                message.error('Không thể tải thống kê.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;
    if (!stats) return <Empty description="Không có dữ liệu thống kê" />;

    const successRate = Number(stats.successRate || 0);

    const statCards = [
        { label: 'Tổng đơn đã giao', value: stats.totalDelivered, color: '#10b981', bg: '#ecfdf5', icon: <TrophyOutlined /> },
        { label: 'Giao thất bại', value: stats.totalFailed, color: '#ef4444', bg: '#fef2f2', icon: <CloseCircleOutlined /> },
        { label: 'Phí vận chuyển tháng này', value: formatPrice(stats.monthlyRevenue), color: '#3b82f6', bg: '#eff6ff', icon: <WalletOutlined />, small: true },
        { label: 'Phí vận chuyển tuần này', value: formatPrice(stats.weeklyRevenue), color: '#f59e0b', bg: '#fffbeb', icon: <RiseOutlined />, small: true },
    ];

    return (
        <div>
            {/* Revenue summary */}
            <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', borderRadius: 20, padding: 28, marginBottom: 24, color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <WalletOutlined style={{ fontSize: 22 }} />
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Tổng phí vận chuyển đã nhận</Text>
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                    {formatPrice(stats.totalRevenue)}
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    Từ {stats.totalDelivered} đơn giao thành công / {stats.totalOrders} tổng đơn · Phí mặc định 30.000đ/đơn
                </Text>
            </div>

            {/* Stat cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {statCards.map((s, i) => (
                    <Col xs={12} key={i}>
                        <div style={{ background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: `1.5px solid ${s.color}22` }}>
                            <div style={{ fontSize: 22, color: s.color, marginBottom: 8 }}>{s.icon}</div>
                            <div style={{ fontSize: s.small ? 16 : 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Success rate */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 15 }}>Tỷ lệ giao thành công</Text>
                    <Text strong style={{ color: successRate >= 80 ? '#10b981' : successRate >= 60 ? '#f59e0b' : '#ef4444', fontSize: 20 }}>
                        {successRate}%
                    </Text>
                </div>
                <Progress
                    percent={successRate}
                    strokeColor={successRate >= 80 ? '#10b981' : successRate >= 60 ? '#f59e0b' : '#ef4444'}
                    trailColor="#f1f5f9"
                    showInfo={false}
                    strokeWidth={12}
                    style={{ borderRadius: 8 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Thành công: {stats.totalDelivered}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Thất bại: {stats.totalFailed}</Text>
                </div>
            </div>

            {/* Monthly chart (bar) */}
            {stats.monthlyChart && stats.monthlyChart.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                    <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 20 }}>Phí vận chuyển 6 tháng gần đây</Text>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
                        {stats.monthlyChart.map((m, i) => {
                            const maxRev = Math.max(...stats.monthlyChart.map(x => x.revenue), 1);
                            const barH = Math.max((m.revenue / maxRev) * 100, m.revenue > 0 ? 8 : 4);
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <Text style={{ fontSize: 10, color: '#6b7280' }}>{m.revenue > 0 ? formatPrice(m.revenue).replace('₫','').trim() : ''}</Text>
                                    <div
                                        style={{
                                            width: '100%',
                                            height: `${barH}px`,
                                            background: m.revenue > 0
                                                ? 'linear-gradient(180deg, #3b82f6, #1d4ed8)'
                                                : '#e5e7eb',
                                            borderRadius: '6px 6px 0 0',
                                            transition: 'height 0.5s'
                                        }}
                                    />
                                    <Text style={{ fontSize: 10, color: '#9ca3af' }}>{m.month.slice(5)}/</Text>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Profile Tab ──────────────────────────────────────────────────────────────
const ProfileTab = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getUser();
                const data = res?.data?.user || res?.user || res?.data || res || {};
                const user = data.user || data;
                setProfile(user);
                form.setFieldsValue({
                    fullName: user.fullName || '',
                    phone: user.phone || '',
                    address: user.address || '',
                    email: user.email || '',
                });
            } catch {
                message.error('Không thể tải thông tin hồ sơ.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            await updateUserProfileApi(values);
            setProfile(prev => ({ ...prev, ...values }));
            setEditing(false);
            message.success('Cập nhật hồ sơ thành công!');
        } catch (err) {
            if (err?.response?.data?.message) {
                message.error(err.response.data.message);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

    const initials = profile?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'S';

    return (
        <div>
            {/* Avatar + name banner */}
            <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', borderRadius: 20, padding: 28, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', border: '3px solid rgba(255,255,255,0.5)', flexShrink: 0 }}>
                    {initials}
                </div>
                <div>
                    <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>{profile?.fullName || 'Shipper'}</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{profile?.email}</Text>
                    <div style={{ marginTop: 6 }}>
                        <Tag style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 999 }}>
                            🚴 Shipper
                        </Tag>
                    </div>
                </div>
            </div>

            {/* Profile form */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Text strong style={{ fontSize: 16 }}>Thông tin cá nhân</Text>
                    {!editing ? (
                        <Button icon={<EditOutlined />} onClick={() => setEditing(true)} style={{ borderRadius: 10 }}>
                            Chỉnh sửa
                        </Button>
                    ) : (
                        <Space>
                            <Button onClick={() => setEditing(false)} style={{ borderRadius: 10 }}>Hủy</Button>
                            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave} style={{ borderRadius: 10 }}>
                                Lưu thay đổi
                            </Button>
                        </Space>
                    )}
                </div>

                <Form form={form} layout="vertical" disabled={!editing}>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                <Input prefix={<UserOutlined style={{ color: '#9ca3af' }} />} placeholder="Họ và tên" style={{ borderRadius: 10, height: 44 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Số điện thoại" name="phone">
                                <Input prefix={<PhoneOutlined style={{ color: '#9ca3af' }} />} placeholder="Số điện thoại" style={{ borderRadius: 10, height: 44 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item label="Email" name="email">
                                <Input placeholder="Email" disabled style={{ borderRadius: 10, height: 44, background: '#f8fafc' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item label="Địa chỉ" name="address">
                                <Input prefix={<EnvironmentOutlined style={{ color: '#9ca3af' }} />} placeholder="Địa chỉ" style={{ borderRadius: 10, height: 44 }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                {!editing && (
                    <div style={{ marginTop: 8, padding: '16px 20px', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0' }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            💡 Nhấn <strong>Chỉnh sửa</strong> để cập nhật thông tin hồ sơ của bạn.
                        </Text>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const ShipperDashboard = () => {
    const navigate = useNavigate();
    const { dispatch, auth } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterTab, setFilterTab] = useState('CONFIRMED');
    const [activeSection, setActiveSection] = useState('orders');
    const [failModal, setFailModal] = useState({ visible: false, orderId: null, reason: '' });

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await getShipperOrdersApi();
            setOrders(res?.data?.data || res?.data || []);
        } catch {
            message.error('Không thể tải danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleAccept = async (orderId) => {
        try {
            await acceptOrderApi(orderId);
            message.success('Đã nhận đơn! Bắt đầu giao hàng.');
            fetchOrders();
        } catch (err) {
            message.error(err?.response?.data?.message || 'Không thể nhận đơn.');
        }
    };

    const handleDelivered = async (orderId) => {
        try {
            await markDeliveredApi(orderId);
            message.success('✅ Giao hàng thành công!');
            fetchOrders();
        } catch (err) {
            message.error(err?.response?.data?.message || 'Lỗi khi cập nhật trạng thái.');
        }
    };

    const handleFailed = (orderId) => {
        setFailModal({ visible: true, orderId, reason: '' });
    };

    const handleFailedConfirm = async () => {
        if (!failModal.reason.trim()) {
            message.warning('Vui lòng nhập lý do giao thất bại!');
            return;
        }
        try {
            await markDeliveryFailedApi(failModal.orderId, failModal.reason);
            message.warning('Đã ghi nhận giao hàng thất bại.');
            setFailModal({ visible: false, orderId: null, reason: '' });
            fetchOrders();
        } catch (err) {
            message.error(err?.response?.data?.message || 'Lỗi khi cập nhật trạng thái.');
        }
    };

    const handleLogout = async () => {
        await logoutApi();
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };

    const tabs = [
        { key: 'CONFIRMED',       label: 'Chờ nhận',  color: '#3b82f6' },
        { key: 'SHIPPING',        label: 'Đang giao', color: '#f59e0b' },
        { key: 'DELIVERED',       label: 'Đã giao',   color: '#10b981' },
        { key: 'DELIVERY_FAILED', label: 'Thất bại',  color: '#ef4444' },
    ];

    const filteredOrders = orders.filter(o => o.orderStatus === filterTab);
    const stats = {
        waiting:   orders.filter(o => o.orderStatus === 'CONFIRMED').length,
        shipping:  orders.filter(o => o.orderStatus === 'SHIPPING').length,
        delivered: orders.filter(o => o.orderStatus === 'DELIVERED').length,
        failed:    orders.filter(o => o.orderStatus === 'DELIVERY_FAILED').length,
    };

    const navItems = [
        { key: 'orders',  label: 'Đơn hàng',  icon: <CarOutlined /> },
        { key: 'stats',   label: 'Thống kê',  icon: <BarChartOutlined /> },
        { key: 'profile', label: 'Hồ sơ',     icon: <UserOutlined /> },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { font-family: 'Inter', sans-serif; }
                .tab-btn { transition: all 0.2s; cursor: pointer; }
                .tab-btn:hover { transform: translateY(-1px); }
                .order-card-wrap:hover > div { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.10) !important; }
                .nav-item { transition: all 0.2s; cursor: pointer; }
                .nav-item:hover { background: rgba(255,255,255,0.2) !important; }
            `}</style>

            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0891b2 100%)',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 20px rgba(30, 64, 175, 0.3)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 14, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                        🚴
                    </div>
                    <div>
                        <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 800, fontSize: 16 }}>Shipper Dashboard</Title>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                            Xin chào, {auth?.user?.fullName || auth?.user?.name || 'Shipper'} 👋
                        </Text>
                    </div>
                </div>
                <Space>
                    {activeSection === 'orders' && (
                        <Button icon={<ReloadOutlined />} onClick={fetchOrders} style={{ borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}>
                            Làm mới
                        </Button>
                    )}
                    <Button icon={<LogoutOutlined />} onClick={handleLogout} style={{ borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
                        Đăng xuất
                    </Button>
                </Space>
            </div>

            {/* Bottom nav (mobile-style) */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center' }}>
                {navItems.map(item => (
                    <button
                        key={item.key}
                        className="nav-item"
                        onClick={() => setActiveSection(item.key)}
                        style={{
                            flex: 1,
                            maxWidth: 160,
                            padding: '12px 8px',
                            border: 'none',
                            borderBottom: activeSection === item.key ? '3px solid #3b82f6' : '3px solid transparent',
                            background: 'transparent',
                            color: activeSection === item.key ? '#3b82f6' : '#6b7280',
                            fontWeight: activeSection === item.key ? 700 : 500,
                            fontSize: 13,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                        }}
                    >
                        <span style={{ fontSize: 18 }}>{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>

                {/* ── Orders Section ── */}
                {activeSection === 'orders' && (
                    <>
                        {/* Quick stats */}
                        <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
                            {[
                                { label: 'Chờ nhận', value: stats.waiting,   color: '#3b82f6', icon: <InboxOutlined /> },
                                { label: 'Đang giao', value: stats.shipping,  color: '#f59e0b', icon: <CarOutlined /> },
                                { label: 'Đã giao',   value: stats.delivered, color: '#10b981', icon: <TrophyOutlined /> },
                                { label: 'Thất bại',  value: stats.failed,    color: '#ef4444', icon: <CloseCircleOutlined /> },
                            ].map((s, i) => (
                                <Col xs={12} sm={6} key={i}>
                                    <div style={{ background: '#fff', borderRadius: 16, padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: `1.5px solid ${s.color}22`, textAlign: 'center' }}>
                                        <div style={{ fontSize: 22, color: s.color }}>{s.icon}</div>
                                        <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</div>
                                    </div>
                                </Col>
                            ))}
                        </Row>

                        {/* Filter tabs */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    className="tab-btn"
                                    onClick={() => setFilterTab(tab.key)}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: 999,
                                        border: filterTab === tab.key ? `2px solid ${tab.color}` : '2px solid #e5e7eb',
                                        background: filterTab === tab.key ? tab.color : '#fff',
                                        color: filterTab === tab.key ? '#fff' : '#374151',
                                        fontWeight: 600,
                                        fontSize: 13,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        boxShadow: filterTab === tab.key ? `0 4px 12px ${tab.color}44` : 'none'
                                    }}
                                >
                                    {tab.label}
                                    {orders.filter(o => o.orderStatus === tab.key).length > 0 && (
                                        <Badge
                                            count={orders.filter(o => o.orderStatus === tab.key).length}
                                            style={{ background: filterTab === tab.key ? 'rgba(255,255,255,0.3)' : tab.color, boxShadow: 'none' }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Order list */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 80 }}>
                                <Spin size="large" />
                                <div style={{ marginTop: 16, color: '#6b7280' }}>Đang tải đơn hàng...</div>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div style={{ background: '#fff', borderRadius: 24, padding: '60px 24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                                <div style={{ fontSize: 56, marginBottom: 12 }}>📦</div>
                                <Title level={4} style={{ color: '#6b7280' }}>
                                    {filterTab === 'CONFIRMED' ? 'Không có đơn nào chờ nhận' :
                                     filterTab === 'SHIPPING'  ? 'Không có đơn nào đang giao' :
                                     filterTab === 'DELIVERED' ? 'Chưa có đơn giao thành công' :
                                     'Không có đơn giao thất bại'}
                                </Title>
                            </div>
                        ) : (
                            <div>
                                {filteredOrders.map(order => (
                                    <div key={order.id} className="order-card-wrap">
                                        <OrderCard
                                            order={order}
                                            onAccept={handleAccept}
                                            onDelivered={handleDelivered}
                                            onFailed={handleFailed}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── Stats Section ── */}
                {activeSection === 'stats' && <StatsTab />}

                {/* ── Profile Section ── */}
                {activeSection === 'profile' && <ProfileTab />}
            </div>

            {/* Modal giao thất bại */}
            <Modal
                title={<><CloseCircleOutlined style={{ color: '#ef4444', marginRight: 8 }} />Xác nhận giao hàng thất bại</>}
                open={failModal.visible}
                onOk={handleFailedConfirm}
                onCancel={() => setFailModal({ visible: false, orderId: null, reason: '' })}
                okText="Xác nhận thất bại"
                cancelText="Hủy"
                okButtonProps={{ danger: true, disabled: !failModal.reason.trim() }}
            >
                <Text style={{ display: 'block', marginBottom: 12, color: '#6b7280' }}>
                    Vui lòng ghi rõ lý do giao hàng thất bại để shop và khách hàng được biết.
                </Text>
                <TextArea
                    rows={4}
                    placeholder="Ví dụ: Khách hàng không có mặt, sai địa chỉ, không liên lạc được..."
                    value={failModal.reason}
                    onChange={e => setFailModal(prev => ({ ...prev, reason: e.target.value }))}
                    style={{ borderRadius: 10 }}
                />
            </Modal>
        </div>
    );
};

export default ShipperDashboard;
