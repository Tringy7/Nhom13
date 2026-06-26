import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Switch, Button, Card, Typography, Upload, Space, message, Row, Col } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import ManagerLayout from './ManagerLayout.jsx';
import { getProductDetailApi, createProductApi, updateProductApi, getBrandsApi, getCategoriesApi } from '../../util/api/manager.api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProductEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [replaceImages, setReplaceImages] = useState(false);

    useEffect(() => {
        fetchMetadata();
        if (isEditMode) {
            fetchProductDetail();
        } else {
            form.setFieldsValue({ isActive: true });
        }
    }, [id]);

    const fetchMetadata = async () => {
        try {
            const [brandsRes, categoriesRes] = await Promise.all([
                getBrandsApi(),
                getCategoriesApi()
            ]);
            if (brandsRes.success) setBrands(brandsRes.data);
            if (categoriesRes.success) setCategories(categoriesRes.data);
        } catch (err) {
            console.error("Lỗi khi tải metadata", err);
        }
    };

    const fetchProductDetail = async () => {
        setLoading(true);
        try {
            const res = await getProductDetailApi(id);
            if (res.success) {
                const product = res.data;
                form.setFieldsValue({
                    name: product.name,
                    price: Number(product.price),
                    description: product.description,
                    stock: product.stock,
                    ram: product.ram,
                    category: product.category,
                    brandId: product.brandId,
                    isActive: product.isActive
                });
                setExistingImages(product.images || []);
            }
        } catch (err) {
            message.error("Không thể tải thông tin sản phẩm");
            navigate('/manager/products');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        setSaving(true);
        try {
            const formData = new FormData();
            
            // Append standard fields
            Object.keys(values).forEach(key => {
                if (values[key] !== undefined && values[key] !== null) {
                    formData.append(key, values[key]);
                }
            });

            // Append replace flag
            if (isEditMode) {
                formData.append('deleteExistingImages', replaceImages);
            }

            // Append files
            fileList.forEach(file => {
                formData.append('images', file.originFileObj);
            });

            let res;
            if (isEditMode) {
                res = await updateProductApi(id, formData);
            } else {
                res = await createProductApi(formData);
            }

            if (res.success) {
                message.success(isEditMode ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm mới thành công!');
                navigate('/manager/products');
            }
        } catch (err) {
            message.error(err.response?.data?.message || 'Lỗi xảy ra khi lưu sản phẩm');
        } finally {
            setSaving(false);
        }
    };

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Chỉ chấp nhận file định dạng hình ảnh!');
                return Upload.LIST_IGNORE;
            }
            setFileList((prev) => [...prev, file]);
            return false; // Prevent auto upload
        },
        fileList: fileList,
        multiple: true
    };

    return (
        <ManagerLayout activeKey="products">
            <div style={{ marginBottom: 24 }}>
                <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate('/manager/products')}
                    style={{ padding: 0, marginBottom: 12 }}
                >
                    Quay lại danh sách
                </Button>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
                    {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </Title>
                <Text type="secondary">Cập nhật đầy đủ thông tin thiết bị điện tử để khách hàng mua hàng dễ dàng.</Text>
            </div>

            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }} loading={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark="optional"
                >
                    <Row gutter={24}>
                        <Col xs={24} lg={16}>
                            <Form.Item
                                label="Tên sản phẩm"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                            >
                                <Input placeholder="Ví dụ: Laptop Apple MacBook Air M2 2022" size="large" />
                            </Form.Item>

                            <Form.Item
                                label="Mô tả sản phẩm"
                                name="description"
                            >
                                <TextArea rows={6} placeholder="Nhập cấu hình chi tiết, chính sách khuyến mãi hoặc thông tin đi kèm..." />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Giá bán lẻ (VND)"
                                        name="price"
                                        rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                                    >
                                        <InputNumber 
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                            style={{ width: '100%' }} 
                                            min={0} 
                                            size="large" 
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Số lượng tồn kho"
                                        name="stock"
                                        rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn' }]}
                                    >
                                        <InputNumber style={{ width: '100%' }} min={0} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>

                        <Col xs={24} lg={8}>
                            <Form.Item
                                label="Thương hiệu (Hãng)"
                                name="brandId"
                                rules={[{ required: true, message: 'Vui lòng chọn hãng sản xuất' }]}
                            >
                                <Select placeholder="Chọn thương hiệu" size="large">
                                    {brands.map(brand => (
                                        <Option key={brand.id} value={brand.id}>{brand.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Danh mục sản phẩm"
                                name="category"
                                rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập danh mục mới' }]}
                            >
                                <Select 
                                    placeholder="Chọn hoặc tự nhập danh mục" 
                                    size="large"
                                    mode="combobox"
                                >
                                    {categories.map(cat => (
                                        <Option key={cat} value={cat}>{cat}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Bộ nhớ RAM (GB)"
                                name="ram"
                            >
                                <InputNumber placeholder="Ví dụ: 8, 16, 32" style={{ width: '100%' }} min={1} size="large" />
                            </Form.Item>

                            <Form.Item
                                label="Hiển thị sản phẩm trên web"
                                name="isActive"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
                            </Form.Item>

                            <Form.Item label="Hình ảnh sản phẩm">
                                <Upload.Dragger {...uploadProps} style={{ padding: '16px 0', background: '#fafafa' }}>
                                    <p className="ant-upload-drag-icon">
                                        <UploadOutlined style={{ fontSize: 24, color: '#2563eb' }} />
                                    </p>
                                    <p className="ant-upload-text" style={{ fontSize: 13, fontWeight: 500 }}>
                                        Kéo thả hoặc nhấp để chọn ảnh
                                    </p>
                                </Upload.Dragger>

                                {isEditMode && existingImages.length > 0 && (
                                    <div style={{ marginTop: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>Ảnh hiện tại ({existingImages.length}):</Text>
                                            <Switch 
                                                size="small" 
                                                checked={replaceImages} 
                                                onChange={(val) => setReplaceImages(val)} 
                                                checkedChildren="Thay thế ảnh cũ"
                                                unCheckedChildren="Giữ ảnh cũ"
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', opacity: replaceImages ? 0.3 : 1 }}>
                                            {existingImages.map(img => (
                                                <img 
                                                    key={img.id}
                                                    src={`${import.meta.env.VITE_BACKEND_URL}${img.imageUrl}`} 
                                                    alt="current" 
                                                    style={{ width: 50, height: 50, borderRadius: 6, objectFit: 'cover', border: '1px solid #ddd' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ borderTop: '1px solid #f0f0f0', paddingTop: 24, marginTop: 24, textAlign: 'right' }}>
                        <Space size="middle">
                            <Button onClick={() => navigate('/manager/products')} size="large">Hủy</Button>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                icon={<SaveOutlined />} 
                                loading={saving}
                                size="large"
                                style={{ borderRadius: 8 }}
                            >
                                Lưu sản phẩm
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </ManagerLayout>
    );
};

export default ProductEdit;
