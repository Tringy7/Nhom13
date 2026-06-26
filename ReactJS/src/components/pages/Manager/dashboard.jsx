import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Spin, Alert, Empty } from 'antd';
import {
    DollarOutlined,
    ShoppingOutlined,
    ClockCircleOutlined,
    InboxOutlined,
    UserOutlined,
    RiseOutlined
} from '@ant-design/icons';
import ManagerLayout from './ManagerLayout.jsx';
import { getSalesReportApi } from '../../util/api/manager.api';

const { Title, Text } = Typography;

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await getSalesReportApi();
            if (res.success) {
                setReportData(res.data);
            } else {
                setError(res.message || "Không thể tải báo cáo");
            }
        } catch (err) {
            console.error(err);
            setError("Đã xảy ra lỗi khi kết nối tới máy chủ");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    if (loading) {
        return (
            <ManagerLayout activeKey="dashboard">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <Spin size="large" tip="Đang tải báo cáo doanh thu..." />
                </div>
            </ManagerLayout>
        );
    }

    if (error) {
        return (
            <ManagerLayout activeKey="dashboard">
                <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginTop: 24 }} />
            </ManagerLayout>
        );
    }

    const { summary, bestSellers = [], salesHistory = [] } = reportData || {};

    const bestSellersColumns = [
        {
            title: 'Sản phẩm',
            key: 'product',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img 
                        src={record.product?.thumbnail ? `${import.meta.env.VITE_BACKEND_URL}${record.product.thumbnail}` : 'https://placehold.co/50'} 
                        alt={record.product?.name} 
                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }}
                    />
                    <Text strong>{record.product?.name || 'Sản phẩm không tên'}</Text>
                </div>
            )
        },
        {
            title: 'Giá bán lẻ',
            dataIndex: ['product', 'price'],
            key: 'price',
            render: (price) => <Text>{formatCurrency(Number(price || 0))}</Text>
        },
        {
            title: 'Số lượng đã bán',
            dataIndex: 'totalSold',
            key: 'totalSold',
            render: (sold) => <Text style={{ fontWeight: 600, color: '#16a34a' }}>{sold} cái</Text>
        },
        {
            title: 'Doanh thu',
            dataIndex: 'totalSales',
            key: 'totalSales',
            render: (sales) => <Text strong>{formatCurrency(Number(sales || 0))}</Text>
        }
    ];

    const salesHistoryColumns = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: (date) => <Text>{new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}</Text>
        },
        {
            title: 'Số đơn hàng',
            dataIndex: 'dailyOrdersCount',
            key: 'dailyOrdersCount',
            render: (count) => <Text>{count} đơn</Text>
        },
        {
            title: 'Doanh thu ngày',
            dataIndex: 'dailyRevenue',
            key: 'dailyRevenue',
            render: (revenue) => <Text strong style={{ color: '#2563eb' }}>{formatCurrency(Number(revenue || 0))}</Text>
        }
    ];

    return (
        <ManagerLayout activeKey="dashboard">
            <div style={{ marginBottom: 32 }}>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Báo cáo doanh thu & Hoạt động</Title>
                <Text type="secondary">Phân tích hiệu suất bán hàng và quản trị hoạt động cửa hàng.</Text>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} sm={12} xl={8}>
                    <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <Statistic
                            title="Doanh thu thực tế (đã xác nhận)"
                            value={summary?.revenue || 0}
                            formatter={(val) => formatCurrency(val)}
                            valueStyle={{ color: '#2563eb', fontWeight: 700 }}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={4}>
                    <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <Statistic
                            title="Đơn đã xử lý"
                            value={summary?.ordersCount || 0}
                            valueStyle={{ color: '#16a34a', fontWeight: 700 }}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={4}>
                    <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <Statistic
                            title="Đơn mới chờ duyệt"
                            value={summary?.pendingOrders || 0}
                            valueStyle={{ color: '#d97706', fontWeight: 700 }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={4}>
                    <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <Statistic
                            title="Tổng sản phẩm"
                            value={summary?.productsCount || 0}
                            valueStyle={{ color: '#4f46e5', fontWeight: 700 }}
                            prefix={<InboxOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={4}>
                    <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <Statistic
                            title="Tổng khách hàng"
                            value={summary?.usersCount || 0}
                            valueStyle={{ color: '#0891b2', fontWeight: 700 }}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Best Selling Table */}
                <Col xs={24} lg={14}>
                    <Card 
                        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><RiseOutlined style={{ color: '#16a34a' }} /><span>Sản phẩm bán chạy nhất</span></div>}
                        bordered={false} 
                        style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: '100%' }}
                    >
                        {bestSellers.length > 0 ? (
                            <Table 
                                columns={bestSellersColumns} 
                                dataSource={bestSellers} 
                                rowKey="productId"
                                pagination={false}
                                size="middle"
                            />
                        ) : (
                            <Empty description="Chưa có dữ liệu bán hàng" style={{ padding: '32px 0' }} />
                        )}
                    </Card>
                </Col>

                {/* Sales History Over 7 Days */}
                <Col xs={24} lg={10}>
                    <Card 
                        title="Biểu đồ doanh thu 7 ngày qua" 
                        bordered={false} 
                        style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: '100%' }}
                    >
                        {salesHistory.length > 0 ? (
                            <Table 
                                columns={salesHistoryColumns} 
                                dataSource={salesHistory} 
                                rowKey="date"
                                pagination={false}
                                size="middle"
                            />
                        ) : (
                            <Empty description="Không có hoạt động bán hàng trong 7 ngày qua" style={{ padding: '32px 0' }} />
                        )}
                    </Card>
                </Col>
            </Row>
        </ManagerLayout>
    );
};

export default Dashboard;
