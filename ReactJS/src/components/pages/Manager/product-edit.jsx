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

    // thumbnailFile: dùng riêng để submit thumbnail lên server (maxCount=1)
    const [thumbnailFile, setThumbnailFile] = useState([]);

    // detailFiles: hiển thị gallery gộp chung — thumbnail (đầu) + detail images
    // Mỗi item có thêm flag `isThumbnail: true/false` để phân biệt khi submit
    const [detailFiles, setDetailFiles] = useState([]);

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

                // --- Xử lý thumbnail ---
                let thumbFileObj = null;
                if (product.thumbnail) {
                    thumbFileObj = {
                        uid: 'thumbnail-main',
                        name: 'thumbnail.png',
                        status: 'done',
                        url: `${import.meta.env.VITE_BACKEND_URL}${product.thumbnail}`,
                        isThumbnail: true   // đánh dấu để lọc khi submit
                    };
                    // vẫn giữ thumbnailFile state để submit riêng
                    setThumbnailFile([thumbFileObj]);
                }

                // --- Xử lý detail images ---
                // Backend đã lưu thumbnail vào productimages nên images[] có thể đã chứa thumbnail.
                // Dùng Set để deduplicate theo imageUrl, đặt thumbnail lên đầu nếu chưa có.
                const detailImageObjs = (product.images || []).map((img, index) => ({
                    uid: `detail-${index}`,
                    name: `image-${index}.png`,
                    status: 'done',
                    url: `${import.meta.env.VITE_BACKEND_URL}${img.imageUrl}`,
                    isThumbnail: product.thumbnail && img.imageUrl === product.thumbnail
                }));

                // Kiểm tra xem thumbnail đã có trong danh sách detail chưa
                const thumbnailAlreadyInDetail = detailImageObjs.some(f => f.isThumbnail);

                if (thumbFileObj && !thumbnailAlreadyInDetail) {
                    // Thumbnail chưa có trong productimages → ghép thủ công vào đầu
                    setDetailFiles([thumbFileObj, ...detailImageObjs]);
                } else {
                    // Backend đã gộp sẵn → dùng trực tiếp (isThumbnail đã được đánh dấu)
                    setDetailFiles(detailImageObjs);
                }
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

            // --- Thumbnail ---
            // Ưu tiên: nếu có file mới upload từ thumbnailFile state → gửi lên
            // Nếu không → kiểm tra trong detailFiles xem có item isThumbnail mới không
            const newThumbFromState = thumbnailFile.find(f => f.originFileObj);
            const newThumbFromDetail = detailFiles.find(f => f.isThumbnail && f.originFileObj);

            if (newThumbFromState) {
                formData.append('thumbnail', newThumbFromState.originFileObj);
            } else if (newThumbFromDetail) {
                formData.append('thumbnail', newThumbFromDetail.originFileObj);
            }
            // Nếu không có thumbnail mới → giữ nguyên thumbnail cũ (server tự xử lý)

            // --- Detail images ---
            // Lọc bỏ item thumbnail ra, chỉ gửi ảnh detail thực sự
            const pureDetailFiles = detailFiles.filter(f => !f.isThumbnail);

            // Các ảnh detail cũ đã có sẵn trên server (không có originFileObj)
            const existingImageUrls = pureDetailFiles
                .filter(file => !file.originFileObj)
                .map(file => file.url.replace(import.meta.env.VITE_BACKEND_URL, ''));

            formData.append('existingImages', JSON.stringify(existingImageUrls));

            // Các ảnh detail mới được upload trong lần này
            pureDetailFiles.forEach(file => {
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

    // Khi user thay đổi thumbnail upload riêng → đồng bộ lại vào detailFiles
    const handleThumbnailChange = ({ fileList: newFileList }) => {
        setThumbnailFile(newFileList);

        if (newFileList.length > 0) {
            const newThumb = { ...newFileList[0], isThumbnail: true };
            // Thay thế item thumbnail cũ trong detailFiles bằng item mới
            setDetailFiles(prev => {
                const withoutOldThumb = prev.filter(f => !f.isThumbnail);
                return [newThumb, ...withoutOldThumb];
            });
        } else {
            // User xóa thumbnail → remove khỏi detailFiles luôn
            setDetailFiles(prev => prev.filter(f => !f.isThumbnail));
        }
    };

    // Khi user thay đổi trong gallery chung → cập nhật detailFiles
    // Nếu user xóa item isThumbnail trong gallery → đồng bộ xóa thumbnailFile
    const handleDetailFilesChange = ({ fileList: newFileList }) => {
        setDetailFiles(newFileList);

        // Nếu thumbnail bị xóa khỏi gallery → clear thumbnailFile
        const stillHasThumb = newFileList.some(f => f.isThumbnail);
        if (!stillHasThumb) {
            setThumbnailFile([]);
        }
    };

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
                            {/* Thông tin chính */}
                            <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
                                <Input placeholder="Ví dụ: Laptop Apple MacBook Air M2 2022" size="large" />
                            </Form.Item>
                            <Form.Item label="Mô tả sản phẩm" name="description">
                                <TextArea rows={6} placeholder="Nhập cấu hình chi tiết, chính sách khuyến mãi hoặc thông tin đi kèm..." />
                            </Form.Item>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Giá bán lẻ (VND)" name="price" rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}>
                                        <InputNumber
                                            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={v => v.replace(/\$\s?|(,*)/g, '')}
                                            style={{ width: '100%' }}
                                            min={0}
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Số lượng tồn kho" name="stock" rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn' }]}>
                                        <InputNumber style={{ width: '100%' }} min={0} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Gallery ảnh chung: thumbnail (đầu tiên, có nhãn) + detail images */}
                            <Form.Item
                                label={
                                    <span>
                                        Ảnh sản phẩm
                                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                                            (Ảnh đầu tiên là ảnh đại diện — thumbnail)
                                        </Text>
                                    </span>
                                }
                            >
                                <Upload
                                    listType="picture-card"
                                    fileList={detailFiles}
                                    onPreview={handlePreview}
                                    onChange={handleDetailFilesChange}
                                    multiple
                                    itemRender={(originNode, file) => {
                                        // Hiển thị nhãn "Thumbnail" cho ảnh đầu tiên
                                        if (file.isThumbnail) {
                                            return (
                                                <div style={{ position: 'relative' }}>
                                                    {originNode}
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: 4,
                                                        left: 4,
                                                        background: '#1677ff',
                                                        color: '#fff',
                                                        fontSize: 10,
                                                        padding: '1px 5px',
                                                        borderRadius: 4,
                                                        pointerEvents: 'none'
                                                    }}>
                                                        Thumbnail
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return originNode;
                                    }}
                                >
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Thêm ảnh</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </Col>

                        <Col xs={24} lg={8}>
                            {/* Upload thumbnail riêng (vẫn giữ để user có thể chọn thumbnail độc lập) */}
                            <Form.Item
                                label={
                                    <span>
                                        Ảnh đại diện (Thumbnail)
                                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                                            — tự động thêm vào gallery
                                        </Text>
                                    </span>
                                }
                                required
                            >
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
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </ManagerLayout>
    );
};

export default ProductEdit;