import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Popconfirm, Card, Row, Col, Typography, message, List, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons';
import ManagerLayout from './ManagerLayout.jsx';
import { 
    getBrandsApi, createBrandApi, updateBrandApi, deleteBrandApi, 
    getCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi 
} from '../../util/api/manager.api';

const { Title, Text } = Typography;

const Brands = () => {
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // Brand Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [brandName, setBrandName] = useState('');
    const [brandLogo, setBrandLogo] = useState('');

    // Category Modal state
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');

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

    const handleOpenCategoryModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setCategoryName(category);
        } else {
            setEditingCategory(null);
            setCategoryName('');
        }
        setIsCategoryModalOpen(true);
    };

    const handleSaveCategory = async () => {
        if (!categoryName.trim()) {
            return message.warning("Tên danh mục không được để trống!");
        }

        try {
            let res;
            if (editingCategory) {
                res = await updateCategoryApi(editingCategory, { newName: categoryName });
            } else {
                res = await createCategoryApi({ name: categoryName });
            }

            if (res.success) {
                message.success(editingCategory ? "Cập nhật danh mục thành công" : "Tạo danh mục mới thành công");
                setIsCategoryModalOpen(false);
                fetchData();
            }
        } catch (err) {
            message.error(err.response?.data?.message || "Không thể lưu danh mục");
        }
    };

    const handleDeleteCategory = async (name) => {
        try {
            const res = await deleteCategoryApi(name);
            if (res.success) {
                message.success("Xóa danh mục thành công");
                fetchData();
            }
        } catch (err) {
            message.error(err.response?.data?.message || "Không thể xóa danh mục này");
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
                        extra={
                            <Button 
                                type="primary" 
                                size="small"
                                icon={<PlusOutlined />} 
                                onClick={() => handleOpenCategoryModal()}
                                style={{ borderRadius: 6 }}
                            >
                                Thêm
                            </Button>
                        }
                        bordered={false} 
                        style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}
                        loading={loading}
                    >
                        <List
                            dataSource={categories}
                            renderItem={item => (
                                <List.Item 
                                    style={{ padding: '8px 0' }}
                                    actions={[
                                        <Button 
                                            type="text" 
                                            size="small" 
                                            icon={<EditOutlined style={{ fontSize: 12 }} />} 
                                            onClick={() => handleOpenCategoryModal(item)}
                                            key="edit"
                                        />,
                                        <Popconfirm
                                            title="Bạn có chắc chắn muốn xóa danh mục này? Tất cả các sản phẩm thuộc danh mục này sẽ chuyển về chưa phân loại."
                                            onConfirm={() => handleDeleteCategory(item)}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            okButtonProps={{ danger: true }}
                                            key="delete"
                                        >
                                            <Button 
                                                type="text" 
                                                danger 
                                                size="small" 
                                                icon={<DeleteOutlined style={{ fontSize: 12 }} />} 
                                            />
                                        </Popconfirm>
                                    ]}
                                >
                                    <Tag color="purple" style={{ fontSize: '13px', padding: '4px 12px', borderRadius: 8 }}>
                                        {item}
                                    </Tag>
                                </List.Item>
                            )}
                            locale={{ emptyText: "Chưa có danh mục nào" }}
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

            {/* Edit/Create Category Modal */}
            <Modal
                title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                open={isCategoryModalOpen}
                onOk={handleSaveCategory}
                onCancel={() => setIsCategoryModalOpen(false)}
                okText="Lưu lại"
                cancelText="Hủy"
                destroyOnClose
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>Tên danh mục</Text>
                        <Input 
                            placeholder="Ví dụ: LAPTOP GAMING, ULTRABOOK..." 
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </ManagerLayout>
    );
};

export default Brands;

