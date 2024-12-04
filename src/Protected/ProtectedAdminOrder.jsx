import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";

const ProtectedAdminOrder = ({ children }) => {
  const orderId = useSelector((state) => state.admins.adminorderDetails);
// alert(orderId)
  if (!orderId) {
    return <Navigate to="/admin/orders" />;
  } else {
    return children;
  }
};

export default ProtectedAdminOrder;
