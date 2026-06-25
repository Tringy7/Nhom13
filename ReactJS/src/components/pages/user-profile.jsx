import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Avatar, Tag, Skeleton, message, Popconfirm } from 'antd';
import {
    UserOutlined,
    CheckCircleOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    ManOutlined,
    WomanOutlined,
    UserSwitchOutlined,
    CrownOutlined,
    TeamOutlined,
    CalendarOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { getUser } from '../../components/util/api/user.api.js';
import { logoutApi } from '../util/api/auth.api.js';
import { AuthContext } from '../context/auth.context';
import styles from '../../components/styles/profile.module.css';
import { getImageUrl } from '../util/helpers.js';

const UserProfile = () => {
    const navigate = useNavigate();
    const { dispatch } = useContext(AuthContext);
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUser();
                let data = response?.data?.user || response?.user || response?.data || response || {};
                if (data.user) {
                    data = data.user;
                }
                setProfile(data);
            } catch (error) {
                console.error('Fetch profile failed:', error);
                message.error('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

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

    const handleEditClick = () => {
        navigate('/user/edit-profile');
    };

    const getGenderInfo = (gender) => {
        switch (gender) {
            case 'MALE': return { text: 'Nam', icon: <ManOutlined />, color: 'blue' };
            case 'FEMALE': return { text: 'Nữ', icon: <WomanOutlined />, color: 'purple' };
            case 'OTHER': return { text: 'Khác', icon: <UserSwitchOutlined />, color: 'default' };
            default: return { text: 'Chưa cập nhật', icon: <UserSwitchOutlined />, color: 'default' };
        }
    };

    const getRoleInfo = (role) => {
        switch (role) {
            case 'admin': return { text: 'Quản trị viên', icon: <CrownOutlined />, color: 'gold' };
            default: return { text: 'Người dùng', icon: <TeamOutlined />, color: 'cyan' };
        }
    };

    const renderInfoRow = (label, value, icon, placeholder = 'Chưa cập nhật') => (
        <Col xs={24} sm={12} style={{ marginBottom: '24px' }}>
            <div className={styles.infoLabel}>{label}</div>
            <div className={styles.infoValue}>
                {icon}
                <span>{value || placeholder}</span>
            </div>
        </Col>
    );

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <Skeleton active avatar={{ size: 120, shape: 'circle' }} paragraph={{ rows: 6 }} />
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <Row gutter={[32, 32]}>
                <Col xs={24} md={8}>
                    <Card className={styles.card}>
                        <div className={styles.avatarContainer}>
                            <Avatar
                                size={120}
                                icon={<UserOutlined />}
                                src={getImageUrl(profile.avatar)}
                                className={styles.avatar}
                            />
                            <div className={styles.badgeVerified}>
                                <CheckCircleOutlined /> Tài khoản hoạt động
                            </div>
                            <p className={styles.updateText}>
                                Cập nhật lần cuối:{' '}
                                {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                            </p>
                            <Button type="primary" className={styles.gradientButton} onClick={handleEditClick}>
                                Chỉnh sửa hồ sơ
                            </Button>
                            <Popconfirm
                                title="Bạn có chắc chắn muốn đăng xuất?"
                                onConfirm={handleLogout}
                                okText="Đăng xuất"
                                cancelText="Hủy"
                            >
                                <Button danger icon={<LogoutOutlined />} style={{ marginTop: '12px', width: '100%' }}>
                                    Đăng xuất
                                </Button>
                            </Popconfirm>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={16}>
                    <Card className={styles.card}>
                        <h1 className={styles.headerTitle}>Thông tin cá nhân</h1>
                        <p className={styles.headerSubtitle}>Quản lý và cập nhật thông tin tài khoản của bạn.</p>

                        <Row gutter={[24, 24]}>
                            <Col xs={24} style={{ marginBottom: '24px' }}>
                                <div className={styles.infoLabel}>Họ và tên</div>
                                <div className={styles.infoValue}>
                                    <UserOutlined />
                                    <span>{profile.fullName || 'Chưa cập nhật'}</span>
                                </div>
                            </Col>
                            {renderInfoRow('Email', profile.email, <MailOutlined />)}
                            {renderInfoRow('Số điện thoại', profile.phone, <PhoneOutlined />)}

                            <Col xs={24} style={{ marginBottom: '24px' }}>
                                <div className={styles.infoLabel}>Địa chỉ</div>
                                <div className={styles.infoValue}>
                                    <HomeOutlined />
                                    <span>{profile.address || 'Chưa cập nhật'}</span>
                                </div>
                            </Col>

                            <Col xs={24} sm={12} style={{ marginBottom: '24px' }}>
                                <div className={styles.infoLabel}>Giới tính</div>
                                <div className={styles.infoValue}>
                                    <Tag
                                        icon={getGenderInfo(profile.gender).icon}
                                        color={getGenderInfo(profile.gender).color}
                                        style={{ fontSize: 14, padding: '5px 10px' }}
                                    >
                                        {getGenderInfo(profile.gender).text}
                                    </Tag>
                                </div>
                            </Col>

                            <Col xs={24} sm={12} style={{ marginBottom: '24px' }}>
                                <div className={styles.infoLabel}>Vai trò</div>
                                <div className={styles.infoValue}>
                                    <Tag
                                        icon={getRoleInfo(profile.role).icon}
                                        color={getRoleInfo(profile.role).color}
                                        style={{ fontSize: 14, padding: '5px 10px' }}
                                    >
                                        {getRoleInfo(profile.role).text}
                                    </Tag>
                                </div>
                            </Col>

                            <Col xs={24} sm={12} style={{ marginBottom: '24px' }}>
                                <div className={styles.infoLabel}>Điểm tích lũy</div>
                                <div className={styles.infoValue}>
                                    <CrownOutlined />
                                    <span>{profile.pointsBalance || 0} điểm</span>
                                </div>
                            </Col>

                            <Col xs={24} sm={12} style={{ marginBottom: '24px' }}>
                                <div className={styles.infoLabel}>Ngày tham gia</div>
                                <div className={styles.infoValue}>
                                    <CalendarOutlined />
                                    <span>
                                        {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                    </span>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default UserProfile;