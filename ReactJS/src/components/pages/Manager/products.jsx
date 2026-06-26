import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Switch, Space, Popconfirm, Tag, Card, Row, Col, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ManagerLayout from './ManagerLayout.jsx';
import { getProductsApi, deleteProductApi, toggleProductActiveApi, getBrandsApi, getCategoriesApi } from '../../util/api/manager.api';

const { Title, Text } = Typography;
const { Option } = Select;

const Products = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // Table/Filter state
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(undefined);
    const [selectedBrand, setSelectedBrand] = useState(undefined);
    const [selectedStatus, setSelectedStatus] = useState(undefined);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchMetadata();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [search, selectedCategory, selectedBrand, selectedStatus, page, pageSize]);

    const fetchMetadata = async () => {
        try {
            const [brandsRes, categoriesRes] = await Promise.all([
                getBrandsApi(),
                getCategoriesApi()
            ]);
            if (brandsRes.success) setBrands(brandsRes.data);
            if (categoriesRes.success) setCategories(categoriesRes.data);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu cấu hình", err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                search: search || undefined,
                category: selectedCategory || undefined,
                brandId: selectedBrand || undefined,
                isActive: selectedStatus === 'active' ? 'true' : (selectedStatus === 'hidden' ? 'false' : undefined),
                page,
                limit: pageSize
            };
            const res = await getProductsApi(params);
            if (res.success) {
                setProducts(res.data.products);
                setTotal(res.data.total);
            }
        } catch (err) {
            message.error(err.response?.data?.message || 'Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            const res = await toggleProductActiveApi(id);
            if (res.success) {
                message.success('Thay đổi trạng thái sản phẩm thành công');
                fetchProducts();
            }
        } catch (err) {
            message.error('Không thể thay đổi trạng thái sản phẩm');
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            const res = await deleteProductApi(id);
            if (res.success) {
                message.success('Xóa sản phẩm thành công');
                fetchProducts();
            }
        } catch (err) {
            message.error(err.response?.data?.message || 'Không thể xóa sản phẩm này');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'thumbnail',
            key: 'thumbnail',
            width: 80,
            render: (thumbnail) => (
                <img 
                    src={thumbnail ? `${import.meta.env.VITE_BACKEND_URL}${thumbnail}` : 'https://placehold.co/60'} 
                    alt="product" 
                    style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }}
                />
            )
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name, record) => (
                <div>
                    <Text strong style={{ display: 'block' }}>{name}</Text>
                    {record.ram && <Tag color="blue">RAM: {record.ram} GB</Tag>}
                </div>
            )
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (cat) => <Tag color="orange">{cat || 'Khác'}</Tag>
        },
        {
            title: 'Thương hiệu',
            dataIndex: ['brand', 'name'],
            key: 'brand',
            render: (brandName) => <Text>{brandName || 'N/A'}</Text>
        },
        {
            title: 'Giá bán',
            dataIndex: 'price',
            key: 'price',
            sorter: (a, b) => a.price - b.price,
            render: (price) => <Text strong>{formatCurrency(Number(price))}</Text>
        },
        {
            title: 'Kho hàng',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock) => (
                <Text style={{ color: stock < 5 ? '#ef4444' : '#111', fontWeight: stock < 5 ? 600 : 400 }}>
                    {stock} cái
                </Text>
            )
        },
        {
            title: 'Đã bán',
            dataIndex: 'sold',
            key: 'sold',
            render: (sold) => <Text>{sold} cái</Text>
        },
        {
            title: 'Hiển thị',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive, record) => (
                <Switch 
                    checked={isActive} 
                    onChange={() => handleToggleActive(record.id)}
                    checkedChildren="Hiện"
                    unCheckedChildren="Ẩn"
                />
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="primary" 
                        ghost 
                        icon={<EditOutlined />} 
                        onClick={() => navigate(`/manager/products/edit/${record.id}`)}
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa sản phẩm này?"
                        onConfirm={() => handleDeleteProduct(record.id)}
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
        <ManagerLayout activeKey="products">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Danh sách sản phẩm</Title>
                    <Text type="secondary">Quản lý kho hàng, giá cả và trạng thái hiển thị của thiết bị điện tử.</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    size="large"
                    onClick={() => navigate('/manager/products/new')}
                    style={{ borderRadius: 8 }}
                >
                    Thêm sản phẩm mới
                </Button>
            </div>

            {/* Filters panel */}
            <Card bordered={false} style={{ borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={8}>
                        <Input 
                            placeholder="Tìm kiếm sản phẩm theo tên..." 
                            prefix={<SearchOutlined />} 
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={8} md={5}>
                        <Select 
                            placeholder="Chọn danh mục" 
                            style={{ width: '100%' }}
                            value={selectedCategory}
                            onChange={(val) => {
                                setSelectedCategory(val);
                                setPage(1);
                            }}
                            allowClear
                        >
                            {categories.map(cat => (
                                <Option key={cat} value={cat}>{cat}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={5}>
                        <Select 
                            placeholder="Chọn hãng sản xuất" 
                            style={{ width: '100%' }}
                            value={selectedBrand}
                            onChange={(val) => {
                                setSelectedBrand(val);
                                setPage(1);
                            }}
                            allowClear
                        >
                            {brands.map(brand => (
                                <Option key={brand.id} value={brand.id}>{brand.name}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <Select 
                            placeholder="Chọn trạng thái" 
                            style={{ width: '100%' }}
                            value={selectedStatus}
                            onChange={(val) => {
                                setSelectedStatus(val);
                                setPage(1);
                            }}
                            allowClear
                        >
                            <Option value="active">Đang hiển thị</Option>
                            <Option value="hidden">Đang ẩn</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            {/* Products Table */}
            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                <Table 
                    columns={columns} 
                    dataSource={products} 
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
                        pageSizeOptions: ['10', '20', '50'],
                        showTotal: (total) => `Tổng cộng ${total} sản phẩm`
                    }}
                />
            </Card>
        </ManagerLayout>
    );
};

export default Products;
