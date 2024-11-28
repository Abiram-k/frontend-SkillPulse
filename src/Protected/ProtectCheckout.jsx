import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectCheckout = ({ children }) => {
  const checkoutItems = useSelector((state) => state.users.checkoutItems);
  console.log("CHECKOUT ITEMS", checkoutItems);
  alert(checkoutItems)
  if (checkoutItems.length == 0) return <Navigate to="/user/cart" />;
  else return children;
};
export default ProtectCheckout;
