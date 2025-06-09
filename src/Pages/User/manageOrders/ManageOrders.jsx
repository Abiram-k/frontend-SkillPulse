import axios from "@/axiosIntercepters/AxiosInstance";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./manageOrder.css";
import { Toast } from "@/Components/Toast";
import { logoutUser, orderDetails } from "@/redux/userSlice";
import AlertDialogueButton from "@/Components/AlertDialogueButton";
import { showToast } from "@/Components/ToastNotification";
import Razorpay from "../paymentComoponent/RazorPay";
import { ReturnProduct } from "@/Components/ReturnProduct";
import { ArrowDown, Calendar, Search } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Link, useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [cartItems, setCartItems] = useState({});
  const [spinner, setSpinner] = useState(false);

  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("All");

  const currentPage = useRef();
  const [pageCount, setPageCount] = useState(1);
  const [postPerPage, setPostPerPage] = useState(5);
  const searchFocus = useRef(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [trigger, setTrigger] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.users.user);

  const handlePageClick = async (e) => {
    currentPage.current = e.selected + 1;
    fetchOrders();
  };

  const handleFilter = (e) => {
    setFilter(e.target.value);
  };
  const handleSort = (e) => {
    setSort(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearch("");
    setFilter("All");
    setSort("All");
  };

  const fetchOrders = async () => {
    try {
      setSpinner(true);
      const response = await axios.get(
        `/order?&search=${search}&sort=${sort}&filter=${filter}&page=${
          currentPage.current || 1
        }&limit=${postPerPage}&startDate=${startDate}&endDate=${endDate}`
      );
      setOrders(response.data?.orderData);
      setSpinner(false);
      setPageCount(response.data?.pageCount);
    } catch (error) {
      setSpinner(false);
      if (
        error?.response.data.isBlocked ||
        error?.response.data.message == "token not found"
      ) {
        dispatch(logoutUser());
      }
      console.log(error.message);
    }
  };

  useEffect(() => {
    currentPage.current = 1;
    fetchOrders();
  }, [refresh, search, filter, sort, startDate, endDate, trigger]);

  const handleCancelOrder = async (item) => {
    try {
      const response = await axios.patch(`/cancelOrderItem?itemId=${item._id}`);
      // const response = await axios.patch(
      //   `/cancelOrderItem?id=${user._id}&itemId=${item._id}`
      // );
      showToast("success", `${response.data.message}`);

      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.log(error);
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

  const handlePlaceOrder = async (paymentFailed, orderId) => {
    const orderForRetry = orders?.filter(
      (order, index) => order?._id.toString() == orderId
    );
    try {
      // const response = await axios.post(
      //   `/order/${user._id}`,
      const response = await axios.post(
        `/order`,
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
      setTrigger((prev) => prev + 1);
      showToast("success", `${response?.data.message}`);
    } catch (error) {
      showToast("error", error?.response?.data.message);
    }
  };

  const handleOrderDetails = (orderId) => {
    dispatch(orderDetails(orderId));
    navigate("/user/profile/myOrders/details");
  };

  return (
    <main className="w-3/4   md:w-full md:p-4 p-1 font-mono h-screen overflow-y-scroll no-scrollbar">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <h1 className="text-xl lg:text-3xl uppercase font-bold mb-4 lg:mb-14">
        Manage your orders
      </h1>

      <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4 w-full lg:w-auto">
        <div className="w-full max-w-4xl mx-auto py-6 pe-6 rounded-lg shadow-sm font-sans">
          <div className="space-y-4">
            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      className="w-full pl-10 pr-4 py-2 border bg-gray-800  border-gray-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      min={startDate} // Ensure end date is not before start date
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm mt-5 hidden md:block font-medium bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 rounded-md transition-colors duration-200 "
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="flex-col flex gap-2 items-end me-2 md:me-0 w-full  justify-center mb-5 ">
          <div className="flex items-center space-x-4 -ms-4 ">
            <span className="font-semibold text-gray-600">Filter: </span>
            <select
              className="border rounded bg-gray-400 px-2 py-1 font-mono text-black  "
              value={filter}
              onChange={handleFilter}
            >
              <option value="">Select Option</option>
              <option value="pay-success">Pay success</option>
              <option value="pay-failed">Pay failed</option>
              <option value="pay-pending">Pay pending</option>
              <option value="delivered">Delivered</option>
              <option value="returned">Returned</option>
              <option value="shipped">Shipped</option>
              <option value="processing">Processing</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-gray-600">Sort: </span>
            <select
              className="border rounded bg-gray-400 px-2 py-1 font-mono text-black  "
              value={sort}
              onChange={handleSort}
            >
              <option value="">Select Option</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6 bg-gray-900 overflow-y-scroll custom-scrollbar mt-5 md:mt-1">
        {orders.length > 0 ? (
          orders?.map((order) => (
            // <div
            //   className="border-y sm:text-sm  border-gray-500 p-4 lg:p-6 rounded-lg shadow-md space-y-4 lg:space-y-6 bg-light-red"
            //   key={order._id}
            // >
            //   <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row justify-between items-start lg:items-center text-xs lg:text-base gap-4">
            //     <div className="font-medium">
            //       <strong>Order Date:</strong> <p>{order.orderDate}</p>
            //     </div>
            //     <div
            //       className={`font-semibold ${
            //         order.paymentStatus == "Success"
            //           ? "text-green-600"
            //           : "text-red-600"
            //       }`}
            //     >
            //       <strong className="text-gray-200">Payment Status:</strong>{" "}
            //       {order.paymentStatus == "Success"
            //         ? "Paid"
            //         : `${order.paymentStatus || "Not paid"} `}
            //     </div>
            //     {order.paymentStatus === "Failed" && (
            //       <div className="w-full lg:w-fit">
            //         <Razorpay
            //           name="Retry"
            //           orderId={order?._id}
            //           PayAmount={
            //             order.totalDiscount
            //               ? parseInt(order.totalDiscount)
            //               : parseInt(order.totalAmount)
            //           }
            //           handlePlaceOrder={handlePlaceOrder}
            //           retry={true}
            //         />
            //       </div>
            //     )}
            //     <div>
            //       <strong>Order Number:</strong> {order.orderId}
            //     </div>
            //     <div>
            //       <strong>Ship To:</strong> {order.address?.firstName}
            //     </div>
            //     <div className="font-semibold">
            //       <strong>Total:</strong> ₹{" "}
            //       {order.totalDiscount > 0
            //         ? order.totalDiscount?.toFixed(0)
            //         : order.totalAmount?.toFixed(0)}
            //     </div>
            //   </div>

            //   <div className="space-y-4 lg:space-y-6">
            //     {order.orderItems.map((item) => (
            //       <div className="bg-gray-800 p-4 lg:p-6 rounded-lg shadow-inner">
            //         <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
            //           <img
            //             src={
            //               item.product.productImage[0] ||
            //               "https://placehold.co/100x100"
            //             }
            //             alt="Product"
            //             className="w-16 h-16 lg:w-24 lg:h-24 object-cover rounded-md"
            //           />
            //           <div className="space-y-2">
            //             <div className="text-xs lg:text-base">
            //               <strong>Category:</strong>{" "}
            //               {item.product.category.name}
            //             </div>
            //             <div className="text-xs lg:text-base">
            //               <strong>Total Price:</strong> ₹ {item.totalPrice}{" "}
            //               <span className="text-xs">inc GST</span>
            //             </div>
            //             {order.appliedCoupon && (
            //               <div className="text-xs lg:text-base">
            //                 <strong>Coupon Discount:</strong>{" "}
            //                 <span className="text-green-500">
            //                   ₹{(item.totalPrice - item.price).toFixed(0)}
            //                 </span>
            //               </div>
            //             )}
            //             <div className="text-xs lg:text-base">
            //               <strong>Qty:</strong> {item.quantity}
            //             </div>
            //             <div className="text-sm lg:text-lg font-semibold">
            //               {item.product.productName}
            //             </div>
            //           </div>
            //         </div>

            //         <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
            //           <div className="text-xs lg:text-base">
            //             <strong>Status:</strong>{" "}
            //             <span
            //               className={`${getStatusColor(item.productStatus)}`}
            //             >
            //               {item.productStatus}
            //             </span>
            //           </div>

            //           <div className="text-xs lg:text-base">
            //             <strong>Date:</strong> {order.orderDate}
            //           </div>
            //           {item.productStatus !== "shipped" &&
            //             item.productStatus !== "delivered" &&
            //             item.productStatus !== "cancelled" &&
            //             item.productStatus !== "returned" &&
            //             order.paymentStatus !== "Failed" && (
            //               <div className="bg-red-500 text-white p-2 rounded">
            //                 <AlertDialogueButton
            //                   name="Cancel"
            //                   onClick={() => handleCancelOrder(item)}
            //                 />
            //               </div>
            //             )}

            //           {item.productStatus === "delivered" &&
            //             item.returnDescription === "" &&
            //             (() => {
            //               const [day, month, year] = order.orderDate
            //                 .split("/")
            //                 .map(Number);

            //               const orderDate = new Date(year, month - 1, day);
            //               const currentDate = new Date();
            //               const timeDiff = currentDate - orderDate;
            //               const dayDiff = timeDiff / (1000 * 60 * 60 * 24);
            //               return dayDiff <= 3;
            //             })() && (
            //               <div className="bg-red-500 text-white p-2 rounded-md">
            //                 <ReturnProduct
            //                   item={item}
            //                   setTrigger={setTrigger}
            //                 />
            //               </div>
            //             )}

            //           {item.productStatus !== "returned" &&
            //             item.returnDescription && (
            //               <p className="text-orange-600">
            //                 Return in progress...
            //               </p>
            //             )}
            //         </div>
            //       </div>
            //     ))}
            //   </div>

            //   <button
            //     className="mb-0 inline-block hover:scale-105 duration-150 border-gray-500 text-gray-300 bg-gray-700 rounded p-2 lg:p-3 "
            //     onClick={() => handleOrderDetails(order?._id)}
            //   >
            //     View more
            //   </button>
            // </div>
            <OrderItem
              order={order}
              handlePlaceOrder={handlePlaceOrder}
              getStatusColor={getStatusColor}
              handleCancelOrder={handleCancelOrder}
              setTrigger={setTrigger}
              handleOrderDetails={handleOrderDetails}
            />
          ))
        ) : (
          <div className="bg-gray-800 p-4 lg:p-6 rounded-lg text-center">
            <h2 className="text-sm lg:text-base">No orders found -{search}</h2>
          </div>
        )}
      </div>
      {orders?.length > 0 && (
        <ReactPaginate
          className="flex justify-center mb-1 border-gray-700 items-center space-x-2 mt-4"
          breakLabel="..."
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
          marginPagesDisplayed={2}
          containerClassName="flex flex-wrap justify-center gap-2"
          pageClassName="flex items-center"
          pageLinkClassName="px-4 py-2 border border-gray-400 rounded-md text-sm hover:bg-blue-600 transition duration-200"
          previousClassName="flex items-center"
          previousLinkClassName="px-4 py-2 border rounded-md text-sm hover:bg-gray-200 transition duration-200"
          nextClassName="flex items-center"
          nextLinkClassName="px-4 py-2 border rounded-md text-sm hover:bg-gray-200 transition duration-200"
          activeClassName="bg-blue-500 text-white"
        />
      )}
    </main>

    // </div>
  );
};

export default ManageOrders;

const OrderItem = ({
  order,
  handlePlaceOrder,
  getStatusColor,
  handleCancelOrder,
  setTrigger,
  handleOrderDetails,
}) => {
  return (
    <div
      className="border-y sm:text-sm  border-gray-500 p-4 lg:p-6 rounded-lg shadow-md space-y-4 lg:space-y-6 bg-light-red"
      key={order._id}
    >
      <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row justify-between items-start lg:items-center text-xs lg:text-base gap-4">
        <div className="font-medium">
          <strong>Order Date:</strong> <p>{order.orderDate}</p>
        </div>
        <div
          className={`font-semibold ${
            order.paymentStatus == "Success" ? "text-green-600" : "text-red-600"
          }`}
        >
          <strong className="text-gray-200">Payment Status:</strong>{" "}
          {order.paymentStatus == "Success"
            ? "Paid"
            : `${order.paymentStatus || "Not paid"} `}
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
          <strong>Ship To:</strong> {order.address?.firstName}
        </div>
        <div className="font-semibold">
          <strong>Total:</strong> ₹{" "}
          {order.totalDiscount > 0
            ? order.totalDiscount?.toFixed(0)
            : order.totalAmount?.toFixed(0)}
        </div>
      </div>

      <div className="space-y-4 lg:space-y-6">
        {order.orderItems.map((item) => (
          <div
            className="bg-gray-800 p-4 lg:p-6 rounded-lg shadow-inner"
            key={item._id || item.product._id}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
              <img
                src={
                  item.product.productImage[0] || "https://placehold.co/100x100"
                }
                alt="Product"
                className="w-16 h-16 lg:w-24 lg:h-24 object-cover rounded-md"
              />
              <div className="space-y-2">
                <div className="text-xs lg:text-base">
                  <strong>Category:</strong> {item.product.category.name}
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
                <span className={`${getStatusColor(item.productStatus)}`}>
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
                item.returnDescription === "" &&
                (() => {
                  const [day, month, year] = order.orderDate
                    .split("/")
                    .map(Number);

                  const orderDate = new Date(year, month - 1, day);
                  const currentDate = new Date();
                  const timeDiff = currentDate - orderDate;
                  const dayDiff = timeDiff / (1000 * 60 * 60 * 24);
                  return dayDiff <= 3;
                })() && (
                  <div className="bg-red-500 text-white p-2 rounded-md">
                    <ReturnProduct item={item} setTrigger={setTrigger} />
                  </div>
                )}

              {item.productStatus !== "returned" && item.returnDescription && (
                <p className="text-orange-600">Return in progress...</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        className="mb-0 inline-block hover:scale-105 duration-150 border-gray-500 text-gray-300 bg-gray-700 rounded p-2 lg:p-3 "
        onClick={() => handleOrderDetails(order?._id)}
      >
        View more
      </button>
    </div>
  );
};
