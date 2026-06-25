import { Button, Popconfirm, Space, Table, Tag } from "antd";
import { EditOutlined, KeyOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";

const ManagerTable = ({
  data,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  onEdit,
  onResetPassword,
  onLock,
  onUnlock,
}) => {
  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Họ tên", dataIndex: "fullName" },
    { title: "Email", dataIndex: "email" },
    { title: "Điện thoại", dataIndex: "phone" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>,
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space wrap>
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>Sửa</Button>
          <Popconfirm title="Reset mật khẩu về Manager@123?" onConfirm={() => onResetPassword(record.id)}>
            <Button size="small" icon={<KeyOutlined />}>Reset PW</Button>
          </Popconfirm>
          {record.status === "ACTIVE" ? (
            <Popconfirm title="Khóa manager này?" onConfirm={() => onLock(record.id)}>
              <Button size="small" danger icon={<LockOutlined />}>Khóa</Button>
            </Popconfirm>
          ) : (
            <Popconfirm title="Mở khóa?" onConfirm={() => onUnlock(record.id)}>
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
        showTotal: (count) => `Tổng ${count}`,
      }}
    />
  );
};

export default ManagerTable;
