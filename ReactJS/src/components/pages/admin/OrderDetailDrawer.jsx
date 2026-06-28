import { Drawer, Descriptions, Tag, Table, Spin, Divider, Typography } from "antd";

const { Text, Title } = Typography;

const STATUS_COLORS = { NEW: "gold", CONFIRMED: "blue", PREPARING: "purple", SHIPPING: "cyan", DELIVERED: "green", CANCELLED: "red" };

const OrderDetailDrawer = ({ open, order, onClose }) => (
  <Drawer title={`Chi tiết đơn hàng #${order?.id || ""}`} open={open} onClose={onClose} width={680}>
    {!order ? <div style={{ textAlign: "center", padding: 60 }}><Spin /></div> : (
      <>
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="Khách hàng">{order.user?.fullName}</Descriptions.Item>
          <Descriptions.Item label="Email">{order.user?.email}</Descriptions.Item>
          <Descriptions.Item label="SĐT">{order.user?.phone}</Descriptions.Item>
          <Descriptions.Item label="Shipper">{order.shipper?.fullName || "Chưa có"}</Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">{Number(order.totalAmount).toLocaleString("vi-VN")} ₫</Descriptions.Item>
          <Descriptions.Item label="Phí vận chuyển">{Number(order.shippingFee || 30000).toLocaleString("vi-VN")} ₫</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={STATUS_COLORS[order.orderStatus]}>{order.orderStatus}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Voucher">{order.voucher?.code ? `${order.voucher.code} (-${Number(order.voucherDiscount || 0).toLocaleString("vi-VN")} ₫)` : "Không"}</Descriptions.Item>
          <Descriptions.Item label="Dùng điểm">{Number(order.pointsDiscount || 0).toLocaleString("vi-VN")} ₫</Descriptions.Item>
          <Descriptions.Item label="Thanh toán">{order.payment?.method || "—"}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={2}>{new Date(order.createdAt).toLocaleString("vi-VN")}</Descriptions.Item>
        </Descriptions>

        <Divider><Title level={5} style={{ margin: 0 }}>Chi tiết sản phẩm</Title></Divider>
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={order.orderDetails || []}
          columns={[
            { title: "Sản phẩm ID", dataIndex: "productId" },
            { title: "Số lượng", dataIndex: "quantity" },
            { title: "Đơn giá", dataIndex: "price", render: (v) => `${Number(v).toLocaleString("vi-VN")} ₫` },
          ]}
        />
      </>
    )}
  </Drawer>
);

export default OrderDetailDrawer;
