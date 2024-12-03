import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import axiosInstance from "@/axiosIntercepters/AxiosInstance";
import { showToast } from "@/Components/ToastNotification";

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

export default function OrderTrackingPage({ orderId }) {
  const [order, setOrder] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const response = await axiosInstance.get(`/order/details/${orderId}`);

        setOrder(response.data.orderDetails);
        console.log(response.data.orderDetails);
      } catch (error) {
        console.log(error);
        showToast("error", "Failed to fetch order details");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 font-mono">
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
              {order.appliedCoupon && (
                <div className="flex items-start gap-3">
                  <span className="text-yellow-500">🏅</span>
                  <div>
                    <p className="font-medium">
                      {order.totalPrice - order.discountPrice} Discount applied
                    </p>
                    <p className="text-sm text-gray-600">
                      Use it to save on your next order
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-primary">⚡</span>
                <div>
                  <p className="font-medium">Fast Delivery on Sale</p>
                  <p className="text-sm text-gray-600">
                    For All Skillpulse Users
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="mb-4 text-lg font-semibold">More actions</h2>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Invoice
              </span>
              <span className="text-blue-400">Download</span>
            </Button>
          </Card>
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
                </div>
              </Card>
            </>
          ))}
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
      </div>
    </div>
  );
}
