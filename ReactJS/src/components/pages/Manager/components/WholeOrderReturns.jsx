import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Typography, message, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getReturnRequestsApi, processReturnRequestApi } from '../../../util/api/manager.api';

const { Text } = Typography;

const WholeOrderReturns = () => {
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
            const res = await getReturnRequestsApi();
            if (res.success) setRequests(res.data);
        } catch (err) {
            message.error("Lỗi khi tải danh sách yêu cầu trả cả đơn");
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
            return message.warning("Vui lòng nhập lý do xử lý!");
        }
        setSubmitting(true);
        try {
            await processReturnRequestApi(selectedRequest.id, actionType, adminNotes);
            message.success("Đã xử lý yêu cầu thành công");
            setIsModalOpen(false);
            fetchRequests();
        } catch (err) {
            message.error(err.response?.data?.message || "Xử lý yêu cầu thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { title: 'Mã Đơn', dataIndex: ['order', 'id'], key: 'orderId', render: (id) => `#${id}` },
        { title: 'Khách hàng', dataIndex: ['user', 'fullName'], key: 'customer' },
        { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color={{'PENDING': 'orange', 'APPROVED': 'green', 'REJECTED': 'red'}[status]}>{status}</Tag> },
        { title: 'Ghi chú', dataIndex: 'adminNotes', key: 'adminNotes' },
        { title: 'Thao tác', key: 'actions', render: (_, record) => record.status === 'PENDING' && (
            <Space>
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleOpenModal(record, 'APPROVED')}>Duyệt</Button>
                <Button danger icon={<CloseCircleOutlined />} onClick={() => handleOpenModal(record, 'REJECTED')}>Từ chối</Button>
            </Space>
        )}
    ];

    return (
        <>
            <Table columns={columns} dataSource={requests} rowKey="id" loading={loading} />
            <Modal
                title={`${actionType === 'APPROVED' ? 'Chấp nhận' : 'Từ chối'} yêu cầu trả hàng`}
                open={isModalOpen}
                onOk={handleProcessRequest}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={submitting}
            >
                <p>Bạn có chắc muốn {actionType.toLowerCase()} yêu cầu cho đơn hàng #{selectedRequest?.order?.id}?</p>
                <Input.TextArea rows={3} placeholder="Nhập lý do..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
            </Modal>
        </>
    );
};

export default WholeOrderReturns;