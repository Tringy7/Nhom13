import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Upload, message, Card, Row, Col, Avatar, Segmented, Skeleton } from 'antd';
import {
    UploadOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    CrownOutlined
} from '@ant-design/icons';
import { updateUserProfile, fetchUserProfile, clearSuccess, clearError } from '../../redux/profileSlice';
import styles from '../../components/styles/profile.module.css';

const { Dragger } = Upload;

const UserEditProfile = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { profile, loading, error, success } = useSelector(state => state.profile);
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(profile.image || '');

    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile && profile.email) {
            form.setFieldsValue({
                email: profile.email,
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                phoneNumber: profile.phoneNumber || '',
                address: profile.address || '',
                gender: profile.gender || 'male'
            });
            setPreviewImage(profile.image || '');
        }
    }, [profile, form]);

    useEffect(() => {
        if (success) {
            message.success('Cập nhật thông tin thành công!');
            dispatch(clearSuccess());
            dispatch(fetchUserProfile());
        }
    }, [success, dispatch]);

    useEffect(() => {
        if (error) {
            message.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleImageChange = (info) => {
        // Handle local preview
        const file = info.file.originFileObj || info.file;
        if (file) {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
                return;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Hình ảnh phải nhỏ hơn 5MB!');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
                setImageFile(e.target.result); // Keep it as data url or use the file depending on API
            };
            reader.readAsDataURL(file);
        }
    };

    const onFinish = (values) => {
        const updateData = {
            ...values,
            image: imageFile || profile.image
        };
        dispatch(updateUserProfile(updateData));
    };

    const handleCancel = () => {
        navigate('/user/profile');
    };

    if (loading && !profile.email) {
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
                                src={previewImage}
                                className={styles.avatar}
                            />

                            <div style={{ width: '100%', marginBottom: '24px' }}>
                                <Dragger
                                    className={styles.uploadDragger}
                                    maxCount={1}
                                    showUploadList={false}
                                    beforeUpload={() => false}
                                    onChange={handleImageChange}
                                    accept=".jpg,.jpeg,.png"
                                >
                                    <p className="ant-upload-drag-icon">
                                        <UploadOutlined style={{ color: '#8b5cf6', fontSize: 24 }} />
                                    </p>
                                    <p className={styles.uploadText}>Kéo thả ảnh hoặc click để upload</p>
                                    <p className={styles.uploadHint}>JPG hoặc PNG<br/>Tối đa 5MB</p>
                                </Dragger>
                            </div>

                            <div className={styles.badgeVerified} style={{ width: '100%', marginBottom: '16px', display: profile.isVerified ? 'flex' : 'none' }}>
                                <CheckCircleOutlined /> Đã xác thực
                                <br />
                                <span style={{ fontSize: 12, fontWeight: 'normal' }}>
                                    Cập nhật lần cuối: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>

                            {profile.role !== 'vendor' && profile.role !== 'admin' && (
                                <Button
                                    type="primary"
                                    icon={<CrownOutlined />}
                                    className={styles.gradientButton}
                                    style={{ marginTop: 'auto' }}
                                >
                                    Đăng ký trở thành Vendor
                                </Button>
                            )}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={16}>
                    <Card className={styles.card}>
                        <h1 className={styles.headerTitle}>Chỉnh sửa hồ sơ</h1>
                        <p className={styles.headerSubtitle}>Cập nhật thông tin cá nhân và cài đặt tài khoản.</p>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                            className={styles.formLabel}
                        >
                            <Row gutter={24}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="First Name"
                                        name="firstName"
                                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                                    >
                                        <Input className={styles.formInput} placeholder="Nhập tên của bạn" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Last Name"
                                        name="lastName"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                                    >
                                        <Input className={styles.formInput} placeholder="Nhập họ của bạn" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                            >
                                <Input
                                    className={styles.formInput}
                                    prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                                    placeholder="Địa chỉ email"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Phone Number"
                                name="phoneNumber"
                                rules={[
                                    { pattern: /^[0-9]{10,}$/, message: 'Số điện thoại không hợp lệ' }
                                ]}
                            >
                                <Input
                                    className={styles.formInput}
                                    prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />}
                                    placeholder="Số điện thoại"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Address"
                                name="address"
                            >
                                <Input
                                    className={styles.formInput}
                                    prefix={<EnvironmentOutlined style={{ color: '#94a3b8' }} />}
                                    placeholder="Địa chỉ"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Gender"
                                name="gender"
                            >
                                <Segmented
                                    className={styles.customSegmented}
                                    options={[
                                        { label: 'Nam', value: 'male' },
                                        { label: 'Nữ', value: 'female' },
                                        { label: 'Khác', value: 'other' }
                                    ]}
                                    block
                                />
                            </Form.Item>

                            <Row gutter={16} style={{ marginTop: '32px' }}>
                                <Col span={12}>
                                    <Button
                                        className={styles.cancelButton}
                                        onClick={handleCancel}
                                        block
                                    >
                                        Hủy
                                    </Button>
                                </Col>
                                <Col span={12}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        className={styles.gradientButton}
                                        block
                                    >
                                        Lưu thay đổi
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default UserEditProfile;