import { Button, Popconfirm, Select, Space, Table, Tag } from "antd";
import { EyeOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";

const roleOptions = [
  { value: "user", label: "User" },
  { value: "manager", label: "Manager" },
  { value: "shipper", label: "Shipper" },
  { value: "admin", label: "Admin" },
];

const UserTable = ({ data, total, page, pageSize, loading, onPageChange, onView, onLock, onUnlock, onRoleChange }) => {
  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Họ tên", dataIndex: "fullName" },
    { title: "Email", dataIndex: "email" },
    { title: "Điện thoại", dataIndex: "phone" },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: (role, record) => (
        <Select
          size="small"
          value={role}
          options={roleOptions}
          style={{ width: 110 }}
          onChange={(nextRole) => onRoleChange(record.id, nextRole)}
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>,
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => onView(record.id)}>Chi tiết</Button>
          {record.status === "ACTIVE" ? (
            <Popconfirm title="Khóa user này?" onConfirm={() => onLock(record.id)}>
              <Button size="small" danger icon={<LockOutlined />}>Khóa</Button>
            </Popconfirm>
          ) : (
            <Popconfirm title="Mở khóa user này?" onConfirm={() => onUnlock(record.id)}>
              <Button size="small" type="primary" icon={<UnlockOutlined />}>Mở khóa</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      dataSource={data}
      columns={columns}
      loading={loading}
      pagination={{
        total,
        current: page,
        pageSize,
        onChange: onPageChange,
        showSizeChanger: false,
        showTotal: (count) => `Tổng ${count} users`,
      }}
    />
  );
};

export default UserTable;
