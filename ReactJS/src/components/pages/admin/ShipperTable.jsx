import { Button, Popconfirm, Space, Table, Tag } from "antd";
import { EditOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";

const ShipperTable = ({ data, total, page, pageSize, loading, onPageChange, onEdit, onLock, onUnlock }) => {
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
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>Sửa</Button>
          {record.status === "ACTIVE" ? (
            <Popconfirm title="Khóa shipper này?" onConfirm={() => onLock(record.id)}>
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

export default ShipperTable;
