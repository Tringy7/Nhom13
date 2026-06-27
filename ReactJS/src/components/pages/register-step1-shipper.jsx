import React from 'react';
import { Button, Form, Input, notification, Spin, Divider, Typography } from 'antd';
import { ArrowLeftOutlined, MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { registerApi } from '../util/api/auth.api';
import { styles } from './register';

const { Text } = Typography;

// RegisterStep1 dành riêng cho shipper (gửi role='shipper')
const RegisterStep1Shipper = ({ onNext, email: initialEmail = '' }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const { email, password, fullName } = values;

            const res = await registerApi(email, password, fullName, 'shipper');

            if (res && res.success) {
                notification.success({
                    message: "Gửi OTP thành công",
                    description: res.message || "Vui lòng kiểm tra hộp thư của bạn.",
                    placement: "topRight"
                });
                onNext(email);
            } else {
                notification.error({
                    message: "Lỗi",
                    description: res?.message || 'Đăng ký thất bại, vui lòng thử lại.',
                    placement: "topRight"
                });
            }
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
                placement: "topRight"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Spin spinning={loading}>
            <Form
                form={form}
                name="registerShipperStep1"
                onFinish={onFinish}
                autoComplete="off"
                layout='vertical'
                initialValues={{ email: initialEmail }}
                size="large"
            >
                <Form.Item
                    name="fullName"
                    rules={[
                        { required: true, message: 'Vui lòng nhập họ và tên!' },
                        { min: 2, message: 'Họ và tên phải ít nhất 2 ký tự!' }
                    ]}
                >
                    <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Họ và tên đầy đủ" style={styles.input} />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="Địa chỉ email" disabled={!!initialEmail} style={styles.input} />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu!' },
                        { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự!' },
                        { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Mật khẩu phải có chữ hoa, thường và số!' }
                    ]}
                >
                    <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Mật khẩu" style={styles.input} />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Xác nhận mật khẩu" style={styles.input} />
                </Form.Item>

                <Form.Item style={{ marginTop: '24px', marginBottom: '16px' }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="register-btn"
                        style={{ ...styles.button, background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
                    >
                        Tiếp tục
                    </Button>
                </Form.Item>
            </Form>

            <Divider style={{ borderColor: 'rgba(0,0,0,0.06)', margin: '16px 0' }}>
                <Text type="secondary" style={{ fontSize: '13px' }}>HOẶC</Text>
            </Divider>

            <div style={{ textAlign: "center", marginBottom: '20px' }}>
                <Text style={{ color: '#475569', fontSize: '14px' }}>Đã có tài khoản? </Text>
                <Link to="/login" style={{ color: '#7c3aed', fontWeight: 600, fontSize: '14px' }}>
                    Đăng nhập ngay
                </Link>
            </div>

            <div style={{ textAlign: "center" }}>
                <Link to="/register" style={{ color: '#16a34a', fontWeight: 600, fontSize: '14px' }}>
                    Đăng ký tài khoản thường thay thế →
                </Link>
            </div>
        </Spin>
    );
};

export default RegisterStep1Shipper;
