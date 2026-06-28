import React from 'react';
import { Layout, Typography, Row, Col, Card, Avatar, Button } from 'antd';
import { CheckCircleOutlined, TeamOutlined, RocketOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const teamMembers = [
    { name: 'Nguyễn Hữu Trí', role: 'Project Leader' },
    { name: 'Nguyễn Vũ Quân', role: 'Backend Developer' },
    { name: 'Nguyễn Đăng Tường', role: 'Frontend Developer' },
    { name: 'Đặng Thiên Bách', role: 'UI/UX Designer' },
];

const AboutPage = () => {
    return (
        <Layout>
            <Content style={styles.container}>
                <div style={styles.heroSection}>
                    <Title level={1} style={{ color: '#111', fontWeight: 800 }}>Về UTESHOP</Title>
                    <Paragraph style={styles.heroText}>
                        Nơi Công Nghệ và Đam Mê Hội Tụ.
                    </Paragraph>
                </div>

                <div style={styles.section}>
                    <Row gutter={[32, 32]} align="center">
                        <Col xs={24} md={12}>
                            <img src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=1200" alt="UTESHOP Store" style={styles.aboutImage} />
                        </Col>
                        <Col xs={24} md={12}>
                            <Title level={2}>Sứ Mệnh Của Chúng Tôi</Title>
                            <Paragraph style={styles.paragraph}>
                                Tại UTESHOP, sứ mệnh của chúng tôi là mang đến cho khách hàng những sản phẩm công nghệ chính hãng, chất lượng cao với mức giá cạnh tranh nhất. Chúng tôi tin rằng công nghệ có sức mạnh thay đổi cuộc sống, và mọi người đều xứng đáng được tiếp cận những công nghệ tiên tiến một cách dễ dàng.
                            </Paragraph>
                            <Paragraph style={styles.paragraph}>
                                Chúng tôi không chỉ bán sản phẩm, chúng tôi mang đến giải pháp và một trải nghiệm mua sắm tuyệt vời, từ khâu tư vấn chuyên nghiệp đến dịch vụ hậu mãi tận tâm.
                            </Paragraph>
                        </Col>
                    </Row>
                </div>

                <div style={{...styles.section, background: '#fafafa', borderRadius: '20px'}}>
                    <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>Giá Trị Cốt Lõi</Title>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12} md={6}>
                            <Card bordered={false} style={styles.valueCard}>
                                <CheckCircleOutlined style={styles.valueIcon} />
                                <Title level={4}>Chất Lượng</Title>
                                <Text>Cam kết 100% sản phẩm chính hãng và được kiểm duyệt kỹ càng.</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card bordered={false} style={styles.valueCard}>
                                <SafetyCertificateOutlined style={styles.valueIcon} />
                                <Title level={4}>Uy Tín</Title>
                                <Text>Minh bạch trong mọi giao dịch và luôn đặt lợi ích khách hàng lên đầu.</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card bordered={false} style={styles.valueCard}>
                                <TeamOutlined style={styles.valueIcon} />
                                <Title level={4}>Tận Tâm</Title>
                                <Text>Đội ngũ hỗ trợ nhiệt tình, sẵn sàng giải đáp mọi thắc mắc 24/7.</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card bordered={false} style={styles.valueCard}>
                                <RocketOutlined style={styles.valueIcon} />
                                <Title level={4}>Đổi Mới</Title>
                                <Text>Luôn cập nhật những xu hướng và sản phẩm công nghệ mới nhất trên thế giới.</Text>
                            </Card>
                        </Col>
                    </Row>
                </div>

                <div style={styles.section}>
                    <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>Đội Ngũ Của Chúng Tôi</Title>
                    <Paragraph style={{textAlign: 'center', maxWidth: 600, margin: '0 auto 40px auto'}}>
                        UTESHOP được xây dựng bởi một đội ngũ các bạn sinh viên tài năng và đầy nhiệt huyết từ trường Đại học Sư phạm Kỹ thuật, cùng chung tay tạo nên một dự án đầy ý nghĩa.
                    </Paragraph>
                    <Row gutter={[24, 24]} justify="center">
                        {teamMembers.map(member => (
                            <Col key={member.name} xs={12} sm={8} md={6}>
                                <Card bordered={false} style={{ textAlign: 'center', background: 'transparent' }}>
                                    <Avatar size={80} icon={<UserOutlined />} style={{ marginBottom: 15 }}/>
                                    <Title level={5}>{member.name}</Title>
                                    <Text type="secondary">{member.role}</Text>
                                 </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                <div style={styles.ctaSection}>
                    <Title level={3}>Sẵn sàng khám phá?</Title>
                    <Paragraph>Duyệt qua hàng ngàn sản phẩm công nghệ đang chờ bạn.</Paragraph>
                    <Link to="/products">
                        <Button type="primary" size="large" style={styles.ctaButton}>
                            Mua Sắm Ngay
                        </Button>
                    </Link>
                </div>
            </Content>
        </Layout>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
    },
    heroSection: {
        textAlign: 'center',
        padding: '60px 0',
        background: 'linear-gradient(135deg, rgba(230, 237, 255, 1) 0%, rgba(243, 232, 255, 1) 100%)',
        borderRadius: '20px',
        marginBottom: '40px',
    },
    heroText: {
        fontSize: '18px',
        color: '#555',
    },
    section: {
        padding: '50px 0',
    },
    aboutImage: {
        width: '100%',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        objectFit: 'cover',
        height: '100%',
    },
    paragraph: {
        fontSize: '16px',
        lineHeight: '1.8',
        color: '#444',
    },
    valueCard: {
        textAlign: 'center',
        padding: '20px',
        background: '#fff',
        borderRadius: '16px',
        height: '100%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    },
    valueIcon: {
        fontSize: '42px',
        color: '#1890ff',
        marginBottom: '15px',
    },
    ctaSection: {
        textAlign: 'center',
        padding: '50px 20px',
        background: '#f0f2f5',
        borderRadius: '20px',
        marginTop: '40px',
    },
    ctaButton: {
        marginTop: '20px',
        fontWeight: 'bold',
    }
};

export default AboutPage;