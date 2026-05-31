import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Descriptions, Divider, Modal, Row, Space, Spin, Table, Tag, Timeline, Typography, message } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, LoadingOutlined, ReloadOutlined, RocketOutlined, ShoppingOutlined, TruckOutlined } from '@ant-design/icons';
import { getAdminOrders, getAdminOrderById, handleAdminCancelRequest, updateAdminOrderStatus } from '../util/api/order.api';
import { getImageUrl } from '../util/helpers';

const { Title, Text } = Typography;

const STATUS_META = {
    new: { text: 'Đơn hàng mới', color: 'blue' },
    confirmed: { text: 'Đã xác nhận', color: 'geekblue' },
    preparing: { text: 'Shop đang chuẩn bị hàng', color: 'orange' },
    shipping: { text: 'Đang giao hàng', color: 'gold' },
    delivered: { text: 'Đã giao thành công', color: 'green' },
    cancelled: { text: 'Đã hủy', color: 'red' },
    cancel_request: { text: 'Yêu cầu hủy đơn', color: 'volcano' }
};

const PAYMENT_META = {
    COD: 'Thanh toán khi nhận hàng',
    pending: 'Chờ thanh toán',
    paid: 'Đã thanh toán'
};

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));

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

const getActionConfig = (status) => {
    switch (status) {
        case 'new':
            return { label: 'Xác nhận đơn', nextStatus: 'confirmed', icon: <CheckOutlined /> };
        case 'confirmed':
            return { label: 'Chuyển chuẩn bị', nextStatus: 'preparing', icon: <ShoppingOutlined /> };
        case 'preparing':
            return { label: 'Chuyển giao hàng', nextStatus: 'shipping', icon: <TruckOutlined /> };
        case 'shipping':
            return { label: 'Đánh dấu đã giao', nextStatus: 'delivered', icon: <RocketOutlined /> };
        case 'cancel_request':
            return { label: 'Duyệt hủy', approveCancel: true, icon: <CloseOutlined /> };
        default:
            return null;
    }
};

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusLoadingId, setStatusLoadingId] = useState(null);

    const unwrapApiData = (response, fallback = []) => {
        const payload = response?.data ?? response;
        if (payload && Array.isArray(payload.data)) return payload.data;
        if (payload && payload.data) return payload.data;
        if (Array.isArray(payload)) return payload;
        return fallback;
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await getAdminOrders();
            const data = unwrapApiData(res);
            setOrders(data);
        } catch (error) {
            message.error(error?.response?.data?.message || 'Không tải được danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const loadOrderDetail = async (orderId) => {
        setDetailLoading(true);
        setDetailVisible(true);
        try {
            const res = await getAdminOrderById(orderId);
            const data = unwrapApiData(res, null);
            setSelectedOrder(data);
        } catch (error) {
            message.error(error?.response?.data?.message || 'Không tải được chi tiết đơn hàng');
            setDetailVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleStatusChange = async (orderId, actionConfig) => {
        setStatusLoadingId(orderId);
        try {
            if (actionConfig.approveCancel) {
                await handleAdminCancelRequest(orderId, true);
                message.success('Đã duyệt yêu cầu hủy đơn');
            } else {
                await updateAdminOrderStatus(orderId, actionConfig.nextStatus, actionConfig.label);
                message.success('Đã cập nhật trạng thái đơn hàng');
            }
            await fetchOrders();
            if (selectedOrder?.id === orderId) {
                await loadOrderDetail(orderId);
            }
        } catch (error) {
            message.error(error?.response?.data?.message || 'Không cập nhật được trạng thái');
        } finally {
            setStatusLoadingId(null);
        }
    };

    const columns = useMemo(() => ([
        {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <Text strong>#{String(id).padStart(6, '0')}</Text>
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => `${record.user?.firstName || ''} ${record.user?.lastName || ''}`.trim() || record.user?.email || '---'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const meta = STATUS_META[status] || { text: status, color: 'default' };
                return <Tag color={meta.color}>{meta.text}</Tag>;
            }
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (value) => formatPrice(value)
        },
        {
            title: 'Tạo lúc',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (value) => formatDateTime(value)
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => {
                const actionConfig = getActionConfig(record.status);
                return (
                    <Space wrap>
                        <Button icon={<EyeOutlined />} onClick={() => loadOrderDetail(record.id)}>
                            Chi tiết
                        </Button>
                        {actionConfig && (
                            <Button
                                type="primary"
                                loading={statusLoadingId === record.id}
                                icon={actionConfig.icon}
                                onClick={() => handleStatusChange(record.id, actionConfig)}
                            >
                                {actionConfig.label}
                            </Button>
                        )}
                        {record.status === 'cancel_request' && (
                            <Button
                                danger
                                loading={statusLoadingId === record.id}
                                icon={<CloseOutlined />}
                                onClick={() => handleAdminCancelRequest(record.id, false).then(() => {
                                    message.success('Đã từ chối yêu cầu hủy');
                                    fetchOrders();
                                    if (selectedOrder?.id === record.id) loadOrderDetail(record.id);
                                }).catch((error) => {
                                    message.error(error?.response?.data?.message || 'Không xử lý được yêu cầu hủy');
                                })}
                            >
                                Từ chối hủy
                            </Button>
                        )}
                    </Space>
                );
            }
        }
    ]), [selectedOrder, statusLoadingId]);

    const totalRevenue = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)', padding: 24 }}>
            <Card style={{ borderRadius: 24, marginBottom: 24, boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' }}>
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Title level={2} style={{ marginBottom: 4 }}>Quản lý đơn hàng</Title>
                        <Text type="secondary">Theo dõi lịch sử mua hàng, trạng thái giao nhận và yêu cầu hủy của khách.</Text>
                    </Col>
                    <Col>
                        <Space>
                            <Card size="small" style={{ borderRadius: 16 }}>
                                <Text type="secondary">Tổng đơn</Text>
                                <Title level={4} style={{ margin: 0 }}>{orders.length}</Title>
                            </Card>
                            <Card size="small" style={{ borderRadius: 16 }}>
                                <Text type="secondary">Doanh thu đã giao</Text>
                                <Title level={4} style={{ margin: 0 }}>{formatPrice(totalRevenue)}</Title>
                            </Card>
                            <Button icon={<ReloadOutlined />} onClick={fetchOrders} loading={loading}>
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Card style={{ borderRadius: 24, boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' }}>
                <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={orders}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={selectedOrder ? `Chi tiết đơn #${String(selectedOrder.id).padStart(6, '0')}` : 'Chi tiết đơn hàng'}
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={960}
                destroyOnClose
            >
                {detailLoading || !selectedOrder ? (
                    <div style={{ textAlign: 'center', padding: 48 }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                    </div>
                ) : (
                    <Space direction="vertical" size={24} style={{ width: '100%' }}>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Khách hàng">{`${selectedOrder.user?.firstName || ''} ${selectedOrder.user?.lastName || ''}`.trim() || selectedOrder.user?.email || '---'}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selectedOrder.user?.email || '---'}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{selectedOrder.phoneNumber || selectedOrder.user?.phoneNumber || '---'}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={(STATUS_META[selectedOrder.status] || { color: 'default' }).color}>
                                    {(STATUS_META[selectedOrder.status] || { text: selectedOrder.status }).text}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>{selectedOrder.shippingAddress || '---'}</Descriptions.Item>
                            <Descriptions.Item label="Ghi chú" span={2}>{selectedOrder.note || '---'}</Descriptions.Item>
                            <Descriptions.Item label="Phương thức thanh toán">{PAYMENT_META[selectedOrder.payment?.method] || selectedOrder.payment?.method || '---'}</Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">{formatPrice(selectedOrder.totalPrice)}</Descriptions.Item>
                        </Descriptions>

                        <div>
                            <Title level={5}>Sản phẩm trong đơn</Title>
                            <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                {(selectedOrder.items || []).map(item => (
                                    <Card key={item.id} size="small" style={{ borderRadius: 16 }}>
                                        <Row gutter={16} align="middle">
                                            <Col>
                                                <img
                                                    src={getImageUrl(item.product?.thumbnail || '') || 'https://via.placeholder.com/72?text=Product'}
                                                    alt={item.product?.name || 'Sản phẩm'}
                                                    style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 12, background: '#f8fafc' }}
                                                />
                                            </Col>
                                            <Col flex="auto">
                                                <Text strong>{item.product?.name || 'Sản phẩm'}</Text>
                                                <div>
                                                    <Text type="secondary">Số lượng: {item.quantity}</Text>
                                                </div>
                                            </Col>
                                            <Col>
                                                <Text strong>{formatPrice(item.price * item.quantity)}</Text>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                            </Space>
                        </div>

                        <div>
                            <Title level={5}>Lịch sử trạng thái</Title>
                            <Timeline
                                items={(selectedOrder.statusHistory || []).map(history => {
                                    const meta = STATUS_META[history.status] || { text: history.status, color: 'default' };
                                    const changedBy = history.changedByUser
                                        ? `${history.changedByUser.firstName || ''} ${history.changedByUser.lastName || ''}`.trim() || history.changedByUser.email
                                        : 'Hệ thống';

                                    return {
                                        color: meta.color,
                                        children: (
                                            <div>
                                                <Text strong>{meta.text}</Text>
                                                <div><Text type="secondary">{history.note || '---'}</Text></div>
                                                <div><Text type="secondary">Bởi: {changedBy}</Text></div>
                                                <div><Text type="secondary">{formatDateTime(history.createdAt)}</Text></div>
                                            </div>
                                        )
                                    };
                                })}
                            />
                        </div>
                    </Space>
                )}
            </Modal>
        </div>
    );
};

export default AdminOrdersPage;
