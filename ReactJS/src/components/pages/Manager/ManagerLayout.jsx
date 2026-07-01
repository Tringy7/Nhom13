import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import {
    DashboardOutlined,
    ShoppingOutlined,
    TagsOutlined,
    OrderedListOutlined,
    CloseCircleOutlined,
    UndoOutlined,
    GiftOutlined,
    PercentageOutlined,
    HomeOutlined,
    LogoutOutlined,
    MessageOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../context/auth.context';
import { logoutApi } from '../../util/api/auth.api';

const { Sider, Content } = Layout;

const ManagerLayout = ({ children, activeKey }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { auth, dispatch } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            dispatch({ type: 'LOGOUT' });
            navigate("/login");
        }
    };

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/manager/dashboard">Báo cáo doanh thu</Link>
        },
        {
            key: 'products',
            icon: <ShoppingOutlined />,
            label: <Link to="/manager/products">Quản lý sản phẩm</Link>
        },
        {
            key: 'brands',
            icon: <TagsOutlined />,
            label: <Link to="/manager/brands">Quản lý danh mục & hãng</Link>
        },
        {
            key: 'orders',
            icon: <OrderedListOutlined />,
            label: <Link to="/manager/orders">Quản lý đơn hàng</Link>
        },
        {
            key: 'cancellations',
            icon: <CloseCircleOutlined />,
            label: <Link to="/manager/cancellations">Yêu cầu hủy đơn</Link>
        },
        {
            key: 'returns',
            icon: <UndoOutlined />,
            label: <Link to="/manager/returns">Yêu cầu trả hàng</Link>
        },
        {
            key: 'vouchers',
            icon: <GiftOutlined />,
            label: <Link to="/manager/vouchers">Khuyến mãi / Voucher</Link>
        },

        {
            key: 'chat',
            icon: <MessageOutlined />,
            label: <Link to="/manager/chat">Hỗ trợ trực tuyến</Link>
        },
        {
            type: 'divider'
        },
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: <Link to="/">Trở về Cửa hàng</Link>
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f7' }}>
            <Sider
                theme="light"
                breakpoint="lg"
                collapsedWidth="0"
                style={{
                    borderRight: '1px solid rgba(0,0,0,0.06)',
                    position: 'fixed',
                    height: '100vh',
                    left: 0,
                    top: 0,
                    zIndex: 10
                }}
                width={260}
            >
                <div style={{
                    height: 72,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    fontSize: '14px',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    color: '#111',
                    textTransform: 'uppercase'
                }}>
                    UTEShop Manager
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)', justifyContent: 'space-between' }}>
                    <Menu
                        mode="inline"
                        selectedKeys={[activeKey]}
                        items={menuItems}
                        style={{ borderRight: 0, padding: '16px 8px' }}
                    />
                    <div style={{ padding: '16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <div style={{ marginBottom: '12px', fontSize: '13px', color: '#666', fontWeight: 500 }}>
                            Chào, {auth.user?.fullName || 'Manager'}
                        </div>
                        <Button
                            type="text"
                            danger
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center' }}
                        >
                            Đăng xuất
                        </Button>
                    </div>
                </div>
            </Sider>
            <Layout style={{ marginLeft: 260, minHeight: '100vh', background: '#f5f5f7' }}>
                <Content style={{ padding: '24px 32px', margin: 0, minHeight: 280 }}>
                    {children}
                </Content>
            </Layout>
            <style>{`
                .ant-layout-sider-zero-width-trigger {
                    top: 16px !important;
                    z-index: 1001;
                }
                @media (max-width: 992px) {
                    .ant-layout {
                        margin-left: 0 !important;
                    }
                }
            `}</style>
        </Layout>
    );
};

export default ManagerLayout;