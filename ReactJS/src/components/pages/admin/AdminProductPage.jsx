import { useEffect, useState } from "react";
import { Button, Card, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Space, Switch, Table, Tag, Typography } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminBrands,
  getAdminCategories,
  getAdminProducts,
  toggleAdminProduct,
  updateAdminProduct,
} from "../../util/api/adminApi";

const { Title, Text } = Typography;

const AdminProductPage = () => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", category: "", brandId: undefined, isActive: undefined });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadMeta = async () => {
    try {
      const [brandRes, categoryRes] = await Promise.all([getAdminBrands(), getAdminCategories()]);
      setBrands(brandRes.data.data || []);
      setCategories(categoryRes.data.data || []);
    } catch {
      message.error("Không tải được brand/danh mục");
    }
  };

  const loadProducts = async (page = pagination.current) => {
    setLoading(true);
    try {
      const res = await getAdminProducts({ ...filters, page, limit: pagination.pageSize });
      const payload = res.data.data || {};
      setProducts(payload.products || payload.data || []);
      setPagination((prev) => ({ ...prev, current: payload.page || page, total: payload.total || 0 }));
    } catch (error) {
      message.error(error.response?.data?.message || "Không tải được sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMeta(); }, []);
  useEffect(() => { loadProducts(1); }, [filters]);

  const openCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({ stock: 0, price: 0, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),
      ram: product.ram || undefined,
      category: product.category || undefined,
      brandId: product.brandId || product.brand?.id,
      thumbnail: product.thumbnail,
      description: product.description,
      isActive: Boolean(product.isActive),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        price: Number(values.price || 0),
        stock: Number(values.stock || 0),
        ram: values.ram || null,
      };
      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
        message.success("Đã cập nhật sản phẩm");
      } else {
        await createAdminProduct(payload);
        message.success("Đã tạo sản phẩm");
      }
      setModalOpen(false);
      loadProducts();
      loadMeta();
    } catch (error) {
      message.error(error.response?.data?.message || "Lưu sản phẩm thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdminProduct(id);
      message.success("Đã xóa sản phẩm");
      loadProducts();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleAdminProduct(id);
      message.success("Đã đổi trạng thái sản phẩm");
      loadProducts();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể đổi trạng thái");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    {
      title: "Sản phẩm",
      render: (_, product) => (
        <Space>
          <img className="admin-product-thumb" src={product.thumbnail || "/placeholder.png"} alt={product.name} />
          <div>
            <Text strong>{product.name}</Text>
            <div className="admin-muted-text">{product.category || "Chưa phân loại"}</div>
          </div>
        </Space>
      ),
    },
    { title: "Brand", render: (_, product) => product.brand?.name || "—" },
    { title: "RAM", dataIndex: "ram", render: (ram) => ram ? `${ram} GB` : "—" },
    { title: "Giá", dataIndex: "price", render: (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫` },
    { title: "Kho", dataIndex: "stock", width: 90 },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (isActive) => <Tag color={isActive ? "green" : "default"}>{isActive ? "Đang bán" : "Ẩn"}</Tag>,
    },
    {
      title: "Thao tác",
      width: 250,
      render: (_, product) => (
        <Space>
          <Switch checked={product.isActive} size="small" onChange={() => handleToggle(product.id)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(product)}>Sửa</Button>
          <Popconfirm title="Xóa sản phẩm này?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDelete(product.id)}>
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
          <Title level={2}>Quản lý sản phẩm</Title>
          <Text type="secondary">Admin có thể thêm, sửa, ẩn/hiện và xóa sản phẩm.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm sản phẩm</Button>
      </div>

      <Card>
        <Space wrap className="admin-toolbar">
          <Input.Search placeholder="Tìm tên sản phẩm" allowClear onSearch={(search) => setFilters((prev) => ({ ...prev, search }))} />
          <Select
            placeholder="Danh mục"
            allowClear
            style={{ width: 180 }}
            onChange={(category) => setFilters((prev) => ({ ...prev, category: category || "" }))}
            options={categories.map((category) => ({ value: category, label: category }))}
          />
          <Select
            placeholder="Brand"
            allowClear
            style={{ width: 180 }}
            onChange={(brandId) => setFilters((prev) => ({ ...prev, brandId }))}
            options={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 160 }}
            onChange={(isActive) => setFilters((prev) => ({ ...prev, isActive }))}
            options={[{ value: true, label: "Đang bán" }, { value: false, label: "Ẩn" }]}
          />
          <Button icon={<ReloadOutlined />} onClick={() => loadProducts()}>Tải lại</Button>
        </Space>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={products}
          loading={loading}
          scroll={{ x: 980 }}
          pagination={{
            ...pagination,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
            onChange: (page) => loadProducts(page),
          }}
        />
      </Card>

      <Modal
        title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
        width={780}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: "Nhập tên sản phẩm" }]}>
            <Input />
          </Form.Item>
          <Space.Compact block>
            <Form.Item name="price" label="Giá" rules={[{ required: true }]} style={{ width: "33%" }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="stock" label="Tồn kho" rules={[{ required: true }]} style={{ width: "33%" }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="ram" label="RAM (GB)" style={{ width: "34%" }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Space.Compact>
          <Space.Compact block>
            <Form.Item name="category" label="Danh mục" style={{ width: "50%" }}>
              <Select
                showSearch
                allowClear
                options={categories.map((category) => ({ value: category, label: category }))}
              />
            </Form.Item>
            <Form.Item name="brandId" label="Brand" rules={[{ required: true, message: "Chọn brand" }]} style={{ width: "50%" }}>
              <Select options={brands.map((brand) => ({ value: brand.id, label: brand.name }))} />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="thumbnail" label="Ảnh đại diện URL/path">
            <Input placeholder="/uploads/products/laptop.jpg hoặc https://..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="isActive" label="Hiển thị bán hàng" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProductPage;
