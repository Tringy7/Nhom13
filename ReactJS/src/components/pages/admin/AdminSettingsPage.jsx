import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Input, InputNumber, Switch, Tabs, Typography, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { fetchSystemSettings, saveSystemSettings } from "../../../redux/adminSettingsSlice";

const { Title } = Typography;

const groupLabels = {
  store: "Thông tin cửa hàng",
  policy: "Chính sách",
  system: "Hệ thống",
};

const getInitialValues = (items) =>
  items.reduce((acc, item) => {
    acc[item.key] = item.inputType === "boolean" ? item.value === "true" : item.value;
    return acc;
  }, {});

const renderField = (item) => {
  if (item.inputType === "textarea") return <Input.TextArea rows={4} />;
  if (item.inputType === "number") return <InputNumber min={0} style={{ width: "100%" }} />;
  if (item.inputType === "boolean") return <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />;
  return <Input type={item.inputType === "email" || item.inputType === "url" ? item.inputType : "text"} />;
};

const AdminSettingsPage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { items, loading, saving } = useSelector((state) => state.adminSettings);

  useEffect(() => {
    dispatch(fetchSystemSettings());
  }, [dispatch]);

  useEffect(() => {
    form.setFieldsValue(getInitialValues(items));
  }, [form, items]);

  const handleSubmit = async (values) => {
    await dispatch(saveSystemSettings(values)).unwrap();
    message.success("Đã lưu cấu hình hệ thống");
  };

  const tabs = Object.entries(groupLabels).map(([group, label]) => ({
    key: group,
    label,
    children: (
      <div style={{ maxWidth: 720 }}>
        {items.filter((item) => item.group === group).map((item) => (
          <Form.Item
            key={item.key}
            name={item.key}
            label={item.label}
            valuePropName={item.inputType === "boolean" ? "checked" : "value"}
          >
            {renderField(item)}
          </Form.Item>
        ))}
      </div>
    ),
  }));

  return (
    <div>
      <Title level={3}>Cấu hình hệ thống</Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={loading}>
        <Tabs items={tabs} />
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
          Lưu cấu hình
        </Button>
      </Form>
    </div>
  );
};

export default AdminSettingsPage;
