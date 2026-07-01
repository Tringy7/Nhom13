import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Card, Typography, message, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, UndoOutlined } from '@ant-design/icons';
import ManagerLayout from './ManagerLayout.jsx';
import { getOrderDetailReturnRequestsApi, processOrderDetailReturnRequestApi } from '../../util/api/manager.api';

const { Title, Text } = Typography;

const Returns = () => {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionType, setActionType] = useState('APPROVED');
    const [adminNotes, setAdminNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getOrderDetailReturnRequestsApi();
            if (res.success) setRequests(res.data);
        } catch (err) {
            message.error("Lỗi khi tải danh sách yêu cầu trả hàng");
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
        if (!adminNotes.trim()) {
            return message.warning("Vui lòng nhập lý do xử lý yêu cầu!");
        }

        setSubmitting(true);
        try {
            const res = await processOrderDetailReturnRequestApi(selectedRequest.id, actionType, adminNotes);
            if (res.success) {
                message.success("Đã xử lý yêu cầu trả hàng");
                setIsModalOpen(false);
                fetchRequests();
            }
        } catch (err) {
            message.error(err.response?.data?.message || "Không thể xử lý yêu cầu");
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    const columns = [
        {
            title: 'Mã Đơn',
            dataIndex: ['orderDetail', 'order', 'id'],
            key: 'orderId',
            render: (orderId) => <Text strong style={{ color: '#2563eb' }}>#{orderId}</Text>
        },
        {
            title: 'Sản phẩm',
            dataIndex: ['orderDetail', 'productName'],
            key: 'productName',
        },
        {
            title: 'Khách hàng',
            dataIndex: ['user', 'fullName'],
            key: 'customer',
        },
        {
            title: 'Lý do trả hàng',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = { 'PENDING': 'orange', 'APPROVED': 'green', 'REJECTED': 'red' };
                const text = { 'PENDING': 'Chờ duyệt', 'APPROVED': 'Đã chấp nhận', 'REJECTED': 'Đã từ chối' };
                return <Tag color={colors[status] || 'blue'}>{text[status] || status}</Tag>;
            }
        },
        {
            title: 'Ghi chú',
            dataIndex: 'adminNotes',
            key: 'adminNotes',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                record.status === 'PENDING' ? (
                    <Space>
                        <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleOpenModal(record, 'APPROVED')}>Duyệt</Button>
                        <Button danger icon={<CloseCircleOutlined />} onClick={() => handleOpenModal(record, 'REJECTED')}>Từ chối</Button>
                    </Space>
                ) : <Text type="secondary">Đã xử lý</Text>
            )
        }
    ];

    return (
        <ManagerLayout activeKey="returns">
            <Title level={3}>Yêu cầu trả hàng</Title>
            <Card>
                <Table 
                    columns={columns} 
                    dataSource={requests} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={actionType === 'APPROVED' ? "Chấp nhận yêu cầu trả hàng" : "Từ chối yêu cầu trả hàng"}
                open={isModalOpen}
                onOk={handleProcessRequest}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={submitting}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <p>Bạn có chắc muốn {actionType === 'APPROVED' ? 'chấp nhận' : 'từ chối'} yêu cầu này?</p>
                <Input.TextArea 
                    rows={3} 
                    placeholder="Nhập lý do..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                />
            </Modal>
        </ManagerLayout>
    );
};

export default Returns;