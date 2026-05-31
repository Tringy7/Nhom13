import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Tabs, Tag, Button, Spin, Empty, Divider, Space, Progress, message, List, Avatar } from 'antd';
import { GiftOutlined, StarOutlined, HistoryOutlined, ThunderboltOutlined, TagOutlined, CheckCircleOutlined, PlusOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { getMyVouchersApi, getAvailableVouchersApi, receiveVoucherApi, getRewardBalanceApi, getRewardHistoryApi } from '../util/api/voucher.api.js';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// --- STYLES ---
const styles = {
    pageWrapper: { background: '#f5f7fb', minHeight: '100vh', padding: '40px 0', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
    headerCard: { background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)', borderRadius: 24, padding: '40px 48px', color: '#fff', marginBottom: 32, boxShadow: '0 20px 40px rgba(37, 99, 235, 0.2)' },
    pointCard: { background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' },
    contentCard: { background: '#fff', borderRadius: 24, padding: '24px 32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' },
    couponCard: { background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', transition: 'all 0.3s ease', display: 'flex' },
    couponIconWrapper: { width: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '2px dashed #e5e7eb' },
};

const RewardsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my-vouchers');

    // --- Data State ---
    const [userPoints, setUserPoints] = useState(0);
    const [myVouchers, setMyVouchers] = useState([]);
    const [availableVouchers, setAvailableVouchers] = useState([]);
    const [rewardHistory, setRewardHistory] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [balanceRes, myVouchersRes, availableRes, historyRes] = await Promise.all([
                getRewardBalanceApi(),
                getMyVouchersApi(),
                getAvailableVouchersApi(),
                getRewardHistoryApi()
            ]);
            setUserPoints(balanceRes.data?.points || 0);
            setMyVouchers(myVouchersRes.data || []);
            setAvailableVouchers(availableRes.data || []);
            setRewardHistory(historyRes.data || []);
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu trang ưu đãi.');
            console.error("Error fetching rewards data:", error); // Added for debugging
        } finally {
            setLoading(false);
        }
    };

    const handleReceiveVoucher = async (voucherId) => {
        try {
            await receiveVoucherApi(voucherId);
            message.success('Lưu voucher thành công!');
            fetchData(); // Tải lại dữ liệu để cập nhật danh sách
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể lưu voucher này.');
        }
    };

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN').format(value);

    // --- RENDER FUNCTIONS ---

    const renderVoucher = (data, isOwned = false) => {
        // Nếu là voucher sở hữu (isOwned), data là { voucher, status }.
        // Nếu là voucher để săn (isOwned=false), data là object voucher thuần.
        const voucher = isOwned ? data.voucher : data;
        const { id, title, description, discountType, discountValue, minOrderValue, endDate, code } = voucher;
    
        const isExpired = new Date(endDate) < new Date();
        
        const isDisabled = isOwned && (!data.status || isExpired);
    
        let discountText = '';
        if (discountType === 'PERCENT') {
            discountText = `Giảm ${discountValue}%`;
        } else {
            discountText = `Giảm ${formatCurrency(discountValue)}đ`;
        }
    
        return (
            <Col xs={24} md={12} key={id}>
                <div style={{ ...styles.couponCard, opacity: isDisabled ? 0.5 : 1 }}>
                    <div style={{ ...styles.couponIconWrapper, background: isDisabled ? '#f3f4f6' : '#eef2ff' }}>
                        <GiftOutlined style={{ fontSize: 32, color: isDisabled ? '#9ca3af' : '#4f46e5' }} />
                    </div>
                    <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Title level={5} style={{ margin: 0 }}>{title}</Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>Mã: {code}</Text>
                        <Paragraph style={{ flex: 1, margin: '8px 0' }}>{description}</Paragraph>
                        <Divider style={{ margin: '8px 0' }} />
                        <Row justify="space-between" align="middle">
                            <Text style={{ fontSize: 12, color: isExpired ? '#ef4444' : '#6b7280' }}>
                                HSD: {new Date(endDate).toLocaleDateString('vi-VN')}
                            </Text>
                            {isOwned ? (
                                <Button type="primary" ghost disabled={isDisabled} onClick={() => navigate('/products')}>
                                    {isDisabled ? (isExpired ? 'Hết hạn' : 'Đã dùng') : 'Dùng ngay'}
                                </Button>
                            ) : (
                                <Button icon={<PlusOutlined />} onClick={() => handleReceiveVoucher(id)}>
                                    Lưu
                                </Button>
                            )}
                        </Row>
                    </div>
                </div>
            </Col>
        );
    };

    const renderHistory = () => (
        <List
            itemLayout="horizontal"
            dataSource={rewardHistory}
            renderItem={item => (
                <List.Item>
                    <List.Item.Meta
                        avatar={
                            <Avatar 
                                icon={item.type === 'EARN' ? <ArrowUpOutlined /> : <ArrowDownOutlined />} 
                                style={{ backgroundColor: item.type === 'EARN' ? '#22c55e' : '#ef4444' }} 
                            />
                        }
                        title={<Text strong>{item.type === 'EARN' ? `+${item.points}` : `-${item.points}`} điểm</Text>}
                        description={item.description}
                    />
                    <Text type="secondary">{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
                </List.Item>
            )}
        />
    );

    if (loading) {
        return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
    }
    
    const validVouchers = myVouchers.filter(uv => uv.status && new Date(uv.voucher.endDate) >= new Date());
    const usedOrExpiredVouchers = myVouchers.filter(uv => !uv.status || new Date(uv.voucher.endDate) < new Date());

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                {/* Header Card */}
                <div style={styles.headerCard}>
                    <Row gutter={[48, 32]} align="middle">
                        <Col xs={24} md={14}>
                            <Title level={1} style={{ color: '#fff', margin: '0 0 8px 0', fontSize: 40 }}>Kho Voucher & Điểm thưởng</Title>
                            <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>Quản lý điểm và các mã giảm giá của bạn.</Paragraph>
                        </Col>
                        <Col xs={24} md={10}>
                            <div style={styles.pointCard}>
                                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                                    <Space><StarOutlined /> <Text style={{ color: '#fff' }}>Điểm khả dụng</Text></Space>
                                    <Button type="link" style={{ color: '#fff', padding: 0 }} onClick={() => setActiveTab('history')}>Lịch sử</Button>
                                </Row>
                                <Title style={{ color: '#fff', margin: 0, fontSize: 48 }}>{userPoints.toLocaleString()}</Title>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Main Content */}
                <div style={styles.contentCard}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
                        <TabPane tab="Ví Voucher của tôi" key="my-vouchers">
                            <div style={{ paddingTop: 24 }}>
                                <Title level={4}>Voucher khả dụng ({validVouchers.length})</Title>
                                {validVouchers.length > 0 ? (
                                    <Row gutter={[24, 24]}>{validVouchers.map(uv => renderVoucher(uv, true))}</Row>
                                ) : <Empty description="Bạn chưa có voucher nào." />}
                                <Divider />
                                <Title level={4}>Voucher hết hạn / đã dùng ({usedOrExpiredVouchers.length})</Title>
                                {usedOrExpiredVouchers.length > 0 ? (
                                    <Row gutter={[24, 24]}>{usedOrExpiredVouchers.map(uv => renderVoucher(uv, true))}</Row>
                                ) : <Empty description="Không có voucher hết hạn." />}
                            </div>
                        </TabPane>
                        <TabPane tab="Săn Voucher" key="discover">
                            <div style={{ paddingTop: 24 }}>
                                {availableVouchers.length > 0 ? (
                                    <Row gutter={[24, 24]}>{availableVouchers.map(v => renderVoucher(v, false))}</Row>
                                ) : <Empty description="Hiện chưa có voucher nào để săn." />}
                            </div>
                        </TabPane>
                        <TabPane tab="Lịch sử điểm" key="history">
                            <div style={{ paddingTop: 24 }}>
                                {renderHistory()}
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default RewardsPage;