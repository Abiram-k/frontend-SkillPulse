import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "@/axiosIntercepters/AxiosInstance";
import { showToast } from "@/Components/ToastNotification";
import { Search } from "lucide-react";
import ReactPaginate from "react-paginate";

const ReturnRequests = () => {
  const [returnedProducts, setReturnedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [trigger, setTrigger] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const searchFocus = useRef(null);

  const currentPage = useRef();
  const [pageCount, setPageCount] = useState(1);
  const [requestPerPage, setRequestPerPage] = useState(5);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handlePageClick = async (e) => {
    currentPage.current = e.selected + 1;
    fetchReturnedProducts();
  };

  const fetchReturnedProducts = async () => {
    try {
      setSpinner(true);
      const response = await axiosInstance.get(
        `admin/return-requests?search=${search}&page=${currentPage.current}&limit=${requestPerPage}`
      );

      setReturnedProducts(response.data.returnedItems);
      setPageCount(response.data?.pageCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching returned products:", error);
      setLoading(false);
    } finally {
      setSpinner(false);
    }
  };

  useEffect(() => {
    currentPage.current = 1;
    fetchReturnedProducts();
  }, [search, trigger]);

  const handleApprove = async (id) => {
    try {
      setSpinner(true);
      const response = await axiosInstance.patch(`admin/returnProduct`, {
        itemId: id,
      });
      showToast("success", response.data.message);
      setTrigger((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      showToast("error", error.response?.data.message);
    } finally {
      setSpinner(false);
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen font-mono">
      <h1 className="text-2xl font-bold text-black mb-4">
        Return Product Requests
      </h1>

      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search by product and user name..."
          value={search}
          ref={searchFocus}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-md outline-none"
        />
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-lg font-medium text-black">Loading...</span>
        </div>
      ) : returnedProducts.length == 0 ? (
        <div className="text-center text-black text-lg">
          No returned products found.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full text-left border-collapse border border-black">
            <thead className="bg-gray-100 text-black font-bold">
              <tr>
                <th className="px-4 py-2 border border-black">Order Id</th>
                <th className="px-4 py-2 border border-black">Product Name</th>
                <th className="px-4 py-2 border border-black">User</th>
                <th className="px-4 py-2 border border-black">Reason</th>
                <th className="px-4 py-2 border border-black">Date Returned</th>
                <th className="px-4 py-2 border border-black">Action</th>
              </tr>
            </thead>
            <tbody className="text-black">
              {returnedProducts.length === 0 ? (
                <tr
                  key={index}
                  className="hover:bg-gray-200 text-black transition duration-200"
                >
                  <td className="px-4 py-2 border border-black">{index + 1}</td>
                  <td className="px-4 py-2 border border-black" colSpan="5">
                    No Requests founded
                  </td>
                </tr>
              ) : (
                returnedProducts.map((product, productIndex) => (
                  <tr
                    key={product?.orderId} // Use product._id for unique key in the second case
                    className="hover:bg-gray-200 transition duration-200"
                  >
                    <td className="px-4 py-2 border border-black">
                      {product?.orderId}
                    </td>
                    <td className="px-4 py-2 border border-black">
                      {product?.productName}
                    </td>
                    <td className="px-4 py-2 border border-black">
                      {product?.user}
                    </td>
                    <td className="px-4 py-2 border border-black">
                      {product?.returnDescription}
                    </td>
                    <td className="px-4 py-2 border border-black">
                      {new Date(product.returnedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border border-black">
                      <button
                        disabled={product.orderStatus === "returned"}
                        className={`${
                          product.returnDescription &&
                          product.orderStatus === "delivered"
                            ? "bg-red-500"
                            : product.orderStatus === "returned"
                            ? "bg-green-500"
                            : ""
                        } ml-2 px-3 py-1 text-sm text-white rounded`}
                        onClick={() => handleApprove(product.itemId)}
                      >
                        {product.orderStatus === "returned"
                          ? "Approved"
                          : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <ReactPaginate
        className="flex justify-center border-gray-700 items-center space-x-2 mt-4"
        breakLabel="..."
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="< previous"
        renderOnZeroPageCount={null}
        marginPagesDisplayed={2}
        containerClassName="flex flex-wrap justify-center gap-2"
        pageClassName="flex items-center border-black border-1 text-black"
        pageLinkClassName="px-4 py-2 border border-gray-400 rounded-md text-sm hover:bg-gray-200 transition duration-200"
        previousClassName="flex items-center text-black"
        previousLinkClassName="px-4 py-2 border rounded-md text-sm hover:bg-gray-200 transition duration-200"
        nextClassName="flex items-center text-black"
        nextLinkClassName="px-4 py-2 border rounded-md text-sm hover:bg-gray-200 transition duration-200"
        activeClassName="bg-blue-500 text-white"
      />
    </div>
  );
};

export default ReturnRequests;
