import React, { useEffect, useState } from "react";
import axios from "@/axiosIntercepters/AxiosInstance";
import { format } from "date-fns";

import { useSelector } from "react-redux";
import { logoutUser } from "@/redux/userSlice";
const Wallet = () => {
  const [walletData, setWalletData] = useState({});
  const user = useSelector((state) => state.users.user);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/wallet/${user._id}`);
        setWalletData(response.data.wallet);
        response.data.wallet?.transaction?.reverse();
      } catch (error) {
        if (
          error?.response.data.isBlocked ||
          error?.response.data.message == "token not found"
        ) {
          dispatch(logoutUser());
        }
        console.error(error);
      }
    })();
  }, []);
  
  return (
    <div className="flex flex-col space-y-6 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-900 p-4 rounded">
        <div className="flex items-center gap-2 justify-center">
          <i className="fa-solid fa-wallet text-yellow-500 text-xl"></i>
          <p className="text-white font-bold text-xl">Wallet Balance</p>
        </div>

        <p className="font-bold text-green-600 text-xl mt-2 sm:mt-0">
          {walletData?.totalAmount ? walletData?.totalAmount.toFixed(2) : "0"} ₹
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
        ))}
      </section>
    </div>
  );
};

export default Wallet;
