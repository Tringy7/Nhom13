import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";

const AdminRoutes = () => {
  const { auth } = useContext(AuthContext);
  const user = auth?.user;

  if (!auth?.isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (String(user.role || "").toLowerCase() !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
};

export default AdminRoutes;
