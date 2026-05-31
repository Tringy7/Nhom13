import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Card,
    Typography,
    Button,
    Divider,
    Spin,
    message,
    Image,
    InputNumber,
    Breadcrumb,
    Tabs,
    Tag,
    Space,
    Rate,
    Drawer,
    Input,
    Avatar,
    Empty
} from 'antd';
import {
    ShoppingCartOutlined,
    HomeOutlined,
    ArrowLeftOutlined,
    HeartOutlined,
    EyeOutlined,
    MessageOutlined,
    GiftOutlined,
    StarOutlined,
    SendOutlined
} from '@ant-design/icons';
import { getProductDetailApi } from '../util/api/product.api';
import {
    addViewedProductApi,
    getProductInsightsApi,
    getSimilarProductsApi,
    submitReviewApi,
    toggleFavoriteApi
} from '../util/api/product-feature.api';
import { getImageUrl } from '../util/helpers';
import { addToCart } from '../util/api/cart.api';
import { getOrders } from '../util/api/order.api';

const { Title, Text, Paragraph } = Typography;

const styles = {
    pageWrapper: { background: 'linear-gradient(180deg, #f5f7fb 0%, #eff6ff 100%)', minHeight: '100vh', padding: '32px 0', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: 1320, margin: '0 auto', padding: '0 24px' },
    mainCard: { borderRadius: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.08)', background: '#fff', border: '1px solid #e2e8f0' },
    galleryBg: { background: '#f8fafc', borderRadius: 18, padding: 24, marginBottom: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 450, overflow: 'hidden' },
    mainImage: { maxHeight: 400, objectFit: 'contain' },
    thumbnailContainer: { display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12 },
    thumbnail: (active) => ({
        width: 80,
        height: 80,
        flexShrink: 0,
        border: active ? '2px solid #2563eb' : '2px solid transparent',
        borderRadius: 12,
        padding: 4,
        cursor: 'pointer',
        background: '#f5f7fb',
        transition: 'all 0.25s ease'
    }),
    priceBox: { background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', padding: '20px 24px', borderRadius: 14, marginBottom: 24, border: '1px solid #fecdd3' },
    priceText: { color: '#e11d48', margin: 0, fontSize: 36, fontWeight: 700, lineHeight: 1 },
    actionButton: { height: 50, borderRadius: 12, fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s ease' },
    relatedCard: { borderRadius: 16, overflow: 'hidden', cursor: 'pointer', border: '1px solid #e2e8f0' },
    sectionTitle: { marginBottom: 16, fontWeight: 700, fontSize: 24 },
    metricBox: { border: '1px dashed #cbd5e1', borderRadius: 12, padding: '10px 14px', minWidth: 120, background: '#f8fafc' }
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState('');
    const [insights, setInsights] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewOrderId, setReviewOrderId] = useState(null);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [deliveredOrders, setDeliveredOrders] = useState([]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productRes, insightsRes, similarRes, ordersRes] = await Promise.all([
                getProductDetailApi(id),
                getProductInsightsApi(id),
                getSimilarProductsApi(id),
                getOrders()
            ]);

            const productData = productRes?.data?.product || productRes?.product || (productRes?.id ? productRes : null);
            if (!productData) {
                message.error('Không tìm thấy thông tin sản phẩm');
                setLoading(false);
                return;
            }

            setProduct(productData);
            setSelectedImage(productData.images?.[0]?.imageUrl || productData.thumbnail || '');
            setInsights(insightsRes?.data || insightsRes || null);
            setSimilarProducts(similarRes?.data || similarRes || []);

            const orderRows = ordersRes?.data || ordersRes || [];
            const available = orderRows.filter((order) => {
                if (order.status !== 'delivered') return false;
                return (order.items || []).some((item) => Number(item.productId) === Number(id));
            });
            setDeliveredOrders(available);
            if (available.length > 0) setReviewOrderId(available[0].id);

            await addViewedProductApi(id).catch(() => {});
        } catch (error) {
            message.error(error?.response?.data?.message || 'Lỗi khi tải chi tiết sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const handleAddToCart = async () => {
        try {
            const res = await addToCart({ productId: product.id, quantity });
            if (res && (res.success || res.data?.success)) {
                message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
            } else {
                message.error('Thêm vào giỏ hàng thất bại');
            }
        } catch (error) {
            message.error('Lỗi khi thêm vào giỏ hàng. Vui lòng đăng nhập!');
        }
    };

    const handleBuyNow = () => {
        if (!product) return;
        const itemToCheckout = {
            // Tạo một object item tạm thời, cấu trúc giống item trong giỏ hàng
            id: `buynow-${product.id}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: getImageUrl(product.thumbnail || product.images?.[0]?.imageUrl || ''),
            brand: product.brand?.name,
            category: product.category,
            inStock: product.stock > 0
        };
        navigate('/checkout/new', { state: { selectedItems: [itemToCheckout] } });
    };

    const handleToggleFavorite = async () => {
        try {
            const res = await toggleFavoriteApi(id);
            const state = res?.data || res;
            setInsights((prev) => ({
                ...(prev || {}),
                isFavorite: state.favorite,
                favoriteCount: Math.max(0, Number(prev?.favoriteCount || 0) + (state.favorite ? 1 : -1))
            }));
            message.success(state.favorite ? 'Đã thêm vào yêu thích' : 'Đã bỏ khỏi yêu thích');
        } catch (error) {
            message.error(error?.response?.data?.message || 'Không cập nhật được yêu thích');
        }
    };

    const handleSubmitReview = async () => {
        if (!reviewOrderId) return message.warning('Vui lòng chọn đơn hàng đã mua');
        if (!reviewRating) return message.warning('Vui lòng chọn số sao');

        setReviewSubmitting(true);
        try {
            const res = await submitReviewApi(id, {
                orderId: reviewOrderId,
                rating: reviewRating,
                comment: reviewComment
            });
            const data = res?.data || res;
            const reward = data?.reward;
            const rewardText = reward?.type === 'coupon'
                ? `Bạn nhận mã giảm giá ${reward.token} (${reward.value}%)`
                : `Bạn nhận ${reward?.value || 0} điểm tích lũy`;

            message.success(`Đánh giá thành công. ${rewardText}`);
            setReviewComment('');
            setReviewRating(0);
            setReviewDrawerOpen(false);
            await loadData();
        } catch (error) {
            message.error(error?.response?.data?.message || 'Không gửi được đánh giá');
        } finally {
            setReviewSubmitting(false);
        }
    };

    const reviewItems = useMemo(() => insights?.reviews || [], [insights]);

    const tabItems = [
        {
            key: '1',
            label: 'Description',
            children: (
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: '#475569', padding: '12px 0' }}>
                    {product?.description || 'Sản phẩm này chưa có mô tả chi tiết.'}
                </Paragraph>
            )
        },
        {
            key: '2',
            label: 'Specifications',
            children: (
                <div style={{ maxWidth: 900, padding: '12px 0' }}>
                    <Row style={{ padding: '16px 24px', background: '#f8fafc', borderRadius: '8px 8px 0 0', borderBottom: '1px solid #e2e8f0' }}>
                        <Col span={8}><Text type="secondary" strong>Thương hiệu</Text></Col>
                        <Col span={16}><Text strong>{product?.brand?.name || 'N/A'}</Text></Col>
                    </Row>
                    <Row style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
                        <Col span={8}><Text type="secondary" strong>Kho hàng</Text></Col>
                        <Col span={16}><Text strong>{product?.stock || 0}</Text></Col>
                    </Row>
                    <Row style={{ padding: '16px 24px', background: '#f8fafc', borderRadius: '0 0 8px 8px' }}>
                        <Col span={8}><Text type="secondary" strong>Đã bán</Text></Col>
                        <Col span={16}><Text strong>{insights?.buyerCount || product?.sold || 0}</Text></Col>
                    </Row>
                </div>
            )
        },
        {
            key: '3',
            label: 'Reviews',
            children: (
                <div style={{ padding: '16px 0' }}>
                    {reviewItems.length === 0 ? (
                        <Empty description="Chưa có đánh giá nào" />
                    ) : (
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                            {reviewItems.map((rv) => (
                                <Card key={rv.id} size="small" style={{ borderRadius: 12 }}>
                                    <Space align="center" style={{ marginBottom: 8 }}>
                                        <Avatar src={rv.user?.image ? getImageUrl(rv.user.image) : undefined}>
                                            {(rv.user?.firstName || 'U').charAt(0)}
                                        </Avatar>
                                        <Text strong>{`${rv.user?.firstName || ''} ${rv.user?.lastName || ''}`.trim() || 'User'}</Text>
                                        <Rate disabled value={Number(rv.rating)} style={{ fontSize: 14 }} />
                                    </Space>
                                    <Text>{rv.comment || 'Không có nhận xét chi tiết.'}</Text>
                                </Card>
                            ))}
                        </Space>
                    )}
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f7fb' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ textAlign: 'center', padding: '100px', background: '#f5f7fb', minHeight: '100vh' }}>
                <Title level={3}>Sản phẩm không tồn tại</Title>
                <Button type="primary" onClick={() => navigate('/')}>Quay lại trang chủ</Button>
            </div>
        );
    }

    return (
        <div style={styles.pageWrapper}>
            <style>{`
                .gallery-main img { transition: transform 0.4s ease; }
                .gallery-main:hover img { transform: scale(1.07); }
                .thumbnail-item:hover { transform: translateY(-2px); }
                .related-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important; }
                .summary-chip { display:flex; align-items:center; gap:8px; }
                .review-panel .ant-drawer-body { padding: 0 !important; }
            `}</style>

            <div style={styles.container}>
                <div style={{ marginBottom: 24 }}>
                    <Breadcrumb
                        items={[
                            { title: <HomeOutlined /> },
                            { title: <a onClick={(e) => { e.preventDefault(); navigate('/products'); }}>Sản phẩm</a> },
                            { title: product.name }
                        ]}
                        style={{ fontSize: 14, marginBottom: 12 }}
                    />

                    <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ padding: 0, fontWeight: 500, color: '#475569' }}>
                        Quay lại
                    </Button>
                </div>

                <Card variant="borderless" styles={{ body: { padding: 32 } }} style={styles.mainCard}>
                    <Row gutter={[40, 32]}>
                        <Col xs={24} md={12} lg={10}>
                            <div style={styles.galleryBg} className="gallery-main">
                                <Image src={getImageUrl(selectedImage)} alt={product.name} style={styles.mainImage} />
                            </div>

                            {product.images && product.images.length > 1 && (
                                <div style={styles.thumbnailContainer}>
                                    {product.images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            style={styles.thumbnail(selectedImage === img.imageUrl)}
                                            className="thumbnail-item"
                                            onClick={() => setSelectedImage(img.imageUrl)}
                                        >
                                            <Image preview={false} src={getImageUrl(img.imageUrl)} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Col>

                        <Col xs={24} md={12} lg={14}>
                            <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Title level={2} style={{ marginTop: 0, marginBottom: 12, fontWeight: 700, fontSize: 34 }}>
                                    {product.name}
                                </Title>
                                <Button
                                    shape="circle"
                                    icon={<HeartOutlined style={{ color: insights?.isFavorite ? '#ef4444' : '#475569' }} />}
                                    onClick={handleToggleFavorite}
                                />
                            </Space>

                            <Space split={<Divider type="vertical" />} style={{ marginBottom: 20, flexWrap: 'wrap' }}>
                                <Space>
                                    <Rate disabled value={Number(insights?.avgRating || 0)} allowHalf style={{ fontSize: 14, color: '#f59e0b' }} />
                                    <Text type="secondary">({insights?.reviewCount || 0} Reviews)</Text>
                                </Space>
                                <Text type="secondary">{insights?.buyerCount || product.sold || 0} Đã mua</Text>
                                <Text type="secondary">{insights?.commentCount || 0} Bình luận</Text>
                            </Space>

                            <Space size={10} wrap style={{ marginBottom: 18 }}>
                                <div style={styles.metricBox} className="summary-chip"><EyeOutlined /> <Text>{insights?.favoriteCount || 0} yêu thích</Text></div>
                                <div style={styles.metricBox} className="summary-chip"><MessageOutlined /> <Text>{insights?.commentCount || 0} nhận xét</Text></div>
                                <div style={styles.metricBox} className="summary-chip"><GiftOutlined /> <Text>Đánh giá nhận thưởng</Text></div>
                            </Space>

                            <div style={styles.priceBox}>
                                <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
                            </div>

                            <Paragraph style={{ fontSize: 16, color: '#475569', lineHeight: 1.6, marginBottom: 28 }}>
                                {product.description || 'Mô tả ngắn gọn về sản phẩm.'}
                            </Paragraph>

                            <Space align="center" size="large" style={{ marginBottom: 24 }}>
                                <Text strong style={{ fontSize: 16 }}>Số lượng:</Text>
                                <InputNumber
                                    min={1}
                                    max={product.stock > 0 ? product.stock : 1}
                                    value={quantity}
                                    onChange={setQuantity}
                                    disabled={product.stock <= 0}
                                    size="large"
                                    style={{ width: 120, borderRadius: 8 }}
                                />
                                <Text type="secondary">{product.stock} sản phẩm có sẵn</Text>
                            </Space>

                            <Row gutter={12}>
                                <Col span={8}>
                                    <Button size="large" block icon={<ShoppingCartOutlined />} onClick={handleAddToCart} disabled={product.stock <= 0} style={{ ...styles.actionButton, color: '#2563eb', borderColor: '#2563eb', background: '#fff' }}>
                                        Thêm giỏ
                                    </Button>
                                </Col>
                                <Col span={8}>
                                    <Button type="primary" size="large" block onClick={handleBuyNow} disabled={product.stock <= 0} style={{ ...styles.actionButton, background: '#0f172a', borderColor: '#0f172a' }}>
                                        Mua ngay
                                    </Button>
                                </Col>
                                <Col span={8}>
                                    <Button size="large" block icon={<StarOutlined />} onClick={() => setReviewDrawerOpen(true)} style={{ ...styles.actionButton, color: '#4338ca', borderColor: '#c7d2fe', background: '#eef2ff' }}>
                                        Đánh giá
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card>

                <Card variant="borderless" styles={{ body: { padding: '24px 32px' } }} style={{ ...styles.mainCard, marginTop: 24 }}>
                    <Tabs defaultActiveKey="1" items={tabItems} size="large" />
                </Card>

                <div style={{ marginTop: 36 }}>
                    <Title level={3} style={styles.sectionTitle}>Sản phẩm tương tự</Title>
                    <Row gutter={[20, 20]}>
                        {similarProducts.length === 0 ? (
                            <Col span={24}><Empty description="Chưa có sản phẩm tương tự" /></Col>
                        ) : similarProducts.map((item) => (
                            <Col xs={12} md={8} lg={6} key={item.id}>
                                <Card
                                    hoverable
                                    style={styles.relatedCard}
                                    className="related-card"
                                    cover={
                                        <div style={{ background: '#f8fafc', padding: 20, display: 'flex', justifyContent: 'center', borderBottom: '1px solid #e2e8f0' }}>
                                            <img alt={item.name} src={getImageUrl(item.images?.[0]?.imageUrl || item.thumbnail)} style={{ height: 140, objectFit: 'contain', mixBlendMode: 'multiply' }} />
                                        </div>
                                    }
                                    onClick={() => navigate(`/product/${item.id}`)}
                                >
                                    <Text strong>{item.name}</Text>
                                    <div><Text style={{ color: '#e11d48', fontWeight: 700 }}>{formatPrice(item.price)}</Text></div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </div>

            <Drawer
                title="Submit Review"
                placement="right"
                open={reviewDrawerOpen}
                onClose={() => setReviewDrawerOpen(false)}
                className="review-panel"
                size="default"
            >
                <div style={{ padding: 20, background: '#f8fafc', minHeight: '100%' }}>
                    <Card variant="borderless" styles={{ body: { padding: 14 } }} style={{ borderRadius: 14, marginBottom: 16 }}>
                        <Space>
                            <Image src={getImageUrl(product.thumbnail || product.images?.[0]?.imageUrl)} preview={false} width={70} height={70} style={{ borderRadius: 10, objectFit: 'contain', background: '#f1f5f9' }} />
                            <div>
                                <Text strong>{product.name}</Text>
                                <div><Text type="secondary">Đã mua thành công mới được đánh giá</Text></div>
                            </div>
                        </Space>
                    </Card>

                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Bạn đánh giá sản phẩm này thế nào?</Text>
                    <Rate value={reviewRating} onChange={setReviewRating} style={{ fontSize: 30, marginBottom: 16 }} />

                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Nhận xét của bạn</Text>
                    <Input.TextArea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={5}
                        placeholder="Hãy chia sẻ trải nghiệm sử dụng sản phẩm..."
                        style={{ borderRadius: 12, marginBottom: 16 }}
                    />

                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Chọn đơn hàng đã mua</Text>
                    {deliveredOrders.length === 0 ? (
                        <Empty description="Chưa có đơn đã giao cho sản phẩm này" />
                    ) : (
                        <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }}>
                            {deliveredOrders.map((od) => (
                                <Button
                                    key={od.id}
                                    type={reviewOrderId === od.id ? 'primary' : 'default'}
                                    block
                                    onClick={() => setReviewOrderId(od.id)}
                                    style={{ justifyContent: 'space-between' }}
                                >
                                    <span>Đơn #{String(od.id).padStart(6, '0')}</span>
                                    <span>{new Date(od.createdAt).toLocaleDateString('vi-VN')}</span>
                                </Button>
                            ))}
                        </Space>
                    )}

                    <Card size="small" style={{ borderRadius: 12, marginBottom: 16, background: '#eef2ff', borderColor: '#c7d2fe' }}>
                        <Space>
                            <GiftOutlined style={{ color: '#4338ca' }} />
                            <Text>Đánh giá thành công sẽ nhận điểm tích lũy hoặc mã giảm giá.</Text>
                        </Space>
                    </Card>

                    <Button
                        type="primary"
                        block
                        icon={<SendOutlined />}
                        loading={reviewSubmitting}
                        onClick={handleSubmitReview}
                        style={{ height: 48, borderRadius: 999, background: '#2563eb', borderColor: '#2563eb' }}
                    >
                        Submit Review
                    </Button>
                </div>
            </Drawer>
        </div>
    );
};

export default ProductDetail;