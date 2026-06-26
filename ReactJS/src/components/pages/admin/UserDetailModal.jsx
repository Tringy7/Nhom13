import { Modal, Descriptions, Tag, Spin } from "antd";

const UserDetailModal = ({ open, user, onClose }) => (
  <Modal title="Chi tiết User" open={open} onCancel={onClose} footer={null} width={600}>
    {!user ? <div style={{ textAlign: "center", padding: 40 }}><Spin /></div> : (
      <Descriptions bordered column={1}>
        <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
        <Descriptions.Item label="Họ tên">{user.fullName}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Điện thoại">{user.phone}</Descriptions.Item>
        <Descriptions.Item label="Vai trò"><Tag color="blue">{user.role}</Tag></Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={user.status === "ACTIVE" ? "green" : "red"}>{user.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{new Date(user.createdAt).toLocaleString("vi-VN")}</Descriptions.Item>
      </Descriptions>
    )}
  </Modal>
);

export default UserDetailModal;