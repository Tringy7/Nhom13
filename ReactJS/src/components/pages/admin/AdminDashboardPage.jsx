import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../../../redux/adminDashboardSlice";
import { Card, Col, Row, Statistic, Spin, Typography } from "antd";
import {
  UserOutlined, TeamOutlined, CarOutlined, LaptopOutlined,
  ShoppingCartOutlined, DollarOutlined, ClockCircleOutlined,
  SyncOutlined, CheckCircleOutlined
} from "@ant-design/icons";

const { Title } = Typography;

const StatCard = ({ title, value, icon, color, prefix }) => (
  <Card bordered={false} style={{ borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
    <Statistic
      title={<span style={{ color: "#888" }}>{title}</span>}
      value={value ?? 0}
      prefix={<span style={{ color, marginRight: 8 }}>{icon}</span>}
      valueStyle={{ color: "#222", fontWeight: 700 }}
      {...(prefix ? { prefix: <span style={{ color }}>{prefix}</span> } : {})}
    />
  </Card>
);

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.adminDashboard);

  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  if (loading) return <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>;

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>📊 Dashboard</Title>

      <Title level={5} style={{ color: "#888", marginBottom: 12 }}>Tổng quan hệ thống</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Tổng Users" value={stats?.totalUsers} icon={<UserOutlined />} color="#1890ff" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Tổng Managers" value={stats?.totalManagers} icon={<TeamOutlined />} color="#722ed1" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Tổng Shippers" value={stats?.totalShippers} icon={<CarOutlined />} color="#13c2c2" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Tổng Products" value={stats?.totalProducts} icon={<LaptopOutlined />} color="#fa8c16" /></Col>
      </Row>

      <Title level={5} style={{ color: "#888", margin: "24px 0 12px" }}>Đơn hàng & Doanh thu</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Tổng Đơn hàng" value={stats?.totalOrders} icon={<ShoppingCartOutlined />} color="#52c41a" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Doanh thu" value={stats?.totalRevenue?.toLocaleString("vi-VN")} icon={<DollarOutlined />} color="#f5222d" prefix="₫" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Đơn mới" value={stats?.newOrders} icon={<ClockCircleOutlined />} color="#faad14" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Đang giao" value={stats?.shippingOrders} icon={<SyncOutlined spin />} color="#1890ff" /></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Hoàn thành" value={stats?.completedOrders} icon={<CheckCircleOutlined />} color="#52c41a" /></Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;
