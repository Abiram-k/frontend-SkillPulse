import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedAuthAdmin = ({ children }) => {
  const admin = useSelector((state) => state.admins.admin);
  console.log(admin);
  if (admin) return <Navigate to="/admin/dashboard" />;
  return children;
};

export default ProtectedAuthAdmin;
