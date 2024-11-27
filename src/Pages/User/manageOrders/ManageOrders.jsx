import { responsive } from "@cloudinary/react";
import axios from "@/axiosIntercepters/AxiosInstance";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./manageOrder.css";
import { Toast } from "@/Components/Toast";
import { logoutUser } from "@/redux/userSlice";
import AlertDialogueButton from "@/Components/AlertDialogueButton";
import { showToast } from "@/Components/ToastNotification";
import axiosInstance from "@/axiosIntercepters/AxiosInstance";
import Razorpay from "../paymentComoponent/RazorPay";
import { Link } from "react-router-dom";
import { ReturnProduct } from "@/Components/ReturnProduct";
import { ArrowDown } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { normal } from "@cloudinary/url-gen/qualifiers/textDecoration";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [cartItems, setCartItems] = useState({});
  const dispatch = useDispatch();

  const user = useSelector((state) => state.users.user);

  useEffect(() => {
    // if (orders.length == 0) {
    (async () => {
      try {
        const response = await axios.get(`/order?id=${user._id}`);
        setOrders(response.data?.orderData);
      } catch (error) {
        if (error?.response.data.isBlocked) {
          dispatch(logoutUser());
        }
        console.log(error.message);
      }
    })();
    // }
  }, [refresh, orders]);

  const handleCancelOrder = async (item) => {
    try {
      const response = await axios.patch(
        `/cancelOrder?id=${user._id}&itemId=${item._id}`
      );
      showToast("success", `${response.data.message}`);

      setRefresh((prev) => prev + 1);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: `${error?.response?.data.message}`,
      });
    }
  };

  const getStatusColor = (status) => {
    if (status == "processing") return "text-yellow-500";
    if (status === "shipped") return "text-blue-500";
    if (status == "delivered") return "text-green-500";
    if (status === "pending") return "text-orange-500";
    if (status === "cancelled") return "text-red-500";
    if (status === "returned") return "text-red-500";
    return "text-gray-500";
  };

  const filteredOrders = search
    ? orders
        .map((order) => {
          const matchesOrderId = order.orderId
            .toLowerCase()
            .includes(search.toLowerCase());

          const matchesFilteredItems = order.orderItems.filter(
            (item) =>
              item.product.productName
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              item.product.category.name
                .toLowerCase()
                .includes(search.toLowerCase())
          );

          if (matchesOrderId || matchesFilteredItems.length > 0) {
            return {
              ...order,
              orderItems: matchesOrderId
                ? order.orderItems
                : matchesFilteredItems,
            };
          }
          return null;
        })
        .filter(Boolean)
    : orders;

  const handlePlaceOrder = async (paymentFailed, orderId) => {
    const orderForRetry = orders?.filter(
      (order, index) => order?._id.toString() == orderId
    );
    try {
      const response = await axiosInstance.post(
        `/order/${user._id}`,
        { checkoutItems: orderForRetry },
        {
          params: {
            isRetryPayment: true,
            paymentFailed,
            paymentMethod: "Razorpay",
            totalAmount: orderForRetry[0]?.totalDiscount,
            appliedCoupon: orderForRetry[0]?.appliedCoupon?._id || null,
          },
        }
      );
      showToast("success", `${response?.data.message}`);
    } catch (error) {
      showToast("error", `${error?.response?.data.message}`);
    }
  };

  const handleDownloadInvoice = (orderId) => {
    const order = orders.find((order) => order._id.toString() === orderId);
    if (!order) {
      alert("Order not found");
      return;
    }
    const doc = new jsPDF();

    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 210, 297, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Order Invoice", 14, 20);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(18);
    doc.text("Delivery Address:", 120, 20);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.orderId}`, 14, 30);
    doc.text(`Customer Name: ${order.address.firstName}`, 14, 40);
    doc.text(`Order Date: ${order.orderDate}`, 14, 50);
    doc.text(`Total Amount: Rs. ${order.totalAmount.toFixed(2)}`, 14, 60);

    doc.setFontSize(10);
    doc.text(`${order.address.firstName} ${order.address.lastName}`, 120, 30);
    const addressLines = doc.splitTextToSize(order.address.address, 50);
    doc.text(addressLines, 120, 35);
    doc.text(
      `${order.address.city}, ${order.address.state}`,
      120,
      45 + (addressLines.length - 1) * 5
    );
    doc.text(
      `Pincode: ${order.address.pincode}`,
      120,
      50 + (addressLines.length - 1) * 5
    );
    doc.text(
      `Phone: ${order.address.mobileNumber}`,
      120,
      55 + (addressLines.length - 1) * 5
    );

    const headers = [["Item", "Quantity", "Price", "Total"]];

    const rows = order.orderItems.map((item) => [
      item.product.productName,
      item.quantity,
      `Rs. ${item.price.toFixed(2)}`,
      `Rs. ${(item.quantity * item.price).toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: 70,
      head: headers,
      body: rows,
      styles: { fillColor: [230, 230, 250] },
      headStyles: { textColor: [255, 255, 255], fillColor: [0, 102, 204] },
      margin: { top: 10 },
    });

    const footerY = doc.lastAutoTable.finalY + 10;
    const columnX = 14;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Summary", columnX, footerY);

    doc.setFont("Helvetica", "normal");
    const footerData = [
      ["Delivery Charge:", `Rs. ${order.deliveryCharge ? deliveryCharge : 0}`],
      ["Tax:", `Rs. ${"100.00"}`],
      ["Total Amount:", `Rs. ${order.totalAmount.toFixed(2)}`],
      [
        "Discount Amount:",
        `Rs. ${
          order.discountAmount
            ? (order.totalAmount - order.discountAmount).toFixed(2)
            : "0.00"
        }`,
      ],
    ];

    footerData.forEach((item, index) => {
      doc.text(item[0], columnX, footerY + 10 + index * 6);
      doc.text(item[1], columnX + 100, footerY + 10 + index * 6);
    });

    doc.setFont("Helvetica", "italic");
    doc.setFontSize(12);
    doc.text(`Thank you for your purchase!`, 14, footerY + 40);
    doc.save(`Invoice_${order.orderId}.pdf`);
  };

  return (
    // <div className="flex">
    <main className="w-full lg:w-full p-4 font-mono h-screen overflow-y-scroll no-scrollbar">
      <h1 className="text-xl lg:text-3xl uppercase font-bold mb-4 lg:mb-14">
        Manage your orders
      </h1>
      <div
        className="flex flex-col lg:flex-row mb-4 lg:mb-10 transition-all duration-75 gap-2"
        style={{ fontfamily: "Montserrat" }}
      >
        <input
          type="text"
          className="flex-grow p-2 rounded bg-transparent border-2 lg:border-4 text-white border-gray-600 focus:outline-none"
          placeholder="Search your Orders using Order ID, product and category"
          value={search}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (inputValue.length <= 10) {
              setSearch(inputValue);
            }
          }}
        />
      </div>

      <div className="space-y-6">
        {orders.length > 0 ? (
          filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div className="border-y border-gray-500 p-4 lg:p-6 rounded-lg shadow-md space-y-4 lg:space-y-6 bg-light-red">
                <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row justify-between items-start lg:items-center text-xs lg:text-base gap-4">
                  <div className="font-medium">
                    <strong>Order Date:</strong> {order.orderDate}
                  </div>
                  <div
                    className={`font-semibold ${
                      order.paymentStatus !== "Failed"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <strong>Status:</strong>{" "}
                    {order.paymentStatus !== "Failed"
                      ? "Paid"
                      : "Payment Failed"}
                  </div>
                  {order.paymentStatus === "Failed" && (
                    <div className="w-full lg:w-fit">
                      <Razorpay
                        name="Retry"
                        orderId={order?._id}
                        PayAmount={
                          order.totalDiscount
                            ? parseInt(order.totalDiscount)
                            : parseInt(order.totalAmount)
                        }
                        handlePlaceOrder={handlePlaceOrder}
                        retry={true}
                      />
                    </div>
                  )}
                  <div>
                    <strong>Order Number:</strong> {order.orderId}
                  </div>
                  <div>
                    <strong>Ship To:</strong> {order.address.firstName}
                  </div>
                  <div className="font-semibold">
                    <strong>Total:</strong> ₹{" "}
                    {order.totalDiscount > 0
                      ? order.totalDiscount.toFixed(0)
                      : order.totalAmount.toFixed(0)}
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  {order.orderItems.map((item) => (
                    <div className="bg-gray-800 p-4 lg:p-6 rounded-lg shadow-inner">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
                        <img
                          src={
                            item.product.productImage[0] ||
                            "https://placehold.co/100x100"
                          }
                          alt="Product"
                          className="w-16 h-16 lg:w-24 lg:h-24 object-cover rounded-md"
                        />
                        <div className="space-y-2">
                          <div className="text-xs lg:text-base">
                            <strong>Category:</strong>{" "}
                            {item.product.category.name}
                          </div>
                          <div className="text-xs lg:text-base">
                            <strong>Total Price:</strong> ₹ {item.totalPrice}{" "}
                            <span className="text-xs">inc GST</span>
                          </div>
                          {order.appliedCoupon && (
                            <div className="text-xs lg:text-base">
                              <strong>Coupon Discount:</strong>{" "}
                              <span className="text-green-500">
                                ₹{(item.totalPrice - item.price).toFixed(0)}
                              </span>
                            </div>
                          )}
                          <div className="text-xs lg:text-base">
                            <strong>Qty:</strong> {item.quantity}
                          </div>
                          <div className="text-sm lg:text-lg font-semibold">
                            {item.product.productName}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
                        <div className="text-xs lg:text-base">
                          <strong>Status:</strong>{" "}
                          <span
                            className={`${getStatusColor(item.productStatus)}`}
                          >
                            {item.productStatus}
                          </span>
                        </div>

                        <div className="text-xs lg:text-base">
                          <strong>Date:</strong> {order.orderDate}
                        </div>
                        {item.productStatus !== "shipped" &&
                          item.productStatus !== "delivered" &&
                          item.productStatus !== "cancelled" &&
                          item.productStatus !== "returned" &&
                          order.paymentStatus !== "Failed" && (
                            <div className="bg-red-500 text-white p-2 rounded">
                              <AlertDialogueButton
                                name="Cancel"
                                onClick={() => handleCancelOrder(item)}
                              />
                            </div>
                          )}
                          
                        {item.productStatus === "delivered" &&
                          item.returnDescription === "" && (
                            <div className="bg-red-500 text-white p-2 rounded-md">
                              <ReturnProduct item={item} />
                            </div>
                          )}
                        {item.productStatus !== "returned" &&
                          item.returnDescription && (
                            <p className="text-orange-600">
                              Return in progress...
                            </p>
                          )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center lg:text-end flex justify-center lg:justify-end">
                  {order.status === "delivered" && (
                    <button
                      className="border border-gray-500 text-gray-300 hover:bg-gray-700 p-2 lg:p-3 rounded-md hover:scale-105 duration-150 flex items-center gap-2"
                      onClick={(e) => handleDownloadInvoice(order._id)}
                    >
                      <ArrowDown />
                      Download Invoice
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-800 p-4 lg:p-6 rounded-lg text-center">
              <h2 className="text-sm lg:text-base">
                No results found for "{search}"
              </h2>
            </div>
          )
        ) : (
          <div className="bg-gray-800 p-4 lg:p-6 rounded-lg text-center">
            <h2 className="text-sm lg:text-base">No orders found</h2>
          </div>
        )}
      </div>
    </main>

    // </div>
  );
};

export default ManageOrders;
