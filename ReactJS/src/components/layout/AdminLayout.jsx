import { Layout, Menu, Avatar, Dropdown, Space, Typography } from "antd";
import {
  DashboardOutlined, UserOutlined, TeamOutlined,
  CarOutlined, ShoppingCartOutlined, FileExclamationOutlined,
  BarChartOutlined, LogoutOutlined, SettingOutlined,
  GiftOutlined, LaptopOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import "../styles/admin.css";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: "/admin/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/admin/users", icon: <UserOutlined />, label: "Users" },
  { key: "/admin/managers", icon: <TeamOutlined />, label: "Managers" },
  { key: "/admin/shippers", icon: <CarOutlined />, label: "Shippers" },
  { key: "/admin/products", icon: <LaptopOutlined />, label: "Products" },
  { key: "/admin/vouchers", icon: <GiftOutlined />, label: "Vouchers" },
  { key: "/admin/orders", icon: <ShoppingCartOutlined />, label: "Orders" },
  { key: "/admin/cancel-requests", icon: <FileExclamationOutlined />, label: "Cancel Requests" },
  { key: "/admin/revenue", icon: <BarChartOutlined />, label: "Revenue" },
  { key: "/admin/settings", icon: <SettingOutlined />, label: "Settings" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, dispatch } = useContext(AuthContext);
  const user = auth?.user;

  const dropdownItems = {
    items: [{ key: "logout", icon: <LogoutOutlined />, label: "Logout", danger: true }],
    onClick: ({ key }) => {
      if (key === "logout") {
        dispatch({ type: "LOGOUT" });
        navigate("/login");
      }
    },
  };

  return (
    <Layout className="admin-shell">
      <Sider width={270} theme="light" className="admin-sider">
        <div className="admin-brand">
          <div className="admin-brand-mark">U</div>
          <div>
            <div className="admin-brand-title">UTESHOP</div>
            <div className="admin-brand-subtitle">Admin Console</div>
          </div>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="admin-menu"
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <Dropdown menu={dropdownItems}>
            <Space className="admin-account">
              <Avatar icon={<UserOutlined />} />
              <Text strong>{user?.fullName || user?.name || "Admin"}</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
