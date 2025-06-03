import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "@/axiosIntercepters/AxiosInstance";
import { showToast } from "@/Components/ToastNotification";
import { Search } from "lucide-react";

const ReturnRequests = () => {
  const [returnedProducts, setReturnedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchFocus = useRef(null);
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // const user = useSelector((state) => state.users.user);
  useEffect(() => {
    const fetchReturnedProducts = async () => {
      try {
        const response = await axiosInstance.get(
          `admin/order?search=${search}&isForReturned=${true}`
        );
        setReturnedProducts(() => {
          return response.data.orderData
            .map((order) => ({
              ...order,
              orderItems: order.orderItems
                .filter(
                  (item) =>
                    item.returnDescription &&
                    (!search ||
                      item.product?.productName
                        ?.toLowerCase()
                        .includes(search.toLowerCase()))
                )
                .reverse(),
            }))
            .filter((order) => order.orderItems.length > 0);
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching returned products:", error);
        setLoading(false);
      }
    };

    fetchReturnedProducts();
  }, [search]);

  const handleApprove = async (id) => {
    try {
      const response = await axiosInstance.patch(`admin/returnProduct`, {
        // id: user._id,
        itemId: id,
      });
      showToast("success", response.data.message);
      window.location.reload();
    } catch (error) {
      console.log(error);
      showToast("error", error.response?.data.message);
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen font-mono">
      <h1 className="text-2xl font-bold text-black mb-4">
        Return Product Requests
      </h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-lg font-medium text-black">Loading...</span>
        </div>
      ) : returnedProducts[0]?.orderItems?.length == 0 ? (
        <div className="text-center text-black text-lg">
          No returned products found.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by product name..."
              value={search}
              ref={searchFocus}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-md outline-none"
            />
          </div>

          <table className="min-w-full text-left border-collapse border border-black">
            <thead className="bg-gray-100 text-black font-bold">
              <tr>
                <th className="px-4 py-2 border border-black">#</th>
                <th className="px-4 py-2 border border-black">Product Name</th>
                <th className="px-4 py-2 border border-black">User</th>
                <th className="px-4 py-2 border border-black">Reason</th>
                <th className="px-4 py-2 border border-black">Date Returned</th>
                <th className="px-4 py-2 border border-black">Actions</th>
              </tr>
            </thead>
            <tbody className="text-black">
              {returnedProducts.map((orders, index) =>
                orders.orderItems.length === 0 ? (
                  <tr
                    key={index}
                    className="hover:bg-gray-200 text-black transition duration-200"
                  >
                    <td className="px-4 py-2 border border-black">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 border border-black" colSpan="5">
                      No Requests founded
                    </td>
                  </tr>
                ) : (
                  orders.orderItems.map((product, productIndex) => (
                    <tr
                      key={product._id} // Use product._id for unique key in the second case
                      className="hover:bg-gray-200 transition duration-200"
                    >
                      <td className="px-4 py-2 border border-black">
                        {productIndex + 1}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        {product.product.productName}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        {orders.user.firstName}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        {product.returnDescription}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        {new Date(product.returnedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 border border-black">
                        <button
                          disabled={product.productStatus === "returned"}
                          className={`${
                            product.returnDescription &&
                            product.productStatus === "delivered"
                              ? "bg-red-500"
                              : product.productStatus === "returned"
                              ? "bg-green-500"
                              : ""
                          } ml-2 px-3 py-1 text-sm text-white rounded`}
                          onClick={() => handleApprove(product._id)}
                        >
                          {product.productStatus === "returned"
                            ? "Approved"
                            : "Approve"}
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReturnRequests;
