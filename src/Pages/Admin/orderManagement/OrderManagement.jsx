import React, { useEffect, useState } from "react";
import {
  Bell,
  User,
  LayoutGrid,
  Users,
  Package,
  Image as ImageIcon,
  Tag,
  CreditCard,
  Package2,
  Percent,
  Settings,
  LogOut,
  Edit,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "@/axiosIntercepters/AxiosInstance";
import { ChangeStatus } from "@/Components/ChangeStatus";
import { adminorderDetails, logoutAdmin } from "@/redux/adminSlice";
import { useNavigate } from "react-router-dom";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [updatedStatus, setUpdatedStatus] = useState("");
  const [filterOrders, setFilterOrders] = useState("");
  const [spinner, setSpinner] = useState(false);
  const dispatch = useDispatch();

  const user = useSelector((state) => state.users.user);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/admin/order?filter=${filterOrders}`);
        setOrders(response.data?.orderData);
      } catch (error) {
        if (
          error?.response.data.message == "Token not found" ||
          error?.response.data.message == "Failed to authenticate Admin"
        ) {
          dispatch(logoutAdmin());
        }
        console.log(error.message);
        alert(error?.response.data.message);
      }
    })();
  }, [filterOrders, dispatch, orders]);

  const handleUpdatedStatus = (status) => {
    if (status) setUpdatedStatus(status);
  };

  const getStatusColor = (status) => {
    if (status === "processing") return "text-yellow-500";
    if (status === "shipped") return "text-blue-500";
    if (status === "delivered") return "text-green-500";
    if (status === "pending") return "text-orange-500";
    if (status === "cancelled") return "text-red-500";
    if (status === "returned") return "text-red-500";
    return "text-gray-500";
  };

  const handleOrderDetails = (id) => {
    dispatch(adminorderDetails(id));
    navigate("/admin/orders/details");
  };

  return (
    <>
      <span className=" px-4 lg:text-3xl font-bold mb-5 text-gray-400">
        Orders
      </span>
      <div className="flex min-h-screen bg-black font-mono">
        {spinner && (
          <div className="spinner-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <div className="flex-1 bg-black">
          <main className="p-6">
            <div className="bg-black rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-black text-white text-lg mb-5">
                    <th className="px-6 py-3 text-left">ORDER ID</th>
                    <th className="px-6 py-3 text-left">PRODUCT</th>
                    <th className="px-4 py-3 text-left">ORDER DATE</th>
                    <th className="px-6 py-3 text-left">PRICE</th>
                    <th className="px-6 py-3 text-left">ADDRESS</th>
                    <th className="px-6 py-3 text-left">STATUS</th>
                    <th className="px-6 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) =>
                      order.orderItems.map((item, index) => (
                        <tr
                          key={index}
                          className="border-t border-gray-800 hover:scale-100 hover:duration-150 cursor-pointer "
                        >
                          <td className="px-6 py-4 text-gray-200">
                            {order.orderId}
                          </td>
                          <td
                            className="px-6 py-4 text-white "
                            onClick={() => handleOrderDetails(order?._id)}
                          >
                            {item.product?.productName} x ({item.quantity})
                          </td>
                          <td className="px-6 py-4 text-white">
                            {order.orderDate}
                          </td>
                          <td className="px-6 py-4 text-white">
                            {item.product.salesPrice * item.quantity}
                          </td>
                          <td className="px-6 py-4 text-white whitespace-pre-line">
                            {order.address.address},{order.address.pincode}
                          </td>
                          <td
                            className={`px-6 py-4 ${getStatusColor(
                              item.productStatus
                            )}`}
                          >
                            {item.productStatus}
                          </td>
                          {item.productStatus !== "delivered" && (
                            <td className="px-6 py-4">
                              <ChangeStatus
                                updatedState={handleUpdatedStatus}
                                orderId={order.orderId}
                                productId={item._id}
                                currentStatus={item.productStatus}
                              />
                            </td>
                          )}
                        </tr>
                      ))
                    )
                  ) : (
                    <p className="mt-10 ms-10  flex justify-center align-middle items-center font-semibold ">
                      Loading ....
                    </p>
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default OrderManagement;
