import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChangeAddress } from "@/Components/ChangeAddress";
import { Check, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "@/Components/Toast";
import { logoutUser } from "@/redux/userSlice";
import axios from "@/axiosIntercepters/AxiosInstance";
import { CouponPopup } from "@/Components/CouponPopup";
import axiosInstance from "@/axiosIntercepters/AxiosInstance";
import Razorpay from "../paymentComoponent/RazorPay";
import { showToast } from "@/Components/ToastNotification";

const Checkout = () => {
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedAddress, setSelectedAddress] = useState({});
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const checkoutItems = useSelector((state) => state.users.checkoutItems);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.user);
  const [addresses, setAddresses] = useState([]);
  const [summary, setSummary] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [walletData, setWalletData] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedCoupons, setSelectedCoupon] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [trigger, setTrigger] = useState(0);
  const [spinner, setSpinner] = useState(false);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);
  const totalPrice = () => {
    return cartItems[0]?.products
      .reduce((acc, item) => acc + item.product?.salesPrice * item.quantity, 0)
      .toFixed();
  };

  const calculateDeliveryCharge = () => {
    if (totalPrice() < 14999) return Math.round((2 / 100) * totalPrice());
    else return 0;
  };

  const calculateGST = (gstRate) => {
    return Math.round(
      (gstRate / 100) *
        checkoutItems[0]?.products.reduce(
          (acc, item) => acc + item.product.salesPrice * item.quantity,
          0
        )
    );
  };
  const cartTotalPrice = () => {
    const gstRate = 18;
    const total =
      +totalPrice() +
      //  calculateGST(gstRate) +
        calculateDeliveryCharge();
    return total;
  };

  const calculations = () => {
    const calcs = {};
    calcs.totalItems = checkoutItems[0]?.products?.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    calcs.totalPrice =
      checkoutItems[0]?.totalDiscount === 0
        ? checkoutItems[0]?.grandTotal
        : checkoutItems[0]?.totalDiscount;

    if (calcs?.totalPrice < 1000)
      calcs.deliveryCharge = Math.round((2 / 100) * calcs.totalPrice);
    else calcs.deliveryCharge = 0;

    calcs.GST = Math.round(
      (18 / 100) *
        checkoutItems[0].products.reduce(
          (acc, item) => acc + item.product.salesPrice * item.quantity,
          0
        )
    );

    calcs.checkoutTotal =
      (calcs.totalPrice || 0) + (calcs.deliveryCharge || 0) + (calcs.GST || 0);
    return calcs;
  };

  const offerPrice = (couponAmount = 0, couponType) => {
    const basePrice =
      cartItems[0]?.totalDiscount !== 0
        ? cartItems[0]?.totalDiscount
        : cartItems[0]?.grandTotal;

    const gstRate = 18;
    const totalPrice = Math.abs(
      parseInt(basePrice) +
        // parseInt(calculateGST(gstRate)) +
        parseInt(calculateDeliveryCharge()) -
        parseInt(couponAmount)
    );

    return totalPrice;
  };
  const handleCouponDelete = async () => {
    try {
      setSpinner(true);
      const response = await axiosInstance.patch(
        `/cartCouponRemove/${user._id}`
      );
      setTrigger((prev) => prev + 1);
      setSpinner(false);
      showToast("success", `${response.data.message}`);
    } catch (error) {
      console.log(error);
      setSpinner(false);
      showToast("error", `${error?.response?.data.message}`);
    }
  };
  const handleGetSelectedCoupons = async (
    selectedCoupon,
    maxDiscount,
    minPurchaseAmount,
    couponCode
  ) => {
    setSelectedCoupon(selectedCoupon);
    setMaxDiscount(maxDiscount);
    setMinPurchaseAmount(minPurchaseAmount);
    setCouponCode(couponCode);
    try {
      setSpinner(true);
      const response = await axios.patch(
        `/cartCouponApply?id=${user._id}&couponId=${selectedCoupon}`
      );
      setTrigger((prev) => prev + 1);
      setSpinner(false);
    } catch (error) {
      setSpinner(false);
      console.log(error);
    }
  };
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/cart/${user._id}`);
        setCartItems(response.data.cartItems);
        console.log("CART ITEMS :", response.data.cartItems);
      } catch (error) {
        if (error?.response.data.isBlocked) {
          dispatch(logoutUser());
        }
        console.log(error);
        Toast.fire({
          icon: "error",
          title: `${error?.response?.data.message}`,
        });
      }
    })();

    (async () => {
      try {
        const response = await axios.get(`/wallet/${user._id}`);
        setWalletData(response.data.wallet);
      } catch (error) {
        console.error(error);
      }
    })();
    const calcs = calculations();
    console.log(calcs, "CALCS");
    if (Object.keys(calcs).length > 0) {
      setSummary(calculations());
      return;
    }
  }, [trigger]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `/address?id=${user?._id}${
            selectedAddressId ? `&addrId=${selectedAddressId}` : ""
          }`
        );
        setAddresses(response?.data.addresses);
        setSelectedAddress(response.data.selectedAddress);
      } catch (error) {
        if (
          error?.response.data.isBlocked ||
          error?.response.data.message == "token not found"
        ) {
          dispatch(logoutUser());
        }
        console.log(error);
      }
    })();
  }, [user?._id, selectedAddressId, checkoutComplete]);

  const handleSelectedAddress = (selectedAddress) => {
    setSelectedAddressId(selectedAddress);
  };

  const handlePlaceOrder = async (paymentFailed) => {
    if (
      paymentMethod == "cod" &&
      offerPrice(
        cartItems[0]?.appliedCoupon?.couponAmount,
        cartItems[0]?.appliedCoupon?.couponType
      ) >= 5000
    ) {
      showToast("error", "Cash on delivery is not applicable");
      return;
    }
    if (!selectedAddress) {
      showToast("error", "Add an address");
      return;
    }

    try {
      const response = await axios.post(`/order/${user._id}`, cartItems, {
        params: {
          paymentFailed,
          paymentMethod,
          totalAmount: cartItems[0]?.grandTotal,
          appliedCoupon: cartItems[0]?.appliedCoupon?._id || null,
          deliveryCharge: calculateDeliveryCharge(),
        },
      });
      setCheckoutComplete((prev) => !prev);
      localStorage.removeItem(`cart_${user._id}`);
      localStorage.removeItem("checkoutItems");
      if (paymentFailed && paymentMethod == "Razorpay") {
        showToast("error", `Payment Failed`);
        navigate("/user/profile/myOrders");
      } else {
        showToast("success", `${response?.data.message}`);
      }
    } catch (error) {
      showToast("error", `${error?.response?.data.message}`);
    }
  };
  const handlePaymentMethod = (e) => {
    setPaymentMethod(e.target.value);
  };
  return !checkoutComplete ? (
    <div className="min-h-screen bg-black text-white mt-5 font-mono">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="w-full md:w-2/3">
            <div className="flex flex-col md:flex-row justify-between">
              <h1 className="text-3xl font-bold text-red-600 mb-4 md:mb-0">
                CHECKOUT
              </h1>
              <p className="text-green-500 mt-2 md:mt-0">
                Arrives By Wed, Apr 2024
              </p>
            </div>

            {cartItems[0]?.products.length > 0 ? (
              cartItems[0].products.map((item) => (
                <div
                  className="flex items-start space-x-4 mb-8"
                  key={item.product?._id}
                >
                  <img
                    src={
                      item.product?.productImage[0] ||
                      "/api/placeholder/150/150"
                    }
                    alt="Product"
                    className="w-32 h-32 object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {item.product.productName ||
                        "Pro Based Ear buds, Vortex-continent X-R"}
                    </h3>
                    <p className="text-gray-400">
                      {item.product.productDescription ||
                        "High bass with noise cancellation"}
                    </p>
                    <div className="flex space-x-2">
                      <p className="text-gray-100">
                        {parseFloat(item.offeredPrice).toFixed(0) || 999}
                      </p>
                      <p className="text-gray-500 line-through">
                        {item?.totalPrice || 1999}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span className="mr-4">Quantity:</span>
                      <span>{item?.quantity}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-start space-x-4 mb-8">
                <img
                  src="/api/placeholder/150/150"
                  alt="Product"
                  className="w-32 h-32 object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold">
                    Pro Based Ear buds, Vortex-continent X-R
                  </h3>
                  <p className="text-gray-400">
                    High bass with noise cancellation
                  </p>
                  <p className="text-green-500 mt-4">
                    Arrives By Wed, Apr 2024
                  </p>
                  <div className="mt-2 flex items-center">
                    <span className="mr-4">Quantity:</span>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="bg-gray-800 rounded px-2 py-1"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Delivery Address</h2>
                {addresses.length > 0 && (
                  <ChangeAddress
                    addresses={addresses}
                    onSelectedAddress={handleSelectedAddress}
                  />
                )}
              </div>
              {Object.keys(selectedAddress).length === 0 ? (
                <div className="bg-gray-900 p-4 rounded">
                  <Link
                    to={"/user/profile/addNew"}
                    className="lg:p-3 p-2 text-white rounded bg-blue-500 font-semibold"
                  >
                    Add Address
                  </Link>
                  {Object.keys(selectedAddress || {}).length === 0 && (
                    <p className="text-orange-500 mt-3 lg:mt-5">
                      {"Add address before proceeding to place order !"}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-900 p-4 rounded">
                  <div className="mb-4">
                    <p className="font-semibold bg-gray-300 rounded px-3 py-1 text-black inline-block text-center">
                      {selectedAddress?.type}
                    </p>
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p>{selectedAddress?.address}</p>
                    <p>
                      {selectedAddress?.city}, {selectedAddress?.state}
                    </p>
                    <p>{selectedAddress?.pincode}</p>
                    <p>Mobile: +91 {selectedAddress?.mobileNumber}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="payment"
                    value="Razorpay"
                    checked={paymentMethod == "Razorpay"}
                    onChange={handlePaymentMethod}
                  />
                  <span>Razorpay</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod == "cod"}
                    onChange={handlePaymentMethod}
                  />
                  <span>Cash on Delivery</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod == "wallet"}
                    onChange={handlePaymentMethod}
                  />
                  <span>Wallet</span>
                </label>
                {paymentMethod == "wallet" && (
                  <div className="flex flex-col gap-2">
                    <p>
                      Wallet balance :
                      <span className="text-green-500">
                        {" "}
                        ₹{" "}
                        {walletData.totalAmount
                          ? walletData.totalAmount.toFixed(2)
                          : "0"}
                      </span>
                    </p>
                    <p>
                      Product Amount :
                      <span
                        className={`${
                          walletData.totalAmount <
                          offerPrice(
                            cartItems[0]?.appliedCoupon?.couponAmount,
                            cartItems[0]?.appliedCoupon?.couponType
                          ).toFixed()
                            ? "text-red-600"
                            : "text-green-500"
                        }`}
                      >
                        {" "}
                        ₹{" "}
                        {offerPrice(
                          cartItems[0]?.appliedCoupon?.couponAmount,
                          cartItems[0]?.appliedCoupon?.couponType
                        ).toFixed()}
                      </span>
                    </p>
                    {walletData.totalAmount <
                      offerPrice(
                        cartItems[0]?.appliedCoupon?.couponAmount,
                        cartItems[0]?.appliedCoupon?.couponType
                      ).toFixed() && (
                      <p className="text-red-600">
                        Insufficient wallet balance, Try different payment
                        method !
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row space-x-0 md:space-x-4">
              {paymentMethod != "Razorpay" && (
                <button
                  className={
                    " text-white px-8 py-3 rounded w-full bg-red-600 mb-4 md:mb-0 cursor-pointer"
                  }
                  onClick={handlePlaceOrder}
                  disabled={
                    paymentMethod == "wallet" &&
                    walletData.totalAmount <
                      offerPrice(
                        cartItems[0]?.appliedCoupon?.couponAmount,
                        cartItems[0]?.appliedCoupon?.couponType
                      ).toFixed()
                  }
                >
                  Place order
                </button>
              )}
              {/* <p className="text-green-500 font-bold">{selectedAddress}</p> */}
              {paymentMethod == "Razorpay" && (
                <div className="w-full">
                  <Razorpay
                    orderId={cartItems[0]?._id}
                    PayAmount={parseInt(
                      offerPrice(
                        cartItems[0]?.appliedCoupon?.couponAmount,
                        cartItems[0]?.appliedCoupon?.couponType
                      )
                    )}
                    handlePlaceOrder={handlePlaceOrder}
                    isAddressSelected={selectedAddress}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="w-full md:w-80 ">
            <div className="bg-red-600 text-center text-white p-4 rounded mb-4 hidden lg:block">
              Checkout Details
            </div>
            <div className="bg-pink-50 text-black p-6 rounded">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>
                    {checkoutItems[0]?.products?.reduce(
                      (acc, item) => item.quantity + acc,
                      0
                    )}{" "}
                    Items
                  </span>
                  <span>{totalPrice()} ₹</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-green-600">
                    {totalPrice() > 1000
                      ? "Free"
                      : calculateDeliveryCharge() + " ₹"}
                  </span>
                </div>
                {/* {<div className="flex justify-between">
                  <span>GST Amount (18%)</span>
                  <span>{calculateGST(18)} ₹</span>
                </div>} */}

                {cartItems[0]?.appliedCoupon && (
                  <div className="flex justify-between">
                    <div className="flex gap-2 items-center">
                      <span>
                        {cartItems[0].appliedCoupon.couponCode} -(Coupon)
                      </span>
                    </div>
                    <span className="text-green-600">
                      {cartItems[0].appliedCoupon.couponType == "Amount"
                        ? "-" + cartItems[0]?.appliedCoupon.couponAmount
                        : cartItems[0].appliedCoupon.couponAmount + "%"}
                    </span>
                  </div>
                )}
                {cartItems[0]?.appliedCoupon ? (
                  <>
                    <div className="flex justify-between font-bold border-gray-200">
                      <span>Sub Total</span>
                      <span>{cartTotalPrice()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-mono">Saved Amount </span>{" "}
                      <span className="text-green-500">
                        -
                        {Math.round(
                          parseFloat(
                            cartItems[0]?.grandTotal -
                              cartItems[0]?.totalDiscount
                          )
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold pt-3 border-t border-gray-200">
                      <span>Payable Amount</span>
                      <span>
                        {offerPrice(
                          cartItems[0]?.appliedCoupon?.couponAmount,
                          cartItems[0]?.appliedCoupon?.couponType
                        )}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between font-bold border-gray-200">
                    <span>Payable Amount</span>
                    <span>{cartTotalPrice()}</span>
                  </div>
                )}
              </div>
              {cartItems[0]?.appliedCoupon ? (
                <>
                  <button className="w-full bg-red-200 font-bold  text-green-600 py-2 rounded mt-6  flex items-center justify-around cursor-default">
                    <div className="flex lg:gap-1">
                      Coupon Applied
                      <Check className="text-xs" />{" "}
                    </div>
                    <i
                      className="fas fa-trash cursor-pointer text-red-500 "
                      onClick={() => handleCouponDelete(selectedCoupons)}
                    ></i>
                  </button>
                </>
              ) : (
                <button
                  className="w-full bg-red-600 text-white py-2 rounded mt-6 hover:bg-red-700"
                  onClick={openPopup}
                >
                  APPLY Coupon
                </button>
              )}
              <div className="relative">
                {isPopupOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <CouponPopup
                      onClose={closePopup}
                      getCoupons={handleGetSelectedCoupons}
                      totalAmount={totalPrice()}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <main className="flex-grow flex flex-col items-center  text-center p-4 h-screen space-y-3.5 lg:mt-28">
      <div className="bg-gray-800 rounded px-6 py-2 mb-4">
        <span className="text-xl font-bold">Order Completed</span>
        <span className="block text-green-500 ">Arriving By Wed, Apr 2024</span>
      </div>
      <Link
        to="/user/profile/myOrders"
        className="bg-gray-200 text-black rounded px-6 py-2 mb-8"
      >
        View order
      </Link>
      <div className="text-6xl text-green-500 mb-4">
        <i className="fas fa-check-circle"></i>
      </div>
      <h1 className="text-2xl font-bold mb-2">Your order is Completed</h1>
      <p className="mb-4 font-mono">
        Thank You for your order, Sit tight we are processing your order we will
        update you with your order in email
      </p>
      <Link
        to={"/user/shop"}
        className="bg-red-600 text-white rounded px-6 py-2"
      >
        Continue Shopping
      </Link>
    </main>
  );
};

export default Checkout;
