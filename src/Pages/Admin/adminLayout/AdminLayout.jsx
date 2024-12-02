import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Settings,
  LogOut,
  Users,
  Package,
  FileText,
  Image,
  Tag,
  CreditCard,
  ShoppingBag,
  Percent,
  Bandage,
} from "lucide-react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "../../../redux/adminSlice";
import { Badge } from "@/Components/ui/badge";
import axiosInstance from "@/axiosIntercepters/AxiosInstance";
import { showToast } from "@/Components/ToastNotification";

// Sample data for the chart
const chartData = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  sales: Math.floor(Math.random() * 7000) + 1000,
}));

const recentSales = [
  { id: 1, name: "James B", amount: "₹61,231.00", time: "30 minutes ago" },
  { id: 2, name: "Megan Markle", amount: "₹263,099.00", time: "5 minutes ago" },
  { id: 3, name: "Amy", amount: "₹45,922.00", time: "15 minutes ago" },
  { id: 4, name: "James B", amount: "₹61,231.00", time: "30 minutes ago" },
  { id: 5, name: "Megan Markle", amount: "₹263,099.00", time: "5 minutes ago" },
];

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  useEffect(() => {
    const fetchReturnedProducts = async () => {
      try {
        const response = await axiosInstance.get(`admin/order`);
        setNotificationCount(() => {
          return response.data.orderData.reduce((acc, order) => {
            const hasReturnDescription = order.orderItems.some(
              (item) =>
                item.returnDescription && item.productStatus == "delivered"
            );
            if (hasReturnDescription) {
              return acc + order.orderItems.length;
            }
            return acc;
          }, 0);
        });
      } catch (error) {
        console.error("Error fetching returned products:", error);
      }
    };

    fetchReturnedProducts();
  }, [notificationCount]);

  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex bg-slate-200">
      <button
        className="fixed top-4 left-4 z-20 text-black md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16m-7 6h7"
          ></path>
        </svg>
      </button>

      <aside
        className={`fixed top-0 left-0  w-64 bg-white text-black transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:block`}
      >
        <div className="p-4 bg-slate-300 h-screen">
          <button className="text-2xl font-bold mb-8">SkillPulse</button>
          <nav className="lg:space-y-12 flex flex-col ">
            <div className="flex flex-col lg:space-y-3">
              <NavItem icon={Menu} text="Dashboard" redirect="dashboard" />
              <NavItem icon={Users} text="Customers" redirect="customers" />
              <NavItem icon={Package} text="Products" redirect="products" />
              <NavItem icon={FileText} text="Orders" redirect="orders" />
              <NavItem icon={Image} text="Banner" redirect="bannerMangement" />
              <NavItem icon={Tag} text="Coupon" redirect="coupon" />
              <NavItem icon={CreditCard} text="Payments" redirect="dashboard" />
              <NavItem icon={ShoppingBag} text="Category" redirect="category" />
              <NavItem icon={Bandage} text="Brand" redirect="brand" />
              <NavItem
                icon={Bell}
                text="Notifications"
                redirect="notifications"
              />
            </div>
            <div>
              <NavItem icon={Settings} text="Settings" redirect="settings" />
              <NavItem icon={LogOut} text="Logout" redirect="/admin/login" />
            </div>
          </nav>
        </div>
      </aside>

      <main className="flex-1 ml-0 md:ml-64 p-8 transition-all duration-300 ">
        <div className="flex justify-between items-center mb-8 ">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/admin/notifications")}
            >
              <Bell className="h-6 w-6 text-yellow-700" />
              <div className="absolute -top-1 -right-1 font-mono flex items-center justify-center h-4 w-4 bg-red-600 text-white text-xs rounded-full">
                {notificationCount || 0}
              </div>
            </div>

            <div className="flex items-center gap-2 ">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSntF7sVICaZX72XQZ9FTjq_uRbZlN8t9uqwA&s"
                alt="admin logo"
                n
                className="w-8 h-8 bg-gray-500 text-black rounded "
              />
              <span className="text-black">Abiram</span>
            </div>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

// Helper Components
function NavItem({ icon: Icon, text, active, redirect }) {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    dispatch(logoutAdmin());

    try {
      const response = await axiosInstance.post("/admin/logout");
      showToast("success", "Logged Out sucessfully");
    } catch (error) {
      console.log(error);
      showToast("error", error.response.data.message);
    }
  };
  return (
    <>
      <Link
        to={redirect}
        onClick={text == "Logout" && handleLogout}
        className={`flex items-center gap-3 w-full p-2 rounded transition-colors ${
          active
            ? "bg-gray-800 text-white"
            : "hover:bg-gray-800 hover:text-white"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{text}</span>
      </Link>
    </>
  );
}
