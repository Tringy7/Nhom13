import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Select, Space, Popconfirm, Card, Typography, message, Tag, DatePicker, Form, InputNumber, Row, Col, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PercentageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ManagerLayout from './ManagerLayout.jsx';
import { getPromotionsApi, createPromotionApi, updatePromotionApi, deletePromotionApi, getProductsApi } from '../../util/api/manager.api';

const { Title, Text } = Typography;
const { Option } = Select;

const Promotions = () => {
    const [loading, setLoading] = useState(false);
    const [promotions, setPromotions] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPromotions();
        fetchProducts();
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await getPromotionsApi();
            if (res.success) setPromotions(res.data);
        } catch (err) {
            message.error("Lỗi khi tải danh sách chiến dịch khuyến mãi");
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await getProductsApi({ limit: 1000, isActive: 'true' });
            if (res.success) setAllProducts(res.data.products);
        } catch (err) {
            console.error("Lỗi tải danh sách sản phẩm", err);
        }
    };

    const handleOpenModal = (promotion = null) => {
        setEditingPromotion(promotion);
        if (promotion) {
            form.setFieldsValue({
                name: promotion.name,
                description: promotion.description,
                discountRate: promotion.discountRate,
                dates: [dayjs(promotion.startDate), dayjs(promotion.endDate)],
                productIds: promotion.products?.map(p => p.id) || [],
                isActive: promotion.isActive
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                isActive: true,
                discountRate: 10,
                productIds: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSavePromotion = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const payload = {
                name: values.name,
                description: values.description,
                discountRate: values.discountRate,
                startDate: values.dates[0].toISOString(),
                endDate: values.dates[1].toISOString(),
                isActive: values.isActive,
                productIds: values.productIds
            };

            let res;
            if (editingPromotion) {
                res = await updatePromotionApi(editingPromotion.id, payload);
            } else {
                res = await createPromotionApi(payload);
            }

            if (res.success) {
                message.success(editingPromotion ? "Cập nhật khuyến mãi thành công" : "Tạo chương trình khuyến mãi thành công");
                setIsModalOpen(false);
                fetchPromotions();
            }
        } catch (err) {
            console.error(err);
            message.error("Vui lòng nhập đầy đủ các thông tin bắt buộc");
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePromotion = async (id) => {
        try {
            const res = await deletePromotionApi(id);
            if (res.success) {
                message.success("Xóa chương trình khuyến mãi thành công");
                fetchPromotions();
            }
        } catch (err) {
            message.error("Không thể xóa chiến dịch khuyến mãi");
        }
    };

    const columns = [
        {
            title: 'Chiến dịch',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <div>
                    <Text strong style={{ display: 'block' }}>{name}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.description || 'Không có mô tả'}</Text>
                </div>
            )
        },
        {
            title: 'Mức giảm giá',
            dataIndex: 'discountRate',
            key: 'discountRate',
            render: (rate) => <Tag color="red" style={{ fontSize: '13px', fontWeight: 600 }}>Giảm {rate}%</Tag>
        },
        {
            title: 'Sản phẩm áp dụng',
            dataIndex: 'products',
            key: 'products',
            render: (productsList) => (
                <div style={{ maxWidth: 220, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(productsList || []).map(p => (
                        <Tag key={p.id} color="blue">{p.name.slice(0, 18)}...</Tag>
                    ))}
                    {(productsList || []).length === 0 && <Text type="secondary" style={{ fontSize: '12px' }}>Chưa chọn sản phẩm</Text>}
                </div>
            )
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
            title: 'Kích hoạt',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Bật' : 'Tắt'}</Tag>
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
                        title="Bạn có chắc chắn muốn xóa khuyến mãi này?"
                        onConfirm={() => handleDeletePromotion(record.id)}
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
        <ManagerLayout activeKey="promotions">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Quản lý Chiến dịch giảm giá</Title>
                    <Text type="secondary">Cài đặt giảm giá trực tiếp theo phần trăm (%) trên từng sản phẩm cụ thể.</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    size="large"
                    onClick={() => handleOpenModal()}
                    style={{ borderRadius: 8 }}
                >
                    Tạo khuyến mãi mới
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                <Table 
                    columns={columns} 
                    dataSource={promotions} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Create/Edit Promotion Modal */}
            <Modal
                title={editingPromotion ? "Chỉnh sửa chiến dịch giảm giá" : "Tạo chiến dịch giảm giá mới"}
                open={isModalOpen}
                onOk={handleSavePromotion}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={saving}
                okText="Lưu lại"
                cancelText="Hủy"
                destroyOnClose
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 24 }}
                    requiredMark="optional"
                >
                    <Form.Item
                        label="Tên chiến dịch"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng điền tên chiến dịch' }]}
                    >
                        <Input placeholder="Ví dụ: Giảm giá hè cực sốc, Black Friday..." />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả chiến dịch"
                        name="description"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả thêm về lý do giảm giá..." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Phần trăm giảm giá (%)"
                                name="discountRate"
                                rules={[{ required: true, message: 'Nhập tỷ lệ giảm giá' }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={1} max={100} placeholder="Ví dụ: 10, 15, 20" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Trạng thái kích hoạt"
                                name="isActive"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Thời hạn áp dụng chương trình"
                        name="dates"
                        rules={[{ required: true, message: 'Chọn thời hạn chạy chương trình' }]}
                    >
                        <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item
                        label="Chọn sản phẩm tham gia giảm giá"
                        name="productIds"
                    >
                        <Select 
                            mode="multiple" 
                            style={{ width: '100%' }} 
                            placeholder="Tìm và thêm sản phẩm..."
                            optionFilterProp="children"
                            allowClear
                        >
                            {allProducts.map(p => (
                                <Option key={p.id} value={p.id}>
                                    {p.name} ({new Intl.NumberFormat('vi-VN').format(p.price)}đ)
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </ManagerLayout>
    );
};

export default Promotions;
