import axios from "@/axiosIntercepters/AxiosInstance";
import { showToast } from "@/Components/ToastNotification";
import React, { useEffect, useState } from "react";
const API_ID = import.meta.env.VITE_RAZORPAY_ID;
const Razorpay = ({
  name,
  orderId,
  PayAmount,
  handlePlaceOrder,
  isAddressSelected = null,
  retry = false,
}) => {
  const [razorpayOrderId, setRazorpayOrderId] = useState(null);

  useEffect(() => {
    if (!isNaN(PayAmount) && PayAmount > 0) {
      const fetchOrderId = async () => {
        try {
          const response = await axios.post("/create-razorpay-order", {
            orderId,
            amount: PayAmount,
          });
          setRazorpayOrderId(response.data.orderId);
        } catch (error) {
          // alert(error);
          // console.error(error);
        }
      };
      fetchOrderId();
    }
  }, [orderId, PayAmount]);

  const handlePayment = () => {
    const options = {
      key: API_ID,
      amount: PayAmount * 100,
      currency: "INR",
      name: "Skill Pulse",
      height: "auto",
      order_id: razorpayOrderId,
      description: "Skill Pulse Order Transaction",
      handler: async (response) => {
        try {
          const res = await axios.post(
            "/verify-payment",
            {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              actuallOrder: orderId,
              retry,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          handlePlaceOrder(false, orderId);
        } catch (error) {
          alert("Payment verification failed. Please try again.");
        }
      },
      prefill: {
        name: "Abiram k",
        email: "Abiram@gmail.com",
        contact: "93242353243",
      },
      theme: {
        color: "red",
      },
    };
    const razorpayInstance = new window.Razorpay(options);

    razorpayInstance.on("payment.failed", (response) => {
      handlePlaceOrder(true, orderId);
    });
    if (!isAddressSelected?.firstName && !retry) {
      showToast("error", "Add delivery address");
      return;
    }

    if (isAddressSelected?.firstName || retry) {
      razorpayInstance.open();
    } else {
      alert("Order failed");
    }
  };

  return (
    <div className="flex flex-col md:flex-row space-x-0 md:space-x-4">
      <button
        onClick={handlePayment}
        disabled={!orderId}
        className={`${
          name
            ? "bg-green-500 p-1 lg:p-2 rounded"
            : "bg-red-600  text-white px-8 py-3 rounded-md w-full  mb-4 md:mb-0 cursor-pointer"
        }`}
      >
        {name || "Place order"}
      </button>
    </div>
  );
};

export default Razorpay;
