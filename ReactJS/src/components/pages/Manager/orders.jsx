import React, { useState, useEffect } from 'react';
import { Table, Button, Drawer, Select, Tag, Space, Card, Row, Col, Typography, message, Modal, InputNumber, Tabs, Divider } from 'antd';
import { ShoppingOutlined, UserOutlined, CarOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import ManagerLayout from './ManagerLayout.jsx';
import { getOrdersApi, getOrderByIdApi, updateOrderStatusApi, assignShipperApi, getShippersApi } from '../../util/api/manager.api';

const { Title, Text, Title: Heading } = Typography;
const { Option } = Select;

const Orders = () => {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [shippers, setShippers] = useState([]);
    
    // Filters & Pagination
    const [activeTab, setActiveTab] = useState('ALL');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    // Detailed Drawer
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [drawerLoading, setDrawerLoading] = useState(false);

    // Shipper Assignment Modal
    const [shipperModalVisible, setShipperModalVisible] = useState(false);
    const [shipperOrderId, setShipperOrderId] = useState(null);
    const [selectedShipperId, setSelectedShipperId] = useState(undefined);
    const [shipperFee, setShipperFee] = useState(30000);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchShippers();
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [activeTab, page, pageSize]);

    const fetchShippers = async () => {
        try {
            const res = await getShippersApi();
            if (res.success) setShippers(res.data);
        } catch (err) {
            console.error("Lỗi khi tải danh sách shipper", err);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                status: activeTab === 'ALL' ? undefined : activeTab,
                page,
                limit: pageSize
            };
            const res = await getOrdersApi(params);
            if (res.success) {
                setOrders(res.data.orders);
                setTotal(res.data.total);
            }
        } catch (err) {
            message.error("Lỗi khi tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (id) => {
        setDrawerLoading(true);
        setDrawerVisible(true);
        try {
            const res = await getOrderByIdApi(id);
            if (res.success) {
                setSelectedOrder(res.data);
            }
        } catch (err) {
            message.error("Không thể tải chi tiết đơn hàng");
            setDrawerVisible(false);
        } finally {
            setDrawerLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await updateOrderStatusApi(orderId, newStatus, `Quản lý cập nhật trạng thái đơn hàng thành ${newStatus}`);
            if (res.success) {
                message.success("Cập nhật trạng thái đơn hàng thành công!");
                fetchOrders();
                if (selectedOrder && selectedOrder.id === orderId) {
                    handleViewDetail(orderId);
                }
            }
        } catch (err) {
            message.error("Không thể cập nhật trạng thái đơn hàng");
        }
    };

    const handleOpenShipperModal = (orderId) => {
        setShipperOrderId(orderId);
        setSelectedShipperId(undefined);
        setShipperFee(30000);
        setShipperModalVisible(true);
    };

    const handleAssignShipper = async () => {
        if (!selectedShipperId) {
            return message.warning("Vui lòng chọn 1 shipper!");
        }
        setAssigning(true);
        try {
            const res = await assignShipperApi(shipperOrderId, selectedShipperId, shipperFee);
            if (res.success) {
                message.success("Đã phân công giao hàng cho shipper thành công!");
                setShipperModalVisible(false);
                fetchOrders();
                if (selectedOrder && selectedOrder.id === shipperOrderId) {
                    handleViewDetail(shipperOrderId);
                }
            }
        } catch (err) {
            message.error("Lỗi khi gán giao hàng");
        } finally {
            setAssigning(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const getStatusTag = (status) => {
        const statuses = {
            'NEW': <Tag color="blue">Đơn mới</Tag>,
            'CONFIRMED': <Tag color="cyan">Đã xác nhận</Tag>,
            'PREPARING': <Tag color="gold">Đang chuẩn bị</Tag>,
            'SHIPPING': <Tag color="purple">Đang giao hàng</Tag>,
            'DELIVERED': <Tag color="green">Giao thành công</Tag>,
            'DELIVERY_FAILED': <Tag color="red">Giao thất bại</Tag>,
            'CANCELLED': <Tag color="default">Đã hủy</Tag>,
            'CANCEL_REQUEST': <Tag color="volcano">Khách yêu cầu hủy</Tag>
        };
        return statuses[status] || <Tag>{status}</Tag>;
    };

    const orderColumns = [
        {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <Text strong style={{ color: '#2563eb' }}>#{id}</Text>
        },
        {
            title: 'Khách hàng',
            dataIndex: ['customer', 'fullName'],
            key: 'customer',
            render: (name) => <Text strong>{name}</Text>
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (val) => <Text strong>{formatCurrency(Number(val))}</Text>
        },
        {
            title: 'Thời gian đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => <Text>{new Date(date).toLocaleString('vi-VN')}</Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            render: (status) => getStatusTag(status)
        },
        {
            title: 'Vận chuyển',
            key: 'shipper',
            render: (_, record) => (
                record.shipper ? (
                    <div>
                        <Text style={{ display: 'block', fontSize: '12px' }}>{record.shipper.fullName}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>Phí: {formatCurrency(record.shipperFee || 0)}</Text>
                    </div>
                ) : (
                    <Text type="secondary" style={{ fontSize: '12px' }}>Chưa giao shipper</Text>
                )
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button onClick={() => handleViewDetail(record.id)}>Chi tiết</Button>
                    {record.orderStatus === 'NEW' && (
                        <Button type="primary" onClick={() => handleUpdateStatus(record.id, 'CONFIRMED')}>Xác nhận</Button>
                    )}
                    {record.orderStatus === 'CONFIRMED' && (
                        <Button type="primary" onClick={() => handleUpdateStatus(record.id, 'PREPARING')}>Chuẩn bị</Button>
                    )}
                    {record.orderStatus === 'PREPARING' && (
                        <Button type="primary" icon={<CarOutlined />} onClick={() => handleOpenShipperModal(record.id)}>Giao hàng</Button>
                    )}
                </Space>
            )
        }
    ];

    const tabItems = [
        { key: 'ALL', label: 'Tất cả đơn' },
        { key: 'NEW', label: 'Chờ duyệt' },
        { key: 'CONFIRMED', label: 'Đã duyệt' },
        { key: 'PREPARING', label: 'Đang chuẩn bị' },
        { key: 'SHIPPING', label: 'Đang giao' },
        { key: 'DELIVERED', label: 'Giao thành công' },
        { key: 'CANCELLED', label: 'Đã hủy' }
    ];

    return (
        <ManagerLayout activeKey="orders">
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Quản lý Đơn hàng</Title>
                <Text type="secondary">Quản trị quy trình đóng gói, chuẩn bị hàng và giao shipper.</Text>
            </div>

            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                <Tabs 
                    activeKey={activeTab} 
                    onChange={(key) => {
                        setActiveTab(key);
                        setPage(1);
                    }}
                    items={tabItems}
                    style={{ marginBottom: 16 }}
                />
                
                <Table 
                    columns={orderColumns} 
                    dataSource={orders} 
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: total,
                        onChange: (p, ps) => {
                            setPage(p);
                            setPageSize(ps);
                        },
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50']
                    }}
                />
            </Card>

            {/* Order Detail Drawer */}
            <Drawer
                title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
                placement="right"
                width={700}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                loading={drawerLoading}
                destroyOnClose
            >
                {selectedOrder && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Status Summary */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text type="secondary" style={{ display: 'block' }}>Trạng thái hiện tại:</Text>
                                <div style={{ marginTop: 4 }}>{getStatusTag(selectedOrder.orderStatus)}</div>
                            </div>
                            <Space>
                                {selectedOrder.orderStatus === 'NEW' && (
                                    <>
                                        <Button danger onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}>Hủy đơn</Button>
                                        <Button type="primary" onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')}>Xác nhận đơn</Button>
                                    </>
                                )}
                                {selectedOrder.orderStatus === 'CONFIRMED' && (
                                    <Button type="primary" onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}>Chuẩn bị hàng</Button>
                                )}
                                {selectedOrder.orderStatus === 'PREPARING' && (
                                    <Button type="primary" icon={<CarOutlined />} onClick={() => handleOpenShipperModal(selectedOrder.id)}>Giao cho Shipper</Button>
                                )}
                                {selectedOrder.orderStatus === 'SHIPPING' && (
                                    <>
                                        <Button danger onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERY_FAILED')}>Giao thất bại</Button>
                                        <Button type="primary" style={{ background: '#16a34a', borderColor: '#16a34a' }} onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}>Đã giao thành công</Button>
                                    </>
                                )}
                            </Space>
                        </div>

                        <Divider style={{ margin: 0 }} />

                        {/* Customer & Address Details */}
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Card size="small" title={<Space><UserOutlined /><span>Thông tin khách hàng</span></Space>} bordered={false} style={{ background: '#f9fafb', borderRadius: 12 }}>
                                    <Text strong style={{ display: 'block' }}>{selectedOrder.customer?.fullName}</Text>
                                    <Text type="secondary" style={{ display: 'block', fontSize: '13px' }}>Email: {selectedOrder.customer?.email}</Text>
                                    <Text type="secondary" style={{ display: 'block', fontSize: '13px' }}>SĐT: {selectedOrder.customer?.phone || 'Chưa cung cấp'}</Text>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" title={<Space><CarOutlined /><span>Giao nhận & Vận chuyển</span></Space>} bordered={false} style={{ background: '#f9fafb', borderRadius: 12 }}>
                                    <Text strong style={{ display: 'block' }}>Địa chỉ nhận hàng:</Text>
                                    <Text type="secondary" style={{ display: 'block', fontSize: '13px', marginBottom: 8 }}>{selectedOrder.shippingAddress}</Text>
                                    {selectedOrder.shipper ? (
                                        <div>
                                            <Tag color="purple">Shipper: {selectedOrder.shipper.fullName}</Tag>
                                            <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>SĐT: {selectedOrder.shipper.phone}</Text>
                                        </div>
                                    ) : (
                                        <Tag color="orange">Chưa gán Shipper</Tag>
                                    )}
                                </Card>
                            </Col>
                        </Row>

                        {/* Product Detail items */}
                        <div>
                            <Heading level={5} style={{ marginBottom: 12 }}>Sản phẩm đã mua</Heading>
                            <Table 
                                columns={[
                                    {
                                        title: 'Sản phẩm',
                                        render: (_, item) => {
                                            const isCancelled = item.status === 'CANCELLED';
                                            return (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: isCancelled ? 0.55 : 1 }}>
                                                    <img 
                                                        src={item.product?.thumbnail ? `${import.meta.env.VITE_BACKEND_URL}${item.product.thumbnail}` : 'https://placehold.co/40'} 
                                                        alt="item" 
                                                        style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
                                                    />
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Text strong style={{ fontSize: '13px', textDecoration: isCancelled ? 'line-through' : 'none' }}>{item.product?.name}</Text>
                                                        {isCancelled && <Tag color="error" style={{ width: 'fit-content', marginTop: 4, fontSize: '10px', padding: '0 4px', lineHeight: '1.5' }}>Đã hủy</Tag>}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    },
                                    {
                                        title: 'Đơn giá',
                                        dataIndex: 'price',
                                        render: (price, item) => <Text style={{ textDecoration: item.status === 'CANCELLED' ? 'line-through' : 'none', opacity: item.status === 'CANCELLED' ? 0.55 : 1 }}>{formatCurrency(Number(price))}</Text>
                                    },
                                    {
                                        title: 'Số lượng',
                                        dataIndex: 'quantity',
                                        render: (q, item) => <Text style={{ textDecoration: item.status === 'CANCELLED' ? 'line-through' : 'none', opacity: item.status === 'CANCELLED' ? 0.55 : 1 }}>{q} cái</Text>
                                    },
                                    {
                                        title: 'Tổng',
                                        render: (_, item) => <Text strong style={{ textDecoration: item.status === 'CANCELLED' ? 'line-through' : 'none', opacity: item.status === 'CANCELLED' ? 0.55 : 1 }}>{formatCurrency(Number(item.price) * item.quantity)}</Text>
                                    }
                                ]}
                                dataSource={selectedOrder.details || []}
                                pagination={false}
                                rowKey="id"
                                size="small"
                                onRow={(record) => {
                                    if (record.status === 'CANCELLED') {
                                        return {
                                            style: { backgroundColor: '#fafafa', color: '#8c8c8c' }
                                        };
                                    }
                                    return {};
                                }}
                                style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}
                            />
                        </div>

                        {/* Pricing details */}
                        <div style={{ background: '#f9fafb', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Phí vận chuyển:</Text>
                                <Text strong>{formatCurrency(Number(selectedOrder.shippingFee || 0))}</Text>
                            </div>
                            {selectedOrder.voucher && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                                    <Text>Giảm giá voucher ({selectedOrder.voucher.code}):</Text>
                                    <Text strong>-{selectedOrder.voucher.discountType === 'PERCENT' ? `${selectedOrder.voucher.discountValue}%` : formatCurrency(selectedOrder.voucher.discountValue)}</Text>
                                </div>
                            )}
                            <Divider style={{ margin: '8px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Heading level={5} style={{ margin: 0 }}>Tổng thanh toán:</Heading>
                                <Heading level={4} style={{ margin: 0, color: '#ef4444' }}>{formatCurrency(Number(selectedOrder.totalAmount))}</Heading>
                            </div>
                        </div>

                        {/* Note info */}
                        {selectedOrder.note && (
                            <div style={{ borderLeft: '3px solid #2563eb', paddingLeft: 12 }}>
                                <Text strong style={{ display: 'block', fontSize: '13px' }}>Ghi chú đặt hàng:</Text>
                                <Text type="secondary" style={{ fontSize: '13px' }}>{selectedOrder.note}</Text>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>

            {/* Shipper Modal */}
            <Modal
                title="Giao đơn hàng cho Shipper vận chuyển"
                open={shipperModalVisible}
                onOk={handleAssignShipper}
                onCancel={() => setShipperModalVisible(false)}
                confirmLoading={assigning}
                okText="Xác nhận giao hàng"
                cancelText="Hủy"
                destroyOnClose
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>Chọn Shipper giao hàng</Text>
                        <Select 
                            placeholder="Danh sách shipper đang rảnh..." 
                            style={{ width: '100%' }}
                            value={selectedShipperId}
                            onChange={(val) => setSelectedShipperId(val)}
                        >
                            {shippers.map(s => (
                                <Option key={s.id} value={s.id}>{s.fullName} ({s.phone || 'Không có SĐT'})</Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>Phí giao hàng (VND)</Text>
                        <InputNumber 
                            min={0}
                            style={{ width: '100%' }}
                            value={shipperFee}
                            onChange={(val) => setShipperFee(val)}
                        />
                    </div>
                </div>
            </Modal>
        </ManagerLayout>
    );
};

export default Orders;
