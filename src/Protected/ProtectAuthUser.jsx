import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function ProtectAuthUser({ children }) {
  const user = useSelector((state) => state.users.user);
  if (user) 
    return <Navigate to="/user/home" />;
  return children;
}
export default ProtectAuthUser;
