import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Popconfirm, Card, Row, Col, Typography, message, List, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons';
import ManagerLayout from './ManagerLayout.jsx';
import { getBrandsApi, createBrandApi, updateBrandApi, deleteBrandApi, getCategoriesApi } from '../../util/api/manager.api';

const { Title, Text } = Typography;

const Brands = () => {
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [brandName, setBrandName] = useState('');
    const [brandLogo, setBrandLogo] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [brandsRes, categoriesRes] = await Promise.all([
                getBrandsApi(),
                getCategoriesApi()
            ]);
            if (brandsRes.success) setBrands(brandsRes.data);
            if (categoriesRes.success) setCategories(categoriesRes.data);
        } catch (err) {
            message.error("Lỗi khi tải danh sách thương hiệu và danh mục");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (brand = null) => {
        if (brand) {
            setEditingBrand(brand);
            setBrandName(brand.name);
            setBrandLogo(brand.logo || '');
        } else {
            setEditingBrand(null);
            setBrandName('');
            setBrandLogo('');
        }
        setIsModalOpen(true);
    };

    const handleSaveBrand = async () => {
        if (!brandName.trim()) {
            return message.warning("Tên thương hiệu không được để trống!");
        }

        try {
            const payload = { name: brandName, logo: brandLogo };
            let res;
            if (editingBrand) {
                res = await updateBrandApi(editingBrand.id, payload);
            } else {
                res = await createBrandApi(payload);
            }

            if (res.success) {
                message.success(editingBrand ? "Cập nhật thương hiệu thành công" : "Tạo thương hiệu mới thành công");
                setIsModalOpen(false);
                fetchData();
            }
        } catch (err) {
            message.error("Không thể lưu thương hiệu");
        }
    };

    const handleDeleteBrand = async (id) => {
        try {
            const res = await deleteBrandApi(id);
            if (res.success) {
                message.success("Xóa thương hiệu thành công");
                fetchData();
            }
        } catch (err) {
            message.error(err.response?.data?.message || "Không thể xóa thương hiệu này");
        }
    };

    const columns = [
        {
            title: 'Logo',
            dataIndex: 'logo',
            key: 'logo',
            width: 100,
            render: (logo) => (
                <img 
                    src={logo || 'https://placehold.co/100x40?text=Brand'} 
                    alt="logo" 
                    style={{ maxHeight: 30, maxWidth: 80, objectFit: 'contain' }}
                />
            )
        },
        {
            title: 'Tên thương hiệu',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name) => <Text strong>{name}</Text>
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
                        title="Bạn có chắc chắn muốn xóa thương hiệu này?"
                        onConfirm={() => handleDeleteBrand(record.id)}
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
        <ManagerLayout activeKey="brands">
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Danh mục & Hãng sản xuất</Title>
                <Text type="secondary">Cấu hình các phân loại danh mục sản phẩm và các thương hiệu thiết bị điện tử.</Text>
            </div>

            <Row gutter={24}>
                {/* Categories view */}
                <Col xs={24} lg={8} style={{ marginBottom: 24 }}>
                    <Card 
                        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><TagsOutlined /><span>Các danh mục hiện tại</span></div>} 
                        bordered={false} 
                        style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}
                        loading={loading}
                    >
                        <List
                            dataSource={categories}
                            renderItem={item => (
                                <List.Item style={{ padding: '12px 0' }}>
                                    <Tag color="purple" style={{ fontSize: '13px', padding: '4px 12px', borderRadius: 8 }}>
                                        {item}
                                    </Tag>
                                </List.Item>
                            )}
                            locale={{ emptyText: "Chưa có danh mục nào được gán cho sản phẩm" }}
                        />
                    </Card>
                </Col>

                {/* Brands view */}
                <Col xs={24} lg={16}>
                    <Card 
                        title="Quản lý hãng sản xuất" 
                        extra={
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                onClick={() => handleOpenModal()}
                                style={{ borderRadius: 8 }}
                            >
                                Thêm hãng
                            </Button>
                        }
                        bordered={false} 
                        style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}
                    >
                        <Table 
                            columns={columns} 
                            dataSource={brands} 
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Edit/Create Brand Modal */}
            <Modal
                title={editingBrand ? "Chỉnh sửa hãng sản xuất" : "Thêm hãng sản xuất mới"}
                open={isModalOpen}
                onOk={handleSaveBrand}
                onCancel={() => setIsModalOpen(false)}
                okText="Lưu lại"
                cancelText="Hủy"
                destroyOnClose
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>Tên hãng</Text>
                        <Input 
                            placeholder="Ví dụ: Apple, Samsung, Asus..." 
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>Đường dẫn Logo hãng (URL)</Text>
                        <Input 
                            placeholder="Ví dụ: https://logo.com/apple.png" 
                            value={brandLogo}
                            onChange={(e) => setBrandLogo(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </ManagerLayout>
    );
};

export default Brands;
