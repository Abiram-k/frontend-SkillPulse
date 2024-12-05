import axios from "@/axiosIntercepters/AxiosInstance";
import { Toast } from "@/Components/Toast";
import { showToast } from "@/Components/ToastNotification";
import { Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CouponManagement = () => {
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
  const [search, setSearch] = useState("");
  const [trigger, setTrigger] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editCouponId, setEditCouponId] = useState("");
  const [spinner, setSpinner] = useState(false);

  const validateForm = () => {
    let error = {};
    if (!couponCode.trim()) error.couponCode = "Required *";
    if (!couponType.trim()) error.couponType = "Required *";
    if (!couponAmount.trim() || isNaN(couponAmount))
      error.couponAmount = "Enter amount";
    if (couponAmount < 0) error.couponAmount = "Must be positive value *";

    if (!description.trim()) error.description = "Required *";
    if (!totalLimit.trim() || isNaN(totalLimit))
      error.totalLimit = "Enter number";
    if (totalLimit < 0) error.totalLimit = "Must be positive value *";
    if (!perUserLimit.trim() || isNaN(perUserLimit))
      error.perUserLimit = "Enter number";

    if (!purchaseAmount.trim() || isNaN(purchaseAmount))
      error.purchaseAmount = "Enter amount";
    if (purchaseAmount < 0) error.purchaseAmount = "Must be positive value *";
    if (
      couponType == "Amount" &&
      parseInt(purchaseAmount) < parseInt(couponAmount)
    )
      error.purchaseAmount =
        "purchase amount must be greater than coupon Amount";

    if (!maxDiscount.trim() || isNaN(maxDiscount))
      error.maxDiscount = "Enter amount";
    if (maxDiscount < 0) error.maxDiscount = "Must be posetive value *";

    if (couponType == "Amount" && couponAmount != maxDiscount)
      error.maxDiscount = "Field must be same as coupon Amount*";

    if (!expiryDate.trim()) error.expiryDate = "Required *";
    if (new Date(expiryDate) <= new Date()) {
      error.expiryDate = "Expiry must be after creation *";
    }
    if (couponType == "Percentage" && couponAmount > 100)
      error.couponAmount = "Enter valid coupon percentage";

    return error;
  };

  useEffect(() => {
    (async () => {
      setSpinner(true);
      try {
        const response = await axios.get(`/admin/coupon`);
        setCoupons(response?.data);
        setSpinner(false);
      } catch (error) {
        console.log(error);
        setSpinner(false);
        Toast.fire({
          icon: "error",
          title: `${error?.response?.data?.message}`,
        });
      }
    })();
  }, [message, trigger]);

  const handleEditCoupon = async () => {
    setMessage({});
    const formError = validateForm();
    if (Object.keys(formError).length > 0) {
      setMessage(formError);
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
      Toast.fire({
        icon: "success",
        title: `${response?.data.message}`,
      });
    } catch (error) {
      console.log(error);
      Toast.fire({
        icon: "error",
        title: `${error?.response?.data?.message}`,
      });
    }
  };
  const getDate = (couponDate) => {
    const date = new Date(couponDate);
    const formattedDate = `${
      date.getMonth() + 1
    }/${date.getDate()}/${date.getFullYear()}`;
    return formattedDate;
  };

  const handleCouponDelete = async (id) => {
    try {
      const response = await axios.delete(`/admin/coupon/${id}`);
      setTrigger((prev) => prev + 1);
      showToast("success", `${response?.data.message}`);
    } catch (error) {
      console.log(error);
      setTrigger((prev) => prev + 1);
      showToast("error", `${error?.response?.data?.message}`);
    }
  };
  const handleCouponEdit = async (id) => {
    try {
      const response = await axios.patch(`/admin/coupon/${id}`);
      setTrigger((prev) => prev + 1);
      showToast("success", `${response?.data.message}`);
    } catch (error) {
      console.log(error);
      setTrigger((prev) => prev + 1);
      showToast("error", `${error?.response?.data?.message}`);
    }
  };
  return (
    <main className="w-full lg:w-7/6 p-8 text-black font-mono mt-0">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold">Coupon Management</div>
        <Link
          to={"add"}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow-md"
        >
          Add Coupon
        </Link>
      </div>

      <div className="bg-gray-300 p-6 rounded shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <div className="flex items-center  space-x-2 ">
            <label htmlFor="search"></label>
            <input
              type="text"
              id="search"
              className="border p-2 px-4 rounded text-black focus:outline-none"
              placeholder="Search by coupon type"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto max-w-full">
          {" "}
          {/* Added max-w-full */}
          <table className="w-full bg-gray-200 rounded shadow-md">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-black text-left">Code</th>
                <th className="px-6 py-3 text-black text-left">Description</th>
                <th className="px-6 py-3 text-black text-left">Amount</th>
                <th className="px-6 py-3 text-black text-left">Limit</th>
                <th className="px-6 py-3 text-black text-left">Max.disc</th>
                <th className="px-6 py-3 text-black text-left">Min.Purc</th>
                <th className="px-6 py-3 text-black text-left">Expiry</th>
                <th className="px-6 py-3"> Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length > 0 ? (
                coupons.filter((coupon) =>
                  coupon.couponCode.toLowerCase().includes(search.toLowerCase())
                ).length > 0 ? (
                  coupons
                    .filter((coupon) =>
                      coupon.couponCode
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    )
                    .map((coupon) => (
                      <tr className="border-b">
                        <td className="px-6 py-4 text-black">
                          {coupon.couponCode}
                        </td>
                        <td className="px-6 py-4 text-black">
                          {coupon.description}
                        </td>
                        <td className="px-6 py-4 text-black">
                          {coupon.couponAmount}
                        </td>
                        <td className="px-6 py-4 text-black">
                          {coupon.totalLimit}
                        </td>
                        <td className="px-6 py-4 text-black">
                          {coupon.maxDiscount}
                        </td>
                        <td className="px-6 py-4 text-black">
                          {coupon.purchaseAmount}
                        </td>
                        <td className="px-6 py-4 text-black">
                          {getDate(coupon.expirationDate)}
                        </td>
                        <td className="px-6 py-4 text-center text-black">
                          <div className="flex gap-3 justify-center items-center ">
                            {/* <Pencil
                              className="w-4 text-blue-500"
                              onClick={() => {
                                setIsEdit(true);
                                handleCouponEdit(coupon._id);
                              }}
                            /> */}

                            <i
                              className="fas fa-times cursor-pointer text-red-600"
                              onClick={() => handleCouponDelete(coupon._id)}
                            ></i>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td className="px-6 py-4 text-black" colSpan="8">
                      "{search}" Coupon code not found !
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td className="px-6 py-4 text-black" colSpan="8">
                    No coupons available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isEdit && (
        <div className="bg-gray-300 p-6 rounded mt-4 shadow-md">
          <h2 className="text-xl font-bold mb-4 text-black">Edit Coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
            <div className="space-y-2">
              <input
                type="text"
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
              <select
                type="text"
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
              <input
                type="text"
                className="border p-3 rounded text-black focus:outline-none w-full"
                placeholder="Coupon Amount"
                value={couponAmount}
                onChange={(e) => setCouponAmount(e.target.value)}
              />
              {message.couponAmount && (
                <p className="ps-3 text-red-600">{message.couponAmount}</p>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="text"
                className="border p-3 rounded text-black focus:outline-none w-full"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {message.description && (
                <p className="ps-3 text-red-600">{message.description}</p>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="text"
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
              <input
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
              <input
                type="text"
                className="border p-3 rounded text-black focus:outline-none w-full"
                placeholder="Purchase Amount"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
              />
              {message.purchaseAmount && (
                <p className="ps-3 text-red-600">{message.purchaseAmount}</p>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="text"
                className="border p-3 rounded text-black focus:outline-none w-full"
                placeholder="max Discount"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
              />
              {message.maxDiscount && (
                <p className="ps-3 text-red-600">{message.maxDiscount}</p>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="date"
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

          <div className="w-full flex mt-4 justify-center">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow-md"
              onClick={handleEditCoupon}
            >
              Edit Coupon
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default CouponManagement;
