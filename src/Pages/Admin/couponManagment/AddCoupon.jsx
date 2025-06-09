import React, { useEffect, useState } from "react";
import axios from "@/axiosIntercepters/AxiosInstance";
import { showToast } from "@/Components/ToastNotification";
import { useNavigate } from "react-router-dom";

function AddCoupon() {
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState("");
  const [couponAmount, setCouponAmount] = useState("");
  const [description, setDescription] = useState("");
  const [totalLimit, setTotalLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [message, setMessage] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    setCouponCode("");
    setCouponType("");
    setCouponAmount("");
    setDescription("");
    setTotalLimit("");
    setPerUserLimit("");
    setPurchaseAmount("");
    setExpiryDate("");
    setMaxDiscount("");
    setMessage({});
  }, []);

  const validateForm = () => {
    let error = {};
    if (!couponCode.trim()) error.couponCode = "Required *";
    if (!couponType.trim()) error.couponType = "Required *";

    if (!couponAmount.trim() || isNaN(couponAmount))
      error.couponAmount = "Enter amount";
    if (couponAmount < 0) error.couponAmount = "Must be positive value *";

    if (couponType != "Amount" && couponAmount > 99)
      error.couponAmount = "Coupon amount must be below 100 *";

    if (!description.trim()) error.description = "Required *";

    if (!totalLimit.trim() || isNaN(totalLimit))
      error.totalLimit = "Enter number";
    if (totalLimit < 1) error.totalLimit = "Must be greater than 1 *";
    if (!perUserLimit.trim() || isNaN(perUserLimit))
      error.perUserLimit = "Enter number";
    if (perUserLimit < 0) error.perUserLimit = "Must be positive value *";
    if (perUserLimit > totalLimit)
      error.perUserLimit = "Must be lesser than or equal as total limit";
    if (!purchaseAmount.trim() || isNaN(purchaseAmount))
      error.purchaseAmount = "Enter amount";
    if (purchaseAmount < 1) error.purchaseAmount = "Must be greater than 0 *";
    if (
      couponType == "Amount" &&
      parseInt(purchaseAmount) < parseInt(couponAmount)
    )
      error.purchaseAmount =
        "purchase amount must be greater than coupon Amount";

    if (couponType != "Amount" && (!maxDiscount.trim() || isNaN(maxDiscount)))
      error.maxDiscount = "Max discount is required";

    if (couponType != "Amount" && maxDiscount < 1)
      error.maxDiscount = "Must be greater than 0 *";

    // if (couponType == "Amount" && couponAmount != maxDiscount)
    //   error.maxDiscount = "Field must be same as coupon Amount*";

    if (!expiryDate.trim()) error.expiryDate = "Required *";
    if (new Date(expiryDate) <= new Date()) {
      error.expiryDate = "Expiry must be after creation *";
    }
    if (couponType == "Percentage" && couponAmount > 100)
      error.couponAmount = "Enter valid coupon percentage";

    return error;
  };

  const handleAddCoupon = async () => {
    setMessage({});
    const formError = validateForm();
    if (Object.keys(formError).length > 0) {
      setMessage(formError);
      console.log("Errors: ", formError);
      return;
    }
    try {
      const response = await axios.post("/admin/coupon", {
        couponCode,
        couponType,
        couponAmount,
        description,
        totalLimit,
        perUserLimit,
        purchaseAmount,
        expiryDate,
        maxDiscount,
      });
      setCouponCode("");
      setCouponType("");
      setCouponAmount("");
      setDescription("");
      setTotalLimit("");
      setPerUserLimit("");
      setPurchaseAmount("");
      setExpiryDate("");
      setMaxDiscount("");
      setMessage({});
      navigate("/admin/coupon");
      showToast("success", `${response?.data.message}`);
    } catch (error) {
      showToast("error", `${error?.response?.data?.message}`);
    }
  };
  return (
    <div>
      <div className="bg-gray-300 p-6 rounded mt-4 shadow-md font-mono">
        <h2 className="text-xl font-bold mb-4 text-black">Add Coupon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
          <div className="space-y-2">
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              Coupon code:
            </label>
            <input
              type="text"
              id="code"
              className="border p-3 rounded text-black focus:outline-none w-full"
              placeholder="Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            {message.couponCode && (
              <p className="ps-3 text-red-600">{message.couponCode}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Coupon type:
            </label>
            <select
              type="text"
              id="type"
              className="border p-3 rounded text-black focus:outline-none w-full"
              placeholder="Coupon Type"
              value={couponType}
              onChange={(e) => setCouponType(e.target.value)}
            >
              <option value="" disabled>
                Payment type
              </option>
              <option value="Percentage">Percentage (%)</option>
              <option value="Amount">Amount (₹)</option>
            </select>
            {message.couponType && (
              <p className="ps-3 text-red-600">{message.couponType}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Coupon {couponType == "Amount" ? "amount" : "percent"}:
            </label>
            <input
              type="text"
              id="amount"
              className="border p-3 rounded text-black focus:outline-none w-full"
              placeholder={`Coupon ${
                couponType == "Amount" ? "amount" : "percent"
              }`}
              value={couponAmount}
              onChange={(e) => setCouponAmount(e.target.value)}
            />
            {message.couponAmount && (
              <p className="ps-3 text-red-600">{message.couponAmount}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <input
              id="description"
              type="text"
              className="border p-3 rounded text-black focus:outline-none w-full"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {message.description && (
              <p className="ps-3 text-red-600 text-sm">{message.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="limit"
              className="block text-sm font-medium text-gray-700"
            >
              Total limit:
            </label>
            <input
              type="text"
              id="limit"
              className="border p-3 rounded text-black focus:outline-none w-full"
              placeholder="Total Limit"
              value={totalLimit}
              onChange={(e) => setTotalLimit(e.target.value)}
            />
            {message.totalLimit && (
              <p className="ps-3 text-red-600">{message.totalLimit}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="userLimit"
              className="block text-sm font-medium text-gray-700"
            >
              Per user limit:
            </label>
            <input
              id="userLimit"
              type="text"
              className="border p-3 rounded text-black focus:outline-none w-full"
              placeholder="Per User Limit"
              value={perUserLimit}
              onChange={(e) => setPerUserLimit(e.target.value)}
            />
            {message.perUserLimit && (
              <p className="ps-3 text-red-600">{message.perUserLimit}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="purchaseAmount"
              className="block text-sm font-medium text-gray-700"
            >
              Min purchase amount:
            </label>
            <input
              type="text"
              id="purchaseAmount"
              className="border p-3 rounded text-black focus:outline-none w-full"
              placeholder="Purchase Amount"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
            />
            {message.purchaseAmount && (
              <p className="ps-3 text-red-600">{message.purchaseAmount}</p>
            )}
          </div>
          {couponType !== "Amount" && (
            <div className="space-y-2">
              <label
                htmlFor="discount"
                className="block text-sm font-medium text-gray-700"
              >
                Max discount:
              </label>
              <input
                type="text"
                id="discount"
                className="border p-3 rounded text-black focus:outline-none w-full"
                placeholder="max Discount"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
              />
              {message.maxDiscount && (
                <p className="ps-3 text-red-600">{message.maxDiscount}</p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <label
              htmlFor="expiry"
              className="block text-sm font-medium text-gray-700"
            >
              Expiry Date:
            </label>
            <input
              type="date"
              id="expiry"
              className="border p-3 rounded text-black focus:outline-none w-full"
              placeholder="Expiry Date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
            {message.expiryDate && (
              <p className="ps-3 text-red-600">{message.expiryDate}</p>
            )}
          </div>
        </div>
        <div className="flex justify-center">
          <button
            className="bg-green-500  hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow-md"
            onClick={handleAddCoupon}
          >
            + Add Coupon
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCoupon;
