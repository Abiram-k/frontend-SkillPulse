import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import axiosInstance from "@/axiosIntercepters/AxiosInstance";
import { showToast } from "@/Components/ToastNotification";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import "jspdf-autotable";
import AlertDialogueButton from "@/Components/AlertDialogueButton";
import axios from "@/axiosIntercepters/AxiosInstance";

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
  <div className={`bg-gray-900 rounded-lg shadow ${className}`}>{children}</div>
);

export default function OrderTrackingPage() {
  const [order, setOrder] = useState({});
  const [spinner, setSpinner] = useState(false);
  const orderId = useSelector((state) => state.users.orderId);
  const user = useSelector((state) => state.users.user);

  useEffect(() => {
    (async () => {
      setSpinner(true);
      try {
        const response = await axiosInstance.get(`/order/details/${orderId}`);
        setOrder(response.data.orderDetails);
        setSpinner(false);
      } catch (error) {
        setSpinner(false);
        console.log(error);
        showToast("error", "Failed to fetch order details");
      }
    })();
  }, []);

  const handleDownloadInvoice = () => {
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
      [
        "Delivery Charge:",
        `Rs. ${order?.deliveryCharge ? order?.deliveryCharge : 0}`,
      ],
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

  const handleCancelOrder = async () => {
    try {
      const response = await axios.patch(
        `/cancelOrder?id=${order._id}`
      );
      // const response = await axios.patch(
      //   `/cancelOrder?id=${order._id}&userId=${user._id}`
      // );
      showToast("success", `${response.data.message}`);

      window.location.reload();
      Toast.fire({
        icon: "success",
        title: "Order cancelled",
      });
    } catch (error) {
      console.log(error);
      Toast.fire({
        icon: "error",
        title: `${error?.response?.data.message}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 font-mono">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-4">
            <h2 className="mb-4 text-lg font-semibold">Delivery Address</h2>
            <div className="space-y-2">
              <p className="font-medium">{order.address?.firstName}</p>
              <p className="text-sm text-gray-200">
                {order.address?.address},{order.address?.pincode},
                {order.address?.city},{order.address?.state}
              </p>
              <div className="mt-4">
                <p className="text-sm">
                  <span className="font-medium">Phone number:</span>{" "}
                  {order.address?.mobileNumber}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="mb-4 text-lg font-semibold">Your Rewards</h2>
            <div className="space-y-4">
              {order?.paymentStatus == "Success" && order?.appliedCoupon && (
                <div className="flex items-start gap-3">
                  <span className="text-yellow-500">🏅</span>
                  <div>
                    <p className="font-medium">
                      ₹
                      {parseInt(order?.totalAmount) -
                        parseInt(order?.totalDiscount)}{" "}
                      Discount applied
                    </p>
                    <p className="text-sm text-gray-600">
                      Use it to save on your next order
                    </p>
                  </div>
                </div>
              )}
              {/* {order?.paymentStatus == "Success" && ( */}
                <div className="flex items-start gap-3">
                  <span className="text-primary">⚡</span>
                  <div>
                    <p className="font-medium">Fast Delivery on Sale</p>
                    <p className="text-sm text-gray-600">
                      For All Skillpulse Users
                    </p>
                  </div>
                </div>
              {/* )} */}
            </div>
          </Card>
          {order.paymentStatus == "Success" &&
            order?.status == "processing" && (
              <div className="bg-red-500 text-white p-2 rounded w-fit h-fit">
                <AlertDialogueButton
                  name="Cancel"
                  onClick={() => handleCancelOrder()}
                />
              </div>
            )}
          {order?.paymentStatus == "Success" &&
            order?.status == "delivered" && (
              <Card className="p-4">
                <h2 className="mb-4 text-lg font-semibold">More actions</h2>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Invoice
                  </span>
                  <span
                    className="text-blue-400"
                    onClick={handleDownloadInvoice}
                  >
                    Download
                  </span>
                </Button>
              </Card>
            )}
        </div>
        {order.orderItems?.length > 0 &&
          order.orderItems?.map((item, index) => (
            <>
              <Card className="p-4">
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="flex gap-4 md:w-1/3">
                    <div className="h-24 w-24 flex-shrink-0">
                      <img
                        src={
                          item.product?.productImage[0] || "/placeholder.svg"
                        }
                        alt={item.product.productName}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {item.product.productName}
                      </h3>
                      <p className="text-sm text-gray-200">
                        Category: {item.product.category.name}
                      </p>
                      <p className="text-sm text-gray-200">
                        Brand: {item.product.brand.name}
                      </p>
                      <p className="mt-2 font-medium">
                        ₹{item.discountPrice || item.totalPrice}{" "}
                        <span className="text-green-600 text-sm">
                          {order.appliedCoupon && "Coupon applied"}
                        </span>
                      </p>
                    </div>
                  </div>
                  {order?.paymentStatus == "Success" ? (
                    <div className="md:w-2/3">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white text-2xl">
                          ✓
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-600">
                            {item.productStatus}
                          </h3>
                          <p className="text-sm text-gray-200">Wed, 14th Aug</p>
                        </div>
                      </div>
                      <p className="mt-4 text-green-600">
                        Your item has been {item.productStatus}
                      </p>
                    </div>
                  ) : (
                    <h3 className="text-lg font-semibold text-red-600">
                      Payment {order?.paymentStatus || "Not completed"} ⚠️
                    </h3>
                  )}
                </div>
              </Card>
            </>
          ))}
        {order?.paymentStatus == "Success" && (
          <div className="flex items-center gap-2 flex-col md:flex-row">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Delivery was made with verification
            </div>
            <p className="text-gray-400 tex-md">[ {order?.status} ]</p>
          </div>
        )}
      </div>
    </div>
  );
}
