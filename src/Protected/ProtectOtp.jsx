import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedOtp = ({ children }) => {
  const signUpSuccess = useSelector((state) => state.users.signUpSuccess);
  if (!signUpSuccess) return <Navigate to={"/signup"} />;
  return children;
};

export default ProtectedOtp;
