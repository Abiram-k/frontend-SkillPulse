import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Link, Outlet } from "react-router-dom";
import { User, Package, MapPin, Wallet, LogOut } from "lucide-react";
import { logoutUser } from "../../../redux/userSlice";
import axios from "@/axiosIntercepters/AxiosInstance";
import axiosInstance from "@/axiosIntercepters/AxiosInstance";
import { showToast } from "@/Components/ToastNotification";

function AccountLayout() {
  const [profileImage, setProfileImage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const user = useSelector((state) => state.users.user);

  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/logout");
      showToast("success", response.data.message);
      dispatch(logoutUser());
    } catch (error) {
      console.log(error);
      showToast("error", error.response.data.message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/user`);
        setProfileImage(response.data?.userData.profileImage);
      } catch (error) {
        if (
          error?.response.data.isBlocked ||
          error?.response.data.message == "token not found"
        ) {
          dispatch(logoutUser());
        }
        console.log(error?.response?.data?.message, "Error");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen text-white ">
      <div className="container mx-auto p-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 bg-gray-700 rounded-full flex items-center justify-center mb-4"
        >
          {/* Hamburger Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        <div className="flex gap-6">
          <div
            className={`${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 fixed lg:static top-0 left-0 w-64 bg-black h-full lg:h-auto lg:bg-transparent lg:flex flex-col p-4 transition-transform duration-300 ease-in-out z-50 lg:z-0 `}
          >
            <div className="bg-black rounded-lg p-4 mb-4 lg:mt-5 z-50 ">
              <div className="flex items-center gap-3 mb-6">
                <label
                  htmlFor="fileInput"
                  className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden cursor-pointer bg-yellow-400"
                >
                  {profileImage ? (
                    <img
                      aria-disabled
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover cursor-default"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-800" />
                  )}
                </label>

                <span className="font-semibold">
                  {user.firstName || "Abiram k"}
                </span>
              </div>

              <nav className="space-y-2">
                <Link
                  to=""
                  className={`w-full flex items-center gap-3 p-2 hover:bg-gray-600 rounded-lg text-left ${
                    location.pathname.endsWith("profile") ? "bg-gray-700" : ""
                  }
`}
                >
                  <User className="w-5 h-5" />
                  Account Overview
                </Link>
                <Link
                  to="myOrders"
                  className={`w-full flex items-center gap-3 p-3 hover:bg-gray-600 rounded-lg text-left ${
                    location.pathname.includes("myOrders") ? "bg-gray-700" : ""
                  }`}
                >
                  <Package className="w-5 h-5" />
                  My Orders
                </Link>
                <Link
                  to="manageAddress"
                  className={`w-full flex items-center gap-3 p-3 hover:bg-gray-600 rounded-lg text-left ${
                    location.pathname.includes("manageAddress")
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  Manage Addresses
                </Link>
                <Link
                  to="wallet"
                  className={`w-full flex items-center gap-3 p-3 hover:bg-gray-600 rounded-lg text-left ${
                    location.pathname.includes("wallet") ? "bg-gray-700" : ""
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  Wallet
                </Link>
              </nav>

              <button
                className="w-full mt-6 bg-red-600 text-white py-2 rounded-xl flex items-center  justify-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                LOGOUT
              </button>
            </div>
          </div>

          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black opacity-50 lg:hidden"
              onClick={toggleSidebar}
            ></div>
          )}

          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountLayout;
