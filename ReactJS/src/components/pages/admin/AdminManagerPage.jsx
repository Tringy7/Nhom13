import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchManagers, addManager, editManager, lockAdminManager, unlockAdminManager, resetAdminManagerPassword } from "../../../redux/adminManagerSlice";
import { Button, Space, Typography, message, Input } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import ManagerFormModal from "./ManagerFormModal";
import ManagerTable from "./ManagerTable";

const { Title } = Typography;

const AdminManagerPage = () => {
  const dispatch = useDispatch();
  const { list, total, page, limit, loading } = useSelector((s) => s.adminManagers);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ open: false, record: null });

  const load = (p = 1) => dispatch(fetchManagers({ page: p, limit: 10, search }));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (values) => {
    if (modal.record) {
      await dispatch(editManager({ id: modal.record.id, data: values }));
      message.success("Cập nhật Manager thành công");
    } else {
      await dispatch(addManager(values));
      message.success("Tạo Manager thành công");
    }
    setModal({ open: false, record: null });
    load();
  };

  const handleResetPassword = async (id) => {
    await dispatch(resetAdminManagerPassword(id));
    message.success("Đã reset mật khẩu");
  };

  const handleLock = async (id) => {
    await dispatch(lockAdminManager(id));
    message.success("Đã khóa");
  };

  const handleUnlock = async (id) => {
    await dispatch(unlockAdminManager(id));
    message.success("Đã mở khóa");
  };

  return (
    <div>
      <Title level={3}>🧑‍💼 Quản lý Managers</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input prefix={<SearchOutlined />} placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={() => load(1)} style={{ width: 280 }} />
        <Button type="primary" onClick={() => load(1)}>Tìm</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal({ open: true, record: null })}>Tạo Manager</Button>
      </Space>
      <ManagerTable
        data={list}
        total={total}
        page={page}
        pageSize={limit}
        loading={loading}
        onPageChange={(p) => load(p)}
        onEdit={(record) => setModal({ open: true, record })}
        onResetPassword={handleResetPassword}
        onLock={handleLock}
        onUnlock={handleUnlock}
      />
      <ManagerFormModal
        open={modal.open}
        record={modal.record}
        onSubmit={handleSubmit}
        onClose={() => setModal({ open: false, record: null })}
      />
    </div>
  );
};

export default AdminManagerPage;
