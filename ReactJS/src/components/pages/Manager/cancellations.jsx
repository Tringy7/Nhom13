import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Card, Typography, message, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import ManagerLayout from './ManagerLayout.jsx';
import { getCancellationRequestsApi, processCancellationRequestApi } from '../../util/api/manager.api';

const { Title, Text } = Typography;

const Cancellations = () => {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    
    // Process Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionType, setActionType] = useState('APPROVED'); // APPROVED or REJECTED
    const [adminNotes, setAdminNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getCancellationRequestsApi();
            if (res.success) setRequests(res.data);
        } catch (err) {
            message.error("Lỗi khi tải danh sách yêu cầu hủy đơn");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (request, type) => {
        setSelectedRequest(request);
        setActionType(type);
        setAdminNotes('');
        setIsModalOpen(true);
    };

    const handleProcessRequest = async () => {
        if (!adminNotes.trim() && actionType === 'REJECTED') {
            return message.warning("Vui lòng nhập lý do từ chối hủy đơn!");
        }

        setSubmitting(true);
        try {
            const res = await processCancellationRequestApi(selectedRequest.id, actionType, adminNotes);
            if (res.success) {
                message.success(actionType === 'APPROVED' ? "Đã chấp nhận hủy đơn hàng" : "Đã từ chối hủy đơn hàng");
                setIsModalOpen(false);
                fetchRequests();
            }
        } catch (err) {
            message.error(err.response?.data?.message || "Không thể xử lý yêu cầu hủy đơn");
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: ['order', 'id'],
            key: 'orderId',
            render: (orderId) => <Text strong style={{ color: '#2563eb' }}>#{orderId}</Text>
        },
        {
            title: 'Khách hàng',
            dataIndex: ['user', 'fullName'],
            key: 'customer',
            render: (name, record) => (
                <div>
                    <Text strong style={{ display: 'block' }}>{name}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>{record.user?.email}</Text>
                </div>
            )
        },
        {
            title: 'Giá trị đơn',
            dataIndex: ['order', 'totalAmount'],
            key: 'totalAmount',
            render: (total) => <Text strong>{formatCurrency(Number(total || 0))}</Text>
        },
        {
            title: 'Lý do hủy đơn',
            dataIndex: 'reason',
            key: 'reason',
            render: (reason) => <Text style={{ fontStyle: 'italic', color: '#4b5563' }}>"{reason}"</Text>
        },
        {
            title: 'Trạng thái yêu cầu',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = { 'PENDING': 'orange', 'APPROVED': 'green', 'REJECTED': 'red' };
                const text = { 'PENDING': 'Chờ duyệt', 'APPROVED': 'Đã đồng ý hủy', 'REJECTED': 'Từ chối hủy' };
                return <Tag color={colors[status] || 'blue'}>{text[status] || status}</Tag>;
            }
        },
        {
            title: 'Ghi chú quản lý',
            dataIndex: 'adminNotes',
            key: 'adminNotes',
            render: (notes) => <Text type="secondary">{notes || '---'}</Text>
        },
        {
            title: 'Thời gian yêu cầu',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => <Text style={{ fontSize: '12px' }}>{new Date(date).toLocaleString('vi-VN')}</Text>
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 240,
            render: (_, record) => (
                record.status === 'PENDING' ? (
                    <Space size="small">
                        <Button 
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleOpenModal(record, 'APPROVED')}
                            style={{ background: '#16a34a', borderColor: '#16a34a' }}
                        >
                            Chấp nhận
                        </Button>
                        <Button 
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleOpenModal(record, 'REJECTED')}
                        >
                            Từ chối
                        </Button>
                    </Space>
                ) : (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        Đã xử lý lúc {record.processedAt ? new Date(record.processedAt).toLocaleDateString('vi-VN') : ''}
                    </Text>
                )
            )
        }
    ];

    return (
        <ManagerLayout activeKey="cancellations">
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Yêu cầu hủy đơn hàng</Title>
                <Text type="secondary">Xử lý phê duyệt hoặc từ chối các yêu cầu xin hủy đơn của khách hàng.</Text>
            </div>

            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                <Table 
                    columns={columns} 
                    dataSource={requests} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Process Request Modal */}
            <Modal
                title={
                    <Space>
                        <WarningOutlined style={{ color: actionType === 'APPROVED' ? '#16a34a' : '#ef4444' }} />
                        <span>{actionType === 'APPROVED' ? "Xác nhận đồng ý hủy đơn hàng" : "Xác nhận từ chối hủy đơn hàng"}</span>
                    </Space>
                }
                open={isModalOpen}
                onOk={handleProcessRequest}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={submitting}
                okText="Xác nhận"
                cancelText="Hủy"
                destroyOnClose
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                    <Text>
                        Bạn đang {actionType === 'APPROVED' ? "ĐỒNG Ý HỦY" : "TỪ CHỐI HỦY"} đơn hàng 
                        <Text strong style={{ color: '#2563eb' }}> #{selectedRequest?.order?.id}</Text> của khách hàng 
                        <Text strong> {selectedRequest?.user?.fullName}</Text>.
                    </Text>
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>
                            Ghi chú của quản lý {actionType === 'REJECTED' && <Text type="danger">*</Text>}
                        </Text>
                        <Input.TextArea 
                            rows={3} 
                            placeholder={actionType === 'APPROVED' ? "Nhập ghi chú hoặc lý do đồng ý hủy..." : "Bắt buộc nhập lý do từ chối hủy đơn..."}
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </ManagerLayout>
    );
};

export default Cancellations;
