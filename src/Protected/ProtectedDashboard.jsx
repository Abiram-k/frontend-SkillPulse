import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";

const ProtectedDashboardAdmin = ({ children }) => {
  const admin = useSelector((state) => state.admins.admin);

  if (!admin) return <Navigate to="/admin/login" />;
  else return children;
};

export default ProtectedDashboardAdmin;
