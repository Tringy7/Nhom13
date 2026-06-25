import { useEffect } from "react";
import { Modal, Form, Input } from "antd";

const ShipperFormModal = ({ open, record, onSubmit, onClose }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (record) form.setFieldsValue({ fullName: record.fullName, phone: record.phone });
      else form.resetFields();
    }
  }, [open, record]);

  return (
    <Modal title={record ? "Sửa Shipper" : "Tạo Shipper"} open={open} onCancel={onClose}
      onOk={() => form.validateFields().then(onSubmit)} okText={record ? "Cập nhật" : "Tạo"} destroyOnClose>
      <Form form={form} layout="vertical">
        <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
        {!record && <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input /></Form.Item>}
        <Form.Item name="phone" label="Số điện thoại"><Input /></Form.Item>
        {!record && <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item>}
      </Form>
    </Modal>
  );
};

export default ShipperFormModal;