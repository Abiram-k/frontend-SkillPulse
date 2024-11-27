import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectCheckout = ({ children }) => {
  const checkoutItems = useSelector((state) => state.users.checkoutItems);
  if (!checkoutItems.length) return <Navigate to="/user/cart" />;
  return children;
};
export default ProtectCheckout;
