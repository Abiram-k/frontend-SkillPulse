import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";

const ProtectedOrderDetails = ({ children }) => {
  const orderId = useSelector((state) => state.users.orderId);

  if (!orderId) {
    return <Navigate to="/user/profile/myOrders" />;
  } else {
    return children;
  }
};

export default ProtectedOrderDetails;
