import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Tag, Button, Space, Typography, Popconfirm, Modal, Input, message } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCancelRequests, approveCancelRequest, rejectCancelRequest } from "../../../components/util/api/adminApi";

const { Title } = Typography;

const STATUS_COLORS = { PENDING: "gold", APPROVED: "green", REJECTED: "red" };

const AdminCancelRequestPage = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [adminNotes, setAdminNotes] = useState("");

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getCancelRequests({ page: p, limit: 10 });
      setData(res.data.data.data);
      setTotal(res.data.data.total);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    await approveCancelRequest(id);
    message.success("Đã duyệt yêu cầu hủy");
    load(page);
  };

  const handleReject = async () => {
    await rejectCancelRequest(rejectModal.id, { adminNotes });
    message.success("Đã từ chối yêu cầu");
    setRejectModal({ open: false, id: null });
    setAdminNotes("");
    load(page);
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Đơn hàng", render: (_, r) => `#${r.orderId}` },
    { title: "Người yêu cầu", render: (_, r) => r.user?.fullName || "—" },
    { title: "Lý do", dataIndex: "reason" },
    { title: "Ghi chú Admin", dataIndex: "adminNotes", render: (v) => v || "—" },
    { title: "Trạng thái", dataIndex: "status", render: (s) => <Tag color={STATUS_COLORS[s]}>{s}</Tag> },
    {
      title: "Hành động", render: (_, r) => r.status === "PENDING" ? (
        <Space>
          <Popconfirm title="Duyệt yêu cầu hủy?" onConfirm={() => handleApprove(r.id)}>
            <Button size="small" type="primary" icon={<CheckOutlined />}>Duyệt</Button>
          </Popconfirm>
          <Button size="small" danger icon={<CloseOutlined />} onClick={() => setRejectModal({ open: true, id: r.id })}>Từ chối</Button>
        </Space>
      ) : <Tag color="default">Đã xử lý</Tag>
    },
  ];

  return (
    <div>
      <Title level={3}>🚫 Yêu cầu hủy đơn</Title>
      <Table rowKey="id" dataSource={data} columns={columns} loading={loading}
        pagination={{ total, current: page, pageSize: 10, onChange: (p) => load(p), showTotal: (t) => `Tổng ${t}` }} />

      <Modal title="Từ chối yêu cầu" open={rejectModal.open}
        onCancel={() => { setRejectModal({ open: false, id: null }); setAdminNotes(""); }}
        onOk={handleReject} okText="Xác nhận từ chối" okButtonProps={{ danger: true }}>
        <p>Nhập ghi chú từ chối:</p>
        <Input.TextArea rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Lý do từ chối..." />
      </Modal>
    </div>
  );
};

export default AdminCancelRequestPage;