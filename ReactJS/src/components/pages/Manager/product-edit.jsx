import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Switch, Button, Card, Typography, Upload, Space, message, Row, Col, Modal } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import ManagerLayout from './ManagerLayout.jsx';
import { getProductDetailApi, createProductApi, updateProductApi, getBrandsApi, getCategoriesApi } from '../../util/api/manager.api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const ProductEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    
    const [thumbnailFile, setThumbnailFile] = useState([]);
    const [detailFiles, setDetailFiles] = useState([]);
    
    const [existingThumbnail, setExistingThumbnail] = useState(null);
    const [existingImages, setExistingImages] = useState([]);
    const [deleteExistingImages, setDeleteExistingImages] = useState(false);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

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
                setExistingThumbnail(product.thumbnail);
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
            
            Object.keys(values).forEach(key => {
                if (values[key] !== undefined && values[key] !== null) {
                    formData.append(key, values[key]);
                }
            });

            if (isEditMode) {
                formData.append('deleteExistingImages', deleteExistingImages);
            }

            if (thumbnailFile.length > 0 && thumbnailFile[0].originFileObj) {
                formData.append('thumbnail', thumbnailFile[0].originFileObj);
            }
            
            detailFiles.forEach(file => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                }
            });

            const res = isEditMode 
                ? await updateProductApi(id, formData) 
                : await createProductApi(formData);

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

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
          file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleThumbnailChange = ({ fileList: newFileList }) => setThumbnailFile(newFileList);
    const handleDetailFilesChange = ({ fileList: newFileList }) => setDetailFiles(newFileList);

    return (
        <ManagerLayout activeKey="products">
            <div style={{ marginBottom: 24 }}>
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/manager/products')} style={{ padding: 0, marginBottom: 12 }}>
                    Quay lại danh sách
                </Button>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
                    {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </Title>
                <Text type="secondary">Cập nhật đầy đủ thông tin thiết bị điện tử để khách hàng mua hàng dễ dàng.</Text>
            </div>

            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }} loading={loading}>
                <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
                    <Row gutter={24}>
                        <Col xs={24} lg={16}>
                            {/* Main Info */}
                            <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
                                <Input placeholder="Ví dụ: Laptop Apple MacBook Air M2 2022" size="large" />
                            </Form.Item>
                            <Form.Item label="Mô tả sản phẩm" name="description">
                                <TextArea rows={6} placeholder="Nhập cấu hình chi tiết, chính sách khuyến mãi hoặc thông tin đi kèm..." />
                            </Form.Item>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Giá bán lẻ (VND)" name="price" rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}>
                                        <InputNumber formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} style={{ width: '100%' }} min={0} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Số lượng tồn kho" name="stock" rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn' }]}>
                                        <InputNumber style={{ width: '100%' }} min={0} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            
                            {/* Detail Images */}
                            <Form.Item label="Ảnh chi tiết sản phẩm">
                                <Upload
                                    listType="picture-card"
                                    fileList={detailFiles}
                                    onPreview={handlePreview}
                                    onChange={handleDetailFilesChange}
                                    multiple
                                >
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Thêm ảnh</div>
                                    </div>
                                </Upload>
                                {isEditMode && existingImages.length > 0 && (
                                    <div style={{ marginTop: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>Ảnh chi tiết hiện tại ({existingImages.length}):</Text>
                                            <Switch size="small" checked={deleteExistingImages} onChange={setDeleteExistingImages} checkedChildren="Thay thế" unCheckedChildren="Giữ lại" />
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', opacity: deleteExistingImages ? 0.3 : 1 }}>
                                            {existingImages.map(img => <img key={img.id} src={`${import.meta.env.VITE_BACKEND_URL}${img.imageUrl}`} alt="current" style={{ width: 50, height: 50, borderRadius: 6, objectFit: 'cover', border: '1px solid #ddd' }}/>)}
                                        </div>
                                    </div>
                                )}
                            </Form.Item>
                        </Col>

                        <Col xs={24} lg={8}>
                            {/* Thumbnail */}
                            <Form.Item label="Ảnh đại diện (Thumbnail)" required>
                                <Upload
                                    listType="picture-card"
                                    fileList={thumbnailFile}
                                    onPreview={handlePreview}
                                    onChange={handleThumbnailChange}
                                    maxCount={1}
                                >
                                    {thumbnailFile.length === 0 && (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                                        </div>
                                    )}
                                </Upload>
                                {isEditMode && existingThumbnail && (
                                    <div style={{ marginTop: 8 }}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Ảnh hiện tại:</Text>
                                        <img src={`${import.meta.env.VITE_BACKEND_URL}${existingThumbnail}`} alt="thumbnail" style={{ width: 102, height: 102, borderRadius: 8, objectFit: 'cover', border: '1px solid #ddd', marginTop: 4 }}/>
                                    </div>
                                )}
                            </Form.Item>

                            {/* Metadata */}
                            <Form.Item label="Thương hiệu (Hãng)" name="brandId" rules={[{ required: true, message: 'Vui lòng chọn hãng' }]}>
                                <Select placeholder="Chọn thương hiệu" size="large">
                                    {brands.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Danh mục" name="category" rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập danh mục' }]}>
                                <Select placeholder="Chọn hoặc tự nhập" size="large" mode="combobox">
                                    {categories.map(c => <Option key={c} value={c}>{c}</Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Bộ nhớ RAM (GB)" name="ram">
                                <InputNumber placeholder="Ví dụ: 8, 16, 32" style={{ width: '100%' }} min={1} size="large" />
                            </Form.Item>
                            <Form.Item label="Hiển thị sản phẩm" name="isActive" valuePropName="checked">
                                <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ borderTop: '1px solid #f0f0f0', paddingTop: 24, marginTop: 24, textAlign: 'right' }}>
                        <Space size="middle">
                            <Button onClick={() => navigate('/manager/products')} size="large">Hủy</Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving} size="large" style={{ borderRadius: 8 }}>
                                Lưu sản phẩm
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </ManagerLayout>
    );
};

export default ProductEdit;