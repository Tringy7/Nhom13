import { useEffect, useState } from "react";
import { Button, Card, DatePicker, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Space, Switch, Table, Tag, Typography } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { createAdminVoucher, deleteAdminVoucher, getAdminVouchers, updateAdminVoucher } from "../../util/api/adminApi";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const voucherIsActive = (voucher) => voucher.isActive ?? voucher.status === "ACTIVE";

const AdminVoucherPage = () => {
  const [form] = Form.useForm();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const res = await getAdminVouchers();
      setVouchers(res.data.data || []);
    } catch (error) {
      message.error(error.response?.data?.message || "Không tải được voucher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVouchers(); }, []);

  const openCreate = () => {
    setEditingVoucher(null);
    form.resetFields();
    form.setFieldsValue({ discountType: "PERCENT", minOrderValue: 0, quantity: 1, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (voucher) => {
    setEditingVoucher(voucher);
    form.setFieldsValue({
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minOrderValue: voucher.minOrderValue,
      quantity: voucher.quantity,
      isActive: voucherIsActive(voucher),
      dateRange: voucher.startDate && voucher.endDate ? [dayjs(voucher.startDate), dayjs(voucher.endDate)] : undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const [startDate, endDate] = values.dateRange;
    const payload = {
      code: values.code.trim().toUpperCase(),
      discountType: values.discountType,
      discountValue: Number(values.discountValue),
      minOrderValue: Number(values.minOrderValue || 0),
      quantity: Number(values.quantity || 0),
      status: values.isActive ? "ACTIVE" : "INACTIVE",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    setSaving(true);
    try {
      if (editingVoucher) {
        await updateAdminVoucher(editingVoucher.id, payload);
        message.success("Đã cập nhật voucher");
      } else {
        await createAdminVoucher(payload);
        message.success("Đã tạo voucher");
      }
      setModalOpen(false);
      loadVouchers();
    } catch (error) {
      message.error(error.response?.data?.message || "Lưu voucher thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdminVoucher(id);
      message.success("Đã xóa voucher");
      loadVouchers();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể xóa voucher");
    }
  };

  const handleToggle = async (voucher) => {
    try {
      await updateAdminVoucher(voucher.id, { status: voucherIsActive(voucher) ? "INACTIVE" : "ACTIVE" });
      message.success("Đã đổi trạng thái voucher");
      loadVouchers();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể đổi trạng thái voucher");
    }
  };

  const columns = [
    { title: "Mã", dataIndex: "code", render: (code) => <Text strong>{code}</Text> },
    { title: "Loại", dataIndex: "discountType", render: (type) => <Tag color={type === "PERCENT" ? "blue" : "purple"}>{type}</Tag> },
    {
      title: "Giá trị",
      render: (_, voucher) => voucher.discountType === "PERCENT"
        ? `${Number(voucher.discountValue || 0)}%`
        : `${Number(voucher.discountValue || 0).toLocaleString("vi-VN")} ₫`,
    },
    { title: "Đơn tối thiểu", dataIndex: "minOrderValue", render: (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫` },
    { title: "Số lượng", dataIndex: "quantity", width: 100 },
    {
      title: "Hiệu lực",
      render: (_, voucher) => `${new Date(voucher.startDate).toLocaleDateString("vi-VN")} - ${new Date(voucher.endDate).toLocaleDateString("vi-VN")}`,
    },
    { title: "Trạng thái", render: (_, voucher) => <Tag color={voucherIsActive(voucher) ? "green" : "default"}>{voucher.status || (voucherIsActive(voucher) ? "ACTIVE" : "INACTIVE")}</Tag> },
    {
      title: "Thao tác",
      width: 240,
      render: (_, voucher) => (
        <Space>
          <Switch checked={voucherIsActive(voucher)} size="small" onChange={() => handleToggle(voucher)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(voucher)}>Sửa</Button>
          <Popconfirm title="Xóa voucher này?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDelete(voucher.id)}>
            <Button danger size="small" icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <Title level={2}>Quản lý voucher</Title>
          <Text type="secondary">Admin có thể tạo, sửa, bật/tắt và xóa mã giảm giá.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm voucher</Button>
      </div>

      <Card>
        <Space className="admin-toolbar">
          <Button icon={<ReloadOutlined />} onClick={loadVouchers}>Tải lại</Button>
        </Space>
        <Table rowKey="id" columns={columns} dataSource={vouchers} loading={loading} scroll={{ x: 940 }} />
      </Card>

      <Modal
        title={editingVoucher ? "Sửa voucher" : "Thêm voucher"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
        width={680}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã voucher" rules={[{ required: true, message: "Nhập mã voucher" }]}>
            <Input placeholder="VD: SALE10" />
          </Form.Item>
          <Space.Compact block>
            <Form.Item name="discountType" label="Loại giảm" rules={[{ required: true }]} style={{ width: "50%" }}>
              <Select options={[{ value: "PERCENT", label: "Phần trăm" }, { value: "FIXED", label: "Số tiền" }]} />
            </Form.Item>
            <Form.Item name="discountValue" label="Giá trị" rules={[{ required: true, message: "Nhập giá trị giảm" }]} style={{ width: "50%" }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Space.Compact>
          <Space.Compact block>
            <Form.Item name="minOrderValue" label="Đơn tối thiểu" style={{ width: "50%" }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]} style={{ width: "50%" }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="dateRange" label="Thời gian hiệu lực" rules={[{ required: true, message: "Chọn thời gian hiệu lực" }]}>
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminVoucherPage;
