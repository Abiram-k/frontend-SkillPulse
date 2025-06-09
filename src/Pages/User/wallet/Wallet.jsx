import React, { useEffect, useRef, useState } from "react";
import axios from "@/axiosIntercepters/AxiosInstance";
import { format } from "date-fns";

import { useSelector } from "react-redux";
import { logoutUser } from "@/redux/userSlice";
import ReactPaginate from "react-paginate";
const Wallet = () => {
  const [walletData, setWalletData] = useState({});
  const user = useSelector((state) => state.users.user);

  const currentPage = useRef();
  const [pageCount, setPageCount] = useState(1);
  const [postPerPage, setPostPerPage] = useState(8);
  const [totalAmount, setTotalAmount] = useState(0);

  const handlePageClick = async (e) => {
    currentPage.current = e.selected + 1;
    fetchWalletHistory();
  };
  const fetchWalletHistory = async () => {
    try {
      const response = await axios.get(
        `/wallet?&page=${currentPage.current}&limit=${postPerPage}`
      );
      // const response = await axios.get(
      //   `/wallet/${user._id}?&page=${currentPage.current}&limit=${postPerPage}`
      // );
      setWalletData(response.data.wallet);
      // response.data.wallet?.transaction?.reverse();
      setPageCount(response.data?.pageCount);
      setTotalAmount(response.data?.totalAmount);
    } catch (error) {
      if (
        error?.response.data.isBlocked ||
        error?.response.data.message == "token not found"
      ) {
        dispatch(logoutUser());
      }
      console.error(error);
    }
  };

  useEffect(() => {
    currentPage.current = 1;
    fetchWalletHistory();
  }, []);

  return (
    <div className="flex flex-col space-y-6 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-900 p-4 rounded">
        <div className="flex items-center gap-2 justify-center">
          <i className="fa-solid fa-wallet text-yellow-500 text-xl"></i>
          <p className="text-white font-bold text-xl">Wallet Balance</p>
        </div>

        <p className="font-bold text-green-600 text-xl mt-2 sm:mt-0">
          {totalAmount || 0} ₹
        </p>
      </div>

      <section className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-red-500 text-xl font-bold mb-4 lg:mb-10">
          WALLET HISTORY
        </h3>

        <div className="hidden sm:grid grid-cols-4 gap-4 text-sm font-semibold tracking-widest mb-4 lg:mb-8 lg:text-md font-sans pb-2 border-b-4 border-gray-700">
          <span className="lg:ms-3">DESCRIPTION</span>
          <span>DATE</span>
          <span>AMOUNT</span>
          <span>TRANSACTION ID</span>
        </div>

        {walletData?.transaction?.map((transact) => (
          // <div
          //   key={transact.transactionId}
          //   className="flex flex-col sm:grid sm:grid-cols-4 gap-4 mt-3 lg:mt-6 text-sm sm:text-base text-gray-300 border-b border-gray-700 pb-3 sm:pb-0"
          // >
          //   <div className="sm:hidden flex flex-col space-y-2">
          //     <div>
          //       <strong>DESCRIPTION:</strong> {transact.description}
          //     </div>
          //     <div>
          //       <strong>DATE:</strong> {format(transact.date, "dd-MM-yyyy")}
          //     </div>
          //     <div>
          //       <strong>AMOUNT:</strong>{" "}
          //       <span
          //         className={`${
          //           transact.amount > 0 ? "text-green-600" : "text-red-600"
          //         }`}
          //       >
          //         {parseInt(transact.amount).toFixed(2)} ₹
          //       </span>
          //     </div>
          //     <div className="hidden lg:block">
          //       <strong>TRANSACTION ID:</strong> {transact.transactionId}
          //     </div>
          //   </div>

          //   <div className="hidden sm:block sm:col-span-1">
          //     {transact.description}
          //   </div>
          //   <div className="hidden sm:block sm:col-span-1">
          //     {format(transact.date, "dd-MM-yyyy")}
          //   </div>
          //   <div
          //     className={`hidden sm:block sm:col-span-1 ${
          //       transact.amount > 0 ? "text-green-600" : "text-red-600"
          //     }`}
          //   >
          //     {parseInt(transact.amount).toFixed(2)} ₹
          //   </div>
          //   <div className="hidden sm:block sm:col-span-1">
          //     {transact.transactionId}
          //   </div>
          // </div>
          <WalletItem transact={transact} />
        ))}
        {totalAmount > 0 && (
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
            pageClassName="flex items-center"
            pageLinkClassName="px-4 py-2 border border-gray-400 rounded-md text-sm hover:bg-blue-600 transition duration-200"
            previousClassName="flex items-center"
            previousLinkClassName="px-4 py-2 border rounded-md text-sm hover:bg-gray-800 transition duration-200"
            nextClassName="flex items-center"
            nextLinkClassName="px-4 py-2 border rounded-md text-sm hover:bg-gray-800 transition duration-200"
            activeClassName="bg-blue-500 text-white"
          />
        )}
      </section>
    </div>
  );
};

export default Wallet;

const WalletItem = ({ transact }) => {
  return (
    <div
      key={transact.transactionId}
      className="flex flex-col sm:grid sm:grid-cols-4 gap-4 mt-3 lg:mt-6 text-sm sm:text-base text-gray-300 border-b border-gray-700 pb-3 sm:pb-0"
    >
      <div className="sm:hidden flex flex-col space-y-2">
        <div>
          <strong>DESCRIPTION:</strong> {transact.description}
        </div>
        <div>
          <strong>DATE:</strong> {format(transact.date, "dd-MM-yyyy")}
        </div>
        <div>
          <strong>AMOUNT:</strong>{" "}
          <span
            className={`${
              transact.amount > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {parseInt(transact.amount).toFixed(2)} ₹
          </span>
        </div>
        <div className="hidden lg:block">
          <strong>TRANSACTION ID:</strong> {transact.transactionId}
        </div>
      </div>

      <div className="hidden sm:block sm:col-span-1">
        {transact.description}
      </div>
      <div className="hidden sm:block sm:col-span-1">
        {format(transact.date, "dd-MM-yyyy")}
      </div>
      <div
        className={`hidden sm:block sm:col-span-1 ${
          transact.amount > 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {parseInt(transact.amount).toFixed(2)} ₹
      </div>
      <div className="hidden sm:block sm:col-span-1">
        {transact.transactionId}
      </div>
    </div>
  );
};
