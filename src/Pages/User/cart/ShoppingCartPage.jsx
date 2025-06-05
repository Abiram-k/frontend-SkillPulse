import React, { useEffect, useState } from "react";
import { Trash2, Search, Heart, ShoppingCart, User, Check } from "lucide-react";
import { Toast } from "@/Components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { checkoutItems, logoutUser } from "@/redux/userSlice";
import AlertDialogueButton from "@/Components/AlertDialogueButton";
import axios from "@/axiosIntercepters/AxiosInstance";
import { showToast } from "@/Components/ToastNotification";

const ShoppingCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [trigger, setTrigger] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [maxDiscount, setMaxDiscount] = useState("");
  const [spinner, setSpinner] = useState(false);
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.users.user);
  const [selectedCoupons, setSelectedCoupons] = useState("");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [isDelete, setIsDelete] = useState(false);

  useEffect(() => {
    setCouponMessage("");
    (async () => {
      try {
        const response = await axios.get(`/cart/${user._id}`);
        setCartItems(response?.data.cartItems);
        console.log("Cart items: ", response?.data.cartItems);
      } catch (error) {
        if (
          error?.response.data.isBlocked ||
          error?.response.data.message == "token not found"
        ) {
          dispatch(logoutUser());
        }
        console.log(error);
        showToast("error", error?.response?.data.message);
      }
    })();
  }, [trigger]);

  const removeItem = async (id) => {
    try {
      const response = await axios.delete(`/cartItem/${id}`, {
        params: {
          userId: user._id,
        },
      });
      setTrigger((t) => t + 1);
      setSelectedCoupons("");
      const alreadyHaveProducts =
        JSON.parse(localStorage.getItem(`cart_${user._id}`)) || [];
      const updatedProducts = alreadyHaveProducts.filter(
        (product) => product !== id
      );
      localStorage.setItem(`cart_${user._id}`, JSON.stringify(updatedProducts));
      showToast("success", response.data.message);
    } catch (error) {
      console.log(error);
      showToast("error", error?.response?.data.message);
    }
  };

  const updateQuantity = async (productId, value) => {
    const item = cartItems[0]?.products.find(
      (item) => item.product._id === productId
    );
    if (item) {
      const newQuantity = item.quantity + value;
      const availableQuantity = item.product.units;
      if (newQuantity >= 1) {
        if (newQuantity <= 5) {
          if (newQuantity <= availableQuantity || value == -1) {
            try {
              setSpinner(true);
              const response = await axios.post(
                `/updateQuantity/${productId}`,
                {},
                { params: { userId: user._id, value } }
              );
              setSpinner(false);
              setTrigger((t) => t + 1);
            } catch (error) {
              setSpinner(false);
              showToast(
                "error",
                error?.response?.data?.message || "Failed to update quantity"
              );
              setCouponMessage(error?.response.data?.couponMessage);
              console.log(error);
            }
          } else {
            showToast(
              "error",
              `Already added all available (${item.product.units}) stocks`
            );
          }
        }
      } else {
        const userConfirmed = confirm("Product will remove from your cart");
        let id = productId;
        if (userConfirmed) await removeItem(id);
        else return;
      }
    } else {
      alert("No Cart Item Were Founded");
    }
  };

  console.log("CARTTTT : ", cartItems);
  const handleCheckout = () => {
    if (!cartItems || !cartItems.length || !cartItems[0].products.length) {
      showToast("error", "Add some items and checkout");
      return;
    } else {
      dispatch(checkoutItems(cartItems));
      navigate("/user/checkout");
    }
  };

  const totalPrice = () => {
    return cartItems[0]?.products.reduce(
      (acc, item) => acc + item.product?.salesPrice * item.quantity,
      0
    );
  };

  const calculateDeliveryCharge = () => {
    if (Math.round(totalPrice()) > 1000) return 10;
    else return 0;
  };

  const calculateGST = (gstRate) => {
    return (
      Math.round(
        (gstRate / 100) *
          cartItems[0]?.products.reduce(
            (acc, item) => acc + item.product?.salesPrice * item.quantity,
            0
          )
      ) || 0
    );
  };
  const cartTotalPrice = () => {
    const gstRate = 18;
    const total = totalPrice() + calculateDeliveryCharge();
    return total;
  };

  const offerPrice = (couponAmount = 0, couponType) => {
    const totalPrice = Math.abs(cartItems[0]?.totalDiscount) || 0;
    const gstRate = 18;

    const gstAmount = calculateGST(gstRate) || 0;
    const deliveryCharge = calculateDeliveryCharge() || 0;
    const total = totalPrice + gstAmount + deliveryCharge;
    return isNaN(total) ? 0 : total;
  };

  const handleGetSelectedCoupons = async (
    selectedCoupon,
    maxDiscount,
    minPurchaseAmount,
    couponCode
  ) => {
    setSelectedCoupons(selectedCoupon);
    setMaxDiscount(maxDiscount);
    setMinPurchaseAmount(minPurchaseAmount);
    setCouponCode(couponCode);
    try {
      const response = await axios.patch(
        `/cartCouponApply?id=${user._id}&couponId=${selectedCoupon}`
      );
      setTrigger((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:gap-8 gap-4 justify-center">
          <div className="flex-grow max-w-4xl">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">YOUR CART</h1>
            <p className="mb-6 text-sm lg:text-base">
              Total {cartItems[0]?.products.length} Items In Your Cart
            </p>
            <div className="space-y-4">
              {cartItems[0]?.products.map((item) => (
                <div
                  key={item?.product?._id}
                  className="flex flex-col sm:flex-row items-center bg-gray-900 rounded p-4 space-y-4 sm:space-y-0 sm:space-x-4"
                >
                  <img
                    src={item?.product?.productImage[0] || ""}
                    alt={item?.product?.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <h3 className="text-lg">{item?.product?.productName}</h3>
                    <p className="text-sm mt-2">
                      {item?.product?.productDescription}
                    </p>
                    <p className="text-md mt-2 text-orange-600">
                      {item?.product?.units < 0 && "Out of stock"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <p className="text-xl">
                        ₹ {item.offeredPrice.toFixed(0)}
                      </p>
                      {cartItems[0].appliedCoupon &&
                        parseFloat(item.totalPrice - item.offeredPrice) > 0 && (
                          <p className="text-md line-through text-gray-400">
                            ₹{item?.product?.salesPrice * item?.quantity}
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item?.product._id, -1)}
                        className={`bg-gray-800 px-3 py-1 rounded ${
                          item.quantity == 1 && "text-red-600"
                        }`}
                        disabled={item.quantity == 1}
                      >
                        -
                      </button>
                      <span>{item?.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item?.product._id, 1)}
                        className={`bg-gray-800 px-3 py-1 rounded ${
                          item.quantity == 5 && "text-red-600"
                        }`}
                        disabled={item.quantity == 5}
                      >
                        +
                      </button>
                    </div>
                    <div className="bg-red-600 p-1 rounded flex space-x-1 justify-center">
                      <Trash2 className="w-5 h-5" />
                      <AlertDialogueButton
                        name="Delete"
                        onClick={() => removeItem(item?.product._id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {couponMessage && (
              <p className="text-orange-600 mt-4">{couponMessage}</p>
            )}
            <div className="flex flex-col lg:flex-row lg:gap-3 gap-2 mt-6">
              <button
                className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                onClick={handleCheckout}
              >
                Checkout
              </button>
              <Link
                to={"/user/shop"}
                className="inline-block bg-red-600 text-white text-center px-6 py-2 rounded hover:bg-red-700"
              >
                Continue shopping
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-80">
            <div className="bg-red-600 text-white p-4 rounded mb-2 lg:mb-4">
              Checkout Details
            </div>
            <div className="bg-pink-50 text-black p-6 rounded">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>
                    {cartItems[0]?.products.reduce(
                      (acc, item) => item.quantity + acc,
                      0
                    )}{" "}
                    Items
                  </span>
                  <span>{Math.round(totalPrice()) || 0} ₹</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-green-600">
                    {Math.round(totalPrice()) < 1000
                      ? "Free"
                      : calculateDeliveryCharge() + " ₹"}
                  </span>
                </div>
                {/* <div className="flex justify-between">
                  <span>GST Amount (18%)</span>
                  <span>{calculateGST(18)} ₹</span>
                </div> */}
                {cartItems[0]?.appliedCoupon && (
                  <>
                    <div className="flex justify-between">
                      <span>
                        {cartItems[0].appliedCoupon.couponCode} -(Coupon)
                      </span>
                      <span className="text-green-600">
                        {cartItems[0].appliedCoupon.couponType === "Amount"
                          ? "-" + cartItems[0]?.appliedCoupon.couponAmount
                          : cartItems[0].appliedCoupon.couponAmount + "%"}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Sub Total</span>
                      <span>{cartTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Saved Amount</span>
                      <span className="text-green-500">
                        -
                        {Math.round(
                          cartTotalPrice() -
                            offerPrice(
                              cartItems[0]?.appliedCoupon?.couponAmount,
                              cartItems[0]?.appliedCoupon?.couponType
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
                        ).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                {!cartItems[0]?.appliedCoupon && (
                  <div className="flex justify-between font-bold pt-3 border-t border-gray-200">
                    <span>Payable Amount</span>
                    <span>{cartTotalPrice()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShoppingCartPage;
