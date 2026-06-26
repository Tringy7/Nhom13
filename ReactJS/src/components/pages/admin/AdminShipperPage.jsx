import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchShippers, addShipper, editShipper, lockAdminShipper, unlockAdminShipper } from "../../../redux/adminShipperSlice";
import { Button, Space, Typography, message, Input } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import ShipperFormModal from "./ShipperFormModal";
import ShipperTable from "./ShipperTable";

const { Title } = Typography;

const AdminShipperPage = () => {
  const dispatch = useDispatch();
  const { list, total, page, limit, loading } = useSelector((s) => s.adminShippers);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ open: false, record: null });

  const load = (p = 1) => dispatch(fetchShippers({ page: p, limit: 10, search }));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (values) => {
    if (modal.record) {
      await dispatch(editShipper({ id: modal.record.id, data: values }));
      message.success("Cập nhật Shipper thành công");
    } else {
      await dispatch(addShipper(values));
      message.success("Tạo Shipper thành công");
    }
    setModal({ open: false, record: null });
    load();
  };

  const handleLock = async (id) => {
    await dispatch(lockAdminShipper(id));
    message.success("Đã khóa");
  };

  const handleUnlock = async (id) => {
    await dispatch(unlockAdminShipper(id));
    message.success("Đã mở khóa");
  };

  return (
    <div>
      <Title level={3}>🚚 Quản lý Shippers</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input prefix={<SearchOutlined />} placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={() => load(1)} style={{ width: 280 }} />
        <Button type="primary" onClick={() => load(1)}>Tìm</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal({ open: true, record: null })}>Tạo Shipper</Button>
      </Space>
      <ShipperTable
        data={list}
        total={total}
        page={page}
        pageSize={limit}
        loading={loading}
        onPageChange={(p) => load(p)}
        onEdit={(record) => setModal({ open: true, record })}
        onLock={handleLock}
        onUnlock={handleUnlock}
      />
      <ShipperFormModal
        open={modal.open}
        record={modal.record}
        onSubmit={handleSubmit}
        onClose={() => setModal({ open: false, record: null })}
      />
    </div>
  );
};

export default AdminShipperPage;
