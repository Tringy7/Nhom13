import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminUsers, lockAdminUser, unlockAdminUser, fetchAdminUserById, clearSelectedUser, changeAdminUserRole } from "../../../redux/adminUserSlice";
import { Input, Button, Space, Typography, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import UserDetailModal from "./UserDetailModal";
import UserTable from "./UserTable";

const { Title } = Typography;

const AdminUsersPage = () => {
  const dispatch = useDispatch();
  const { list, total, page, limit, loading, selectedUser } = useSelector((s) => s.adminUsers);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const load = (p = 1, s = search) => dispatch(fetchAdminUsers({ page: p, limit, search: s }));

  useEffect(() => { load(); }, []);

  const handleSearch = () => load(1, search);

  const handleView = (id) => {
    dispatch(fetchAdminUserById(id));
    setModalOpen(true);
  };

  const handleLock = async (id) => {
    await dispatch(lockAdminUser(id));
    message.success("Đã khóa user");
  };

  const handleUnlock = async (id) => {
    await dispatch(unlockAdminUser(id));
    message.success("Đã mở khóa user");
  };

  const handleRoleChange = async (id, role) => {
    await dispatch(changeAdminUserRole({ id, role })).unwrap();
    message.success("Đã đổi vai trò");
  };

  return (
    <div>
      <Title level={3}>👥 Quản lý Users</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên, email, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 320 }}
          prefix={<SearchOutlined />}
        />
        <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
      </Space>
      <UserTable
        data={list}
        total={total}
        page={page}
        pageSize={limit}
        loading={loading}
        onPageChange={(p) => load(p)}
        onView={handleView}
        onLock={handleLock}
        onUnlock={handleUnlock}
        onRoleChange={handleRoleChange}
      />
      <UserDetailModal
        open={modalOpen}
        user={selectedUser}
        onClose={() => { setModalOpen(false); dispatch(clearSelectedUser()); }}
      />
    </div>
  );
};

export default AdminUsersPage;
