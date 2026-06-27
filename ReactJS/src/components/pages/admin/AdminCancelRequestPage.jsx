import { useEffect, useState } from "react";
import { Table, Tag, Button, Space, Typography, Popconfirm, Modal, Input, message } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { getCancelRequests, approveCancelRequest, rejectCancelRequest } from "../../../components/util/api/adminApi";

const { Title, Text } = Typography;

const STATUS_COLORS = { PENDING: "gold", APPROVED: "green", REJECTED: "red" };

const AdminCancelRequestPage = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, notes: "" });

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getCancelRequests({ page: p, limit: 10 });
      setData(res.data.data);
      setTotal(res.data.total);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    try {
        await approveCancelRequest(id);
        message.success("Đã duyệt yêu cầu hủy");
        load(page);
    } catch (error) {
        message.error(error.message || "Duyệt thất bại");
    }
  };

  const handleReject = async () => {
    try {
        await rejectCancelRequest(rejectModal.id, { reason: rejectModal.notes });
        message.success("Đã từ chối yêu cầu");
        setRejectModal({ open: false, id: null, notes: "" });
        load(page);
    } catch (error) {
        message.error(error.message || "Từ chối thất bại");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { 
      title: "Sản phẩm", 
      render: (_, r) => (
        <div>
          <Text strong>#{r.orderId}</Text>
          <br/>
          <Text>{r.orderDetail?.product?.name || "Sản phẩm không tồn tại"}</Text>
          <br/>
          <Text type="secondary">SL: {r.orderDetail?.quantity}</Text>
        </div>
      )
    },
    { title: "Người yêu cầu", render: (_, r) => r.user?.fullName || "—" },
    { title: "Lý do", dataIndex: "reason" },
    { title: "Ghi chú Admin", dataIndex: "rejectionReason", render: (v) => v || "—" },
    { title: "Trạng thái", dataIndex: "status", render: (s) => <Tag color={STATUS_COLORS[s]}>{s}</Tag> },
    {
      title: "Hành động", render: (_, r) => r.status === "PENDING" ? (
        <Space>
          <Popconfirm title="Duyệt yêu cầu hủy?" onConfirm={() => handleApprove(r.id)}>
            <Button size="small" type="primary" icon={<CheckOutlined />}>Duyệt</Button>
          </Popconfirm>
          <Button size="small" danger icon={<CloseOutlined />} onClick={() => setRejectModal({ open: true, id: r.id, notes: "" })}>Từ chối</Button>
        </Space>
      ) : <Tag color="default">Đã xử lý</Tag>
    },
  ];

  return (
    <div>
      <Title level={3}>🚫 Yêu cầu hủy sản phẩm</Title>
      <Table rowKey="id" dataSource={data} columns={columns} loading={loading}
        pagination={{ total, current: page, pageSize: 10, onChange: (p) => load(p), showTotal: (t) => `Tổng ${t}` }} />

      <Modal title="Từ chối yêu cầu" open={rejectModal.open}
        onCancel={() => setRejectModal({ open: false, id: null, notes: "" })}
        onOk={handleReject} okText="Xác nhận từ chối" okButtonProps={{ danger: true }}>
        <p>Nhập lý do từ chối:</p>
        <Input.TextArea rows={3} value={rejectModal.notes} onChange={(e) => setRejectModal(prev => ({...prev, notes: e.target.value}))} placeholder="Lý do từ chối..." />
      </Modal>
    </div>
  );
};

export default AdminCancelRequestPage;
