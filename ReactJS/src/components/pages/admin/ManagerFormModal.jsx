import { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";

const ManagerFormModal = ({ open, record, onSubmit, onClose }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (record) form.setFieldsValue({ fullName: record.fullName, phone: record.phone });
      else form.resetFields();
    }
  }, [open, record]);

  const handleOk = () => {
    form.validateFields().then((values) => onSubmit(values));
  };

  return (
    <Modal
      title={record ? "Sửa Manager" : "Tạo Manager"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={record ? "Cập nhật" : "Tạo"}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: "Nhập họ tên" }]}>
          <Input />
        </Form.Item>
        {!record && (
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}>
            <Input />
          </Form.Item>
        )}
        <Form.Item name="phone" label="Số điện thoại">
          <Input />
        </Form.Item>
        {!record && (
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: "Tối thiểu 6 ký tự" }]}>
            <Input.Password />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default ManagerFormModal;