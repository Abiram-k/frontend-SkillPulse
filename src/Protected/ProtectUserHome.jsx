import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
function ProtectUserHome({ children }) {
  const user = useSelector((state) => state.users.user);
  if (!user) return <Navigate to={"/login"} />;
  return children
}

export default ProtectUserHome;
