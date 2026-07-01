import { Layout, Menu, Avatar, Dropdown, Space, Typography } from "antd";
import {
  DashboardOutlined, UserOutlined, TeamOutlined,
  CarOutlined, ShoppingCartOutlined, FileExclamationOutlined,
  UndoOutlined, BarChartOutlined, LogoutOutlined, SettingOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: "/admin/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/admin/users", icon: <UserOutlined />, label: "Users" },
  { key: "/admin/managers", icon: <TeamOutlined />, label: "Managers" },
  { key: "/admin/shippers", icon: <CarOutlined />, label: "Shippers" },
  { key: "/admin/orders", icon: <ShoppingCartOutlined />, label: "Orders" },
  { key: "/admin/cancel-requests", icon: <FileExclamationOutlined />, label: "Cancel Requests" },
  { key: "/admin/order-detail-return-requests", icon: <UndoOutlined />, label: "Return Requests" },
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
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220} theme="dark">
        <div style={{ padding: "20px 16px", color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>
          UTESHOP
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px", display: "flex", justifyContent: "flex-end", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
          <Dropdown menu={dropdownItems}>
            <Space style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} />
              <Text strong>{user?.fullName || user?.name || "Admin"}</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: "#fff", borderRadius: 8, minHeight: 360 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;