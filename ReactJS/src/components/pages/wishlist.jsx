import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Space, Empty, Breadcrumb, Spin, message, Popconfirm } from 'antd';
import { HeartOutlined, ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { getWishlistApi, toggleFavoriteApi } from '../util/api/product-feature.api';
import { addToCart } from '../util/api/cart.api';
import { getImageUrl } from '../util/helpers';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { Meta } = Card;

// --- STYLED COMPONENTS ---
const PageWrapper = styled.div`
  background: #f4f5f7;
  min-height: 100vh;
  padding: 40px 0;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
`;

const ProductCard = styled(Card)`
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .ant-card-cover img {
    height: 220px;
    object-fit: contain;
    padding: 16px;
    background: #fff;
  }

  .ant-card-body {
    padding: 16px;
  }
`;

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));

const WishlistPage = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const res = await getWishlistApi();
            // The API returns { success: true, data: [product1, product2] }
            // The interceptor gives us that object. The actual array is in `res.data`.
            setWishlist(res.data || []);
        } catch (error) {
            message.error('Failed to load your wishlist.');
            console.error('Wishlist fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemoveFromWishlist = async (productId, e) => {
        e.stopPropagation(); // Prevent card click navigation
        try {
            await toggleFavoriteApi(productId);
            message.success('Product removed from wishlist.');
            // The item in the list is the product itself, so we filter by item.id
            setWishlist(prev => prev.filter(item => item.id !== productId));
        } catch (error) {
            message.error('Failed to remove product from wishlist.');
        }
    };

    const handleAddToCart = async (productId, e) => {
        e.stopPropagation();
        try {
            await addToCart({ productId, quantity: 1 });
            message.success('Product added to cart!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add product to cart.';
            message.error(errorMessage);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
    }

    return (
        <PageWrapper>
            <Container>
                <Breadcrumb style={{ marginBottom: 24 }}>
                    <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>My Wishlist</Breadcrumb.Item>
                </Breadcrumb>
                
                <Title level={2} style={{ marginBottom: 24, fontWeight: 'bold' }}>My Wishlist ({wishlist.length})</Title>

                {wishlist.length === 0 ? (
                    <Empty
                        image={<HeartOutlined style={{ fontSize: 64, color: '#ccc' }} />}
                        description={
                            <>
                                <Title level={4}>Your Wishlist is Empty</Title>
                                <Text>Looks like you haven’t added anything to your wishlist yet. Start exploring and add products you love!</Text>
                            </>
                        }
                    >
                        <Button type="primary" size="large" onClick={() => navigate('/products')}>Explore Products</Button>
                    </Empty>
                ) : (
                    <Row gutter={[24, 24]}>
                        {wishlist.map(item => (
                            <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                                <ProductCard
                                    hoverable
                                    cover={<img alt={item.name} src={getImageUrl(item.thumbnail)} />}
                                    onClick={() => navigate(`/product/${item.id}`)}
                                    actions={[
                                        <Button type="primary" icon={<ShoppingCartOutlined />} onClick={(e) => handleAddToCart(item.id, e)}>Add to Cart</Button>,
                                        <Popconfirm
                                            title="Remove from wishlist?"
                                            onConfirm={(e) => handleRemoveFromWishlist(item.id, e)}
                                            onCancel={(e) => e.stopPropagation()}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()}>Remove</Button>
                                        </Popconfirm>,
                                    ]}
                                >
                                    <Meta
                                        title={item.name}
                                        description={
                                            <Text strong style={{ fontSize: 16, color: '#1677ff' }}>
                                                {formatPrice(item.price)}
                                            </Text>
                                        }
                                    />
                                </ProductCard>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </PageWrapper>
    );
};

export default WishlistPage;