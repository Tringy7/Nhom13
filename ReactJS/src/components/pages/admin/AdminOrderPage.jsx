import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders, fetchAdminOrderById, clearSelectedOrder } from "../../../redux/adminOrderSlice";
import { Table, Tag, Button, Space, Typography, Select, Input } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import OrderDetailDrawer from "./OrderDetailDrawer";

const { Title } = Typography;

const STATUS_COLORS = {
  NEW: "gold", CONFIRMED: "blue", PREPARING: "purple", SHIPPING: "cyan",
  DELIVERED: "green", CANCELLED: "red"
};

const AdminOrderPage = () => {
  const dispatch = useDispatch();
  const { list, total, page, limit, loading, selectedOrder } = useSelector((s) => s.adminOrders);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const load = (p = 1) => dispatch(fetchAdminOrders({ page: p, limit: 10, status: statusFilter }));

  useEffect(() => { load(); }, [statusFilter]);

  const handleView = (id) => {
    dispatch(fetchAdminOrderById(id));
    setDrawerOpen(true);
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "Khách hàng", render: (_, r) => r.user?.fullName || "—" },
    { title: "Email", render: (_, r) => r.user?.email || "—" },
    { title: "Shipper", render: (_, r) => r.shipper?.fullName || "Chưa có" },
    { title: "Tổng tiền", dataIndex: "totalAmount", render: (v) => `${Number(v).toLocaleString("vi-VN")} ₫` },
    {
      title: "Trạng thái", dataIndex: "orderStatus",
      render: (s) => <Tag color={STATUS_COLORS[s] || "default"}>{s}</Tag>
    },
    { title: "Ngày tạo", dataIndex: "createdAt", render: (v) => new Date(v).toLocaleDateString("vi-VN") },
    {
      title: "Chi tiết", render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(r.id)}>Xem</Button>
      )
    },
  ];

  return (
    <div>
      <Title level={3}>📦 Quản lý Đơn hàng</Title>
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="Lọc trạng thái" style={{ width: 180 }} allowClear onChange={(v) => setStatusFilter(v || "")}>
          {["NEW","CONFIRMED","PREPARING","SHIPPING","DELIVERED","CANCELLED"].map(s => (
            <Select.Option key={s} value={s}>{s}</Select.Option>
          ))}
        </Select>
      </Space>
      <Table rowKey="id" dataSource={list} columns={columns} loading={loading}
        pagination={{ total, current: page, pageSize: limit, onChange: (p) => load(p), showTotal: (t) => `Tổng ${t} đơn` }} />
      <OrderDetailDrawer
        open={drawerOpen}
        order={selectedOrder}
        onClose={() => { setDrawerOpen(false); dispatch(clearSelectedOrder()); }}
      />
    </div>
  );
};

export default AdminOrderPage;
