import React, { useEffect, useState } from "react";
import axiosInstance from "@/axiosIntercepters/AxiosInstance";
import { showToast } from "@/Components/ToastNotification";
import { useSelector } from "react-redux";

const Button = ({ children, variant, className }) => (
  <button
    className={`px-4 py-2 rounded ${
      variant === "outline"
        ? "border border-gray-700"
        : "bg-blue-600 text-white"
    } ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className }) => (
  <div className={`bg-gray-200 rounded-lg shadow ${className} text-black`}>
    {children}
  </div>
);

export default function AdminOrderDetail() {
  const [order, setOrder] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const orderId = useSelector((state) => state.admins.adminorderDetails);
  useEffect(() => {
    (async () => {
      setSpinner(true);

      try {
        const response = await axiosInstance.get(`/order/details/${orderId}`);
        setOrder(response.data.orderDetails);
        console.log(response.data.orderDetails);
        setSpinner(false);
      } catch (error) {
        setSpinner(false);
        console.log(error);
        showToast("error", "Failed to fetch order details");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen  p-4 md:p-6 font-mono text-black">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
        <Card className="p-4">
          <h2 className="text-lg font-semibold">Order ID: {order.orderId}</h2>
          <p className="text-sm">Order Date: {order?.orderDate}</p>
          <p className="text-sm">
            Total Amount: ₹{order.totalAmount?.toFixed(2)}
          </p>
          <p className="text-sm">
            Total Discount: ₹
            {(order.totalAmount - order.totalDiscount).toFixed(2)}
          </p>
          {order.deliveryCharge && (
            <p className="text-sm">Delivery charge: ₹{order?.deliveryCharge}</p>
          )}
          <p className="text-sm">
            Total Paid Amount: ₹{order.totalDiscount?.toFixed(2)}
          </p>
          <p className="text-sm">Payment Status: {order?.paymentStatus}</p>
          <h3 className="text-md font-semibold mt-4">Delivery Address:</h3>
          <p className="text-sm">
            {order?.address?.firstName} {order.address?.secondName}
          </p>
          <p className="text-sm">{order.address?.address}</p>
          <p className="text-sm">
            {order.address?.city}, {order.address?.state},{" "}
            {order.address?.pincode}
          </p>
          <p className="text-sm">Phone: {order.address?.mobileNumber}</p>
          <h3 className="text-md font-semibold mt-4 mb-5">Order Items:</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {order.orderItems?.map((item, idx) => (
              <div
                key={idx}
                className="border border-gray-300 rounded-lg p-4  bg-gray-300 shadow-md hover:scale-105 duration-300"
              >
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 mb-4">
                    <img
                      src={item.product?.productImage[0] || "/placeholder.svg"}
                      alt={item.product?.productName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">
                    {item.product?.productName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.product?.category?.name || "Category: N/A"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.product?.brand?.name || "Brand: N/A"}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-lg font-bold text-gray-800">
                      ₹
                      {item.discountPrice?.toFixed(2) || item.price?.toFixed(2)}
                    </span>
                    {item.discountPrice && (
                      <span className="text-sm line-through text-gray-500">
                        ₹{item.price?.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {item.discountPrice && (
                    <p className="text-sm text-green-600 mt-1">
                      Discount: ₹{(item.price - item.discountPrice)?.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
        {/* )) */}
        {/* ) : (
          <p className="text-center text-gray-600">No orders found.</p>
        )} */}
      </div>
    </div>
  );
}
