import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Avatar, Spin, Tag, Skeleton } from 'antd';
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
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { fetchUserProfile } from '../../redux/profileSlice';
import styles from '../../components/styles/profile.module.css';

const UserProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { profile, loading } = useSelector(state => state.profile);

    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    const handleEditClick = () => {
        navigate('/user/edit-profile');
    };

    const getGenderInfo = (gender) => {
        switch (gender) {
            case 'male':
                return { text: 'Nam', icon: <ManOutlined />, color: 'blue' };
            case 'female':
                return { text: 'Nữ', icon: <WomanOutlined />, color: 'purple' };
            default:
                return { text: 'Khác', icon: <UserSwitchOutlined />, color: 'default' };
        }
    };

    const getRoleInfo = (role) => {
        switch (role) {
            case 'admin':
                return { text: 'Quản trị viên', icon: <CrownOutlined />, color: 'gold' };
            default:
                return { text: 'Người dùng', icon: <TeamOutlined />, color: 'cyan' };
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

    if (loading && !profile.email) {
        return (
            <div className={styles.pageContainer}>
                <Skeleton active avatar={{ size: 120, shape: 'circle' }} paragraph={{ rows: 4 }} />
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
                                src={profile.image}
                                className={styles.avatar}
                            />
                            {profile.isVerified ? (
                                <div className={styles.badgeVerified}>
                                    <CheckCircleOutlined /> Đã xác thực
                                </div>
                            ) : (
                                <div className={styles.badgeUnverified}>
                                    <ExclamationCircleOutlined /> Chưa xác thực tài khoản
                                </div>
                            )}
                            <p className={styles.updateText}>
                                Cập nhật lần cuối: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
                            </p>
                            <Button
                                type="primary"
                                className={styles.gradientButton}
                                onClick={handleEditClick}
                            >
                                Chỉnh sửa hồ sơ
                            </Button>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={16}>
                    <Card className={styles.card}>
                        <h1 className={styles.headerTitle}>Thông tin cá nhân</h1>
                        <p className={styles.headerSubtitle}>Quản lý và cập nhật thông tin tài khoản của bạn.</p>
                        <Row gutter={[24, 24]}>
                            {renderInfoRow('Tên', profile.firstName, <UserOutlined />)}
                            {renderInfoRow('Họ', profile.lastName, <UserOutlined />)}
                            {renderInfoRow('Email', profile.email, <MailOutlined />)}
                            {renderInfoRow('Số điện thoại', profile.phoneNumber, <PhoneOutlined />)}
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
                                    <Tag icon={getGenderInfo(profile.gender).icon} color={getGenderInfo(profile.gender).color} style={{ fontSize: 14, padding: '5px 10px' }}>
                                        {getGenderInfo(profile.gender).text}
                                    </Tag>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} style={{ marginBottom: '24px' }}>
                                <div className={styles.infoLabel}>Vai trò</div>
                                <div className={styles.infoValue}>
                                    <Tag icon={getRoleInfo(profile.role).icon} color={getRoleInfo(profile.role).color} style={{ fontSize: 14, padding: '5px 10px' }}>
                                        {getRoleInfo(profile.role).text}
                                    </Tag>
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
