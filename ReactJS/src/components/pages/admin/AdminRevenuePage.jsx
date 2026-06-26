import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRevenue } from "../../../redux/adminRevenueSlice";
import { Table, Tabs, Typography, Statistic, Row, Col, Card, Spin } from "antd";

const { Title } = Typography;

const fmtMoney = (v) => `${Number(v || 0).toLocaleString("vi-VN")} ₫`;

const AdminRevenuePage = () => {
  const dispatch = useDispatch();
  const { daily, monthly, yearly, loading } = useSelector((s) => s.adminRevenue);

  useEffect(() => { dispatch(fetchRevenue()); }, [dispatch]);

  const totalRevenue = yearly.reduce((sum, y) => sum + Number(y.revenue || 0), 0);
  const totalOrders = yearly.reduce((sum, y) => sum + Number(y.orderCount || 0), 0);

  const dailyColumns = [
    { title: "Ngày", dataIndex: "date" },
    { title: "Doanh thu", dataIndex: "revenue", render: fmtMoney },
    { title: "Số đơn", dataIndex: "orderCount" },
  ];

  const monthlyColumns = [
    { title: "Năm", dataIndex: "year" },
    { title: "Tháng", dataIndex: "month" },
    { title: "Doanh thu", dataIndex: "revenue", render: fmtMoney },
    { title: "Số đơn", dataIndex: "orderCount" },
  ];

  const yearlyColumns = [
    { title: "Năm", dataIndex: "year" },
    { title: "Doanh thu", dataIndex: "revenue", render: fmtMoney },
    { title: "Số đơn", dataIndex: "orderCount" },
  ];

  if (loading) return <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>;

  return (
    <div>
      <Title level={3}>💰 Báo cáo Doanh thu</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <Statistic title="Tổng doanh thu (tất cả)" value={fmtMoney(totalRevenue)} valueStyle={{ color: "#3f8600" }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <Statistic title="Tổng đơn hoàn thành" value={totalOrders} />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="daily"
        items={[
          {
            key: "daily", label: "📅 Theo ngày (30 ngày gần nhất)",
            children: <Table rowKey="date" dataSource={daily} columns={dailyColumns} pagination={{ pageSize: 10 }} />
          },
          {
            key: "monthly", label: "🗓 Theo tháng (12 tháng)",
            children: <Table rowKey={(r) => `${r.year}-${r.month}`} dataSource={monthly} columns={monthlyColumns} pagination={{ pageSize: 12 }} />
          },
          {
            key: "yearly", label: "📆 Theo năm",
            children: <Table rowKey="year" dataSource={yearly} columns={yearlyColumns} pagination={false} />
          },
        ]}
      />
    </div>
  );
};

export default AdminRevenuePage;