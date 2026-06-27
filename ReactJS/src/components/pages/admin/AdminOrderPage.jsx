import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders, fetchAdminOrderById, clearSelectedOrder, changeAdminOrderStatus } from "../../../redux/adminOrderSlice";
import { Table, Tag, Button, Space, Typography, Select, message } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import OrderDetailDrawer from "./OrderDetailDrawer";

const { Title } = Typography;

const STATUS_COLORS = {
  NEW: "gold", CONFIRMED: "blue", PREPARING: "purple", SHIPPING: "cyan",
  DELIVERED: "green", CANCELLED: "red", CANCEL_REQUEST: "orange", DELIVERY_FAILED: "volcano"
};

const ORDER_STATUSES = ["NEW", "CONFIRMED", "PREPARING", "SHIPPING", "DELIVERED", "CANCELLED", "CANCEL_REQUEST", "DELIVERY_FAILED"];

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

  const handleChangeStatus = async (id, status) => {
    try {
      await dispatch(changeAdminOrderStatus({ id, status, note: "Admin cập nhật trạng thái đơn hàng" })).unwrap();
      message.success("Đã cập nhật trạng thái đơn hàng");
    } catch (error) {
      message.error(error || "Không thể cập nhật trạng thái");
    }
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
      title: "Thao tác", width: 250, render: (_, r) => (
        <Space>
          <Select
            size="small"
            value={r.orderStatus}
            style={{ width: 150 }}
            onChange={(status) => handleChangeStatus(r.id, status)}
            options={ORDER_STATUSES.map((status) => ({ value: status, label: status }))}
          />
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(r.id)}>Xem</Button>
        </Space>
      )
    },
  ];

  return (
    <div>
      <Title level={3}>📦 Quản lý Đơn hàng</Title>
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="Lọc trạng thái" style={{ width: 180 }} allowClear onChange={(v) => setStatusFilter(v || "")}>
          {ORDER_STATUSES.map(s => (
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
