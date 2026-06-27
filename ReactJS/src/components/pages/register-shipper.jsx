import React, { useState } from 'react';
import { Steps, Typography, Alert } from 'antd';
import { UserOutlined, SafetyCertificateOutlined, CarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { styles } from './register';
import RegisterStep1Shipper from './register-step1-shipper';
import RegisterStep2 from './register-step2';

const { Title, Text } = Typography;

const RegisterShipperPage = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');

    const handleStep1Next = (userEmail) => {
        setEmail(userEmail);
        setStep(2);
    };

    const handleStep2Back = () => {
        setStep(1);
    };

    return (
        <div style={styles.container}>
            <style>
                {`
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(10deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes floatReverse {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(20px) rotate(-10deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes gradientBG {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .register-btn { transition: all 0.3s ease; }
                .register-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(22, 163, 74, 0.4) !important; opacity: 0.95; }
                .glass-card { animation: fadeIn 0.6s ease-out; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>

            <div style={{ ...styles.shape1, background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, rgba(22,163,74,0) 70%)' }} />
            <div style={styles.shape2} />
            <div style={styles.shape3} />

            <div style={{ ...styles.card, maxWidth: 520 }} className="glass-card">
                <div style={styles.header}>
                    <div style={{ fontSize: 40 }}>🚴</div>
                    <Title level={2} style={{ color: '#0f172a', margin: 0, fontWeight: 700 }}>
                        Đăng ký Shipper
                    </Title>
                    <Text style={{ color: '#64748b', fontSize: '15px' }}>
                        {step === 1 ? 'Gia nhập đội ngũ giao hàng của chúng tôi' : 'Xác minh email để hoàn tất đăng ký'}
                    </Text>
                </div>

                <Alert
                    type="info"
                    showIcon
                    icon={<CarOutlined />}
                    message="Tài khoản Shipper"
                    description="Bạn sẽ được đăng ký với vai trò Shipper. Sau khi xác minh, đăng nhập để bắt đầu nhận đơn hàng."
                    style={{ marginBottom: 24, borderRadius: 12 }}
                />

                <Steps
                    current={step - 1}
                    items={[
                        { title: 'Thông tin', icon: <UserOutlined /> },
                        { title: 'Xác minh', icon: <SafetyCertificateOutlined /> },
                    ]}
                    style={{ marginBottom: '32px' }}
                />

                {step === 1 ? (
                    <RegisterStep1Shipper onNext={handleStep1Next} email={email} />
                ) : (
                    <RegisterStep2 email={email} onBack={handleStep2Back} />
                )}
            </div>
        </div>
    );
};

export default RegisterShipperPage;
