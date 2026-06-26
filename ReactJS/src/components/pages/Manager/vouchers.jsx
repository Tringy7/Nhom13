import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Select, Space, Popconfirm, Card, Typography, message, Tag, DatePicker, Form, InputNumber, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ManagerLayout from './ManagerLayout.jsx';
import { getVouchersApi, createVoucherApi, updateVoucherApi, deleteVoucherApi } from '../../util/api/manager.api';

const { Title, Text } = Typography;
const { Option } = Select;

const Vouchers = () => {
    const [loading, setLoading] = useState(false);
    const [vouchers, setVouchers] = useState([]);
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const res = await getVouchersApi();
            if (res.success) setVouchers(res.data);
        } catch (err) {
            message.error("Lỗi khi tải danh sách voucher");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (voucher = null) => {
        setEditingVoucher(voucher);
        if (voucher) {
            form.setFieldsValue({
                code: voucher.code,
                discountType: voucher.discountType,
                discountValue: voucher.discountValue,
                minOrderValue: voucher.minOrderValue,
                quantity: voucher.quantity,
                dates: [dayjs(voucher.startDate), dayjs(voucher.endDate)],
                status: voucher.status
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                discountType: 'PERCENT',
                status: 'ACTIVE',
                minOrderValue: 0,
                quantity: 100
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveVoucher = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const payload = {
                code: values.code.toUpperCase(),
                discountType: values.discountType,
                discountValue: values.discountValue,
                minOrderValue: values.minOrderValue,
                quantity: values.quantity,
                startDate: values.dates[0].toISOString(),
                endDate: values.dates[1].toISOString(),
                status: values.status
            };

            let res;
            if (editingVoucher) {
                res = await updateVoucherApi(editingVoucher.id, payload);
            } else {
                res = await createVoucherApi(payload);
            }

            if (res.success) {
                message.success(editingVoucher ? "Cập nhật voucher thành công" : "Tạo voucher mới thành công");
                setIsModalOpen(false);
                fetchVouchers();
            }
        } catch (err) {
            console.error(err);
            message.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteVoucher = async (id) => {
        try {
            const res = await deleteVoucherApi(id);
            if (res.success) {
                message.success("Xóa voucher thành công");
                fetchVouchers();
            }
        } catch (err) {
            message.error("Không thể xóa voucher");
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const columns = [
        {
            title: 'Mã Code',
            dataIndex: 'code',
            key: 'code',
            render: (code) => <Tag color="blue" style={{ fontSize: '13px', fontWeight: 600 }}>{code}</Tag>
        },
        {
            title: 'Loại giảm giá',
            dataIndex: 'discountType',
            key: 'discountType',
            render: (type) => type === 'PERCENT' ? <Text>Phần trăm (%)</Text> : <Text>Số tiền cố định (đ)</Text>
        },
        {
            title: 'Mức giảm',
            dataIndex: 'discountValue',
            key: 'discountValue',
            render: (val, record) => record.discountType === 'PERCENT' ? <Text strong>{val}%</Text> : <Text strong>{formatCurrency(val)}</Text>
        },
        {
            title: 'Đơn hàng tối thiểu',
            dataIndex: 'minOrderValue',
            key: 'minOrderValue',
            render: (val) => <Text>{formatCurrency(val)}</Text>
        },
        {
            title: 'Số lượng còn',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (val) => <Text>{val} lượt</Text>
        },
        {
            title: 'Thời hạn',
            key: 'dateRange',
            render: (_, record) => (
                <div style={{ fontSize: '12px' }}>
                    <Text type="secondary" style={{ display: 'block' }}>Từ: {new Date(record.startDate).toLocaleDateString('vi-VN')}</Text>
                    <Text type="secondary" style={{ display: 'block' }}>Đến: {new Date(record.endDate).toLocaleDateString('vi-VN')}</Text>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = { 'ACTIVE': 'green', 'INACTIVE': 'red', 'EXPIRED': 'default' };
                return <Tag color={colors[status] || 'blue'}>{status}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="primary" 
                        ghost 
                        icon={<EditOutlined />} 
                        onClick={() => handleOpenModal(record)}
                    />
                    <Popconfirm
                        title="Bạn có chắc muốn xóa voucher này?"
                        onConfirm={() => handleDeleteVoucher(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                            danger 
                            icon={<DeleteOutlined />} 
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <ManagerLayout activeKey="vouchers">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Khuyến mãi & Voucher</Title>
                    <Text type="secondary">Cấu hình mã giảm giá áp dụng khi khách thanh toán đơn hàng.</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    size="large"
                    onClick={() => handleOpenModal()}
                    style={{ borderRadius: 8 }}
                >
                    Tạo voucher mới
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                <Table 
                    columns={columns} 
                    dataSource={vouchers} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Create/Edit Voucher Modal */}
            <Modal
                title={editingVoucher ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
                open={isModalOpen}
                onOk={handleSaveVoucher}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={saving}
                okText="Lưu lại"
                cancelText="Hủy"
                destroyOnClose
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 24 }}
                    requiredMark="optional"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Mã Voucher (Code)"
                                name="code"
                                rules={[
                                    { required: true, message: 'Nhập mã code' },
                                    { pattern: /^[A-Za-z0-9]+$/, message: 'Mã chỉ được chứa chữ cái và chữ số' }
                                ]}
                            >
                                <Input placeholder="Ví dụ: SALE20K, UTESHOP10" style={{ textTransform: 'uppercase' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Trạng thái hoạt động"
                                name="status"
                            >
                                <Select>
                                    <Option value="ACTIVE">Kích hoạt</Option>
                                    <Option value="INACTIVE">Vô hiệu hóa</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Loại giảm giá"
                                name="discountType"
                            >
                                <Select>
                                    <Option value="PERCENT">Giảm theo Phần trăm (%)</Option>
                                    <Option value="FIXED">Giảm theo Số tiền (VND)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Mức giảm giá"
                                name="discountValue"
                                rules={[{ required: true, message: 'Nhập giá trị giảm' }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={1} placeholder="Ví dụ: 10 (%) hoặc 50000 (đ)" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Giá trị đơn hàng tối thiểu"
                                name="minOrderValue"
                            >
                                <InputNumber style={{ width: '100%' }} min={0} placeholder="Ví dụ: 150000" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Số lượng phát hành"
                                name="quantity"
                                rules={[{ required: true, message: 'Nhập số lượng phát hành' }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={1} placeholder="Ví dụ: 50" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Thời hạn sử dụng Voucher"
                        name="dates"
                        rules={[{ required: true, message: 'Chọn thời hạn sử dụng' }]}
                    >
                        <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                </Form>
            </Modal>
        </ManagerLayout>
    );
};

export default Vouchers;
