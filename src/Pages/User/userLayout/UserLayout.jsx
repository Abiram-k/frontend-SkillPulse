import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import paymentTag from "../../../assets/paymentTags.png";
import { BadgeDemo } from "@/Components/BadgeDemo";

function UserLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  return (
    <>
      <div className="bg-[#1C1C1C] text-white p-4 flex justify-between items-center sticky top-0 z-50 ">
        <div className="text-sm w-full lg:w-fit lg:text-2xl font-bold">
          <Link to={"/user/home"}>SKILL PULSE</Link>
        </div>

        <button
          id="menu-btn"
          className="absolute right-4  block lg:hidden text-white text-end focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } flex-col lg:flex-row lg:flex lg:space-x-4 lg:items-center absolute lg:static bg-black lg:bg-transparent top-16 left-0 w-full lg:w-auto z-10 text-center space-y-8 lg:space-y-0 pb-8 lg:p-0`}
        >
          <Link
            to="/user/home"
            className="text-white no-underline hover:bg-slate-600 rounded p-1 transition duration-200"
          >
            HOME
          </Link>
          <Link
            to="/user/shop"
            className="text-white no-underline hover:bg-slate-600 rounded p-1 transition duration-200"
          >
            SHOP
          </Link>
          <Link
            to="/user/shop"
            className="text-white no-underline hover:bg-slate-600 rounded p-1 transition duration-200"
          >
            CATEGORY
          </Link>
          <Link
            to="/user/contact"
            className="text-white no-underline hover:bg-slate-600 rounded p-1"
          >
            CONTACT
          </Link>
          <a
            href="/user/about"
            className="text-white no-underline hover:bg-slate-600 rounded p-1"
          >
            ABOUT US
          </a>
        </div>

        <div className="flex gap-4 text-lg justify-center lg:justify-end w-full lg:w-auto me-6">
          <Link to="search">
            <i className="fas fa-search lg:text-xl"></i>
          </Link>
          <Link to={"wishlist"}>
            <i className="fas fa-heart text-red-500 lg:text-xl"></i>
          </Link>
          <div className="relative">
            <Link to={"cart"}>
              {cartCount > 0 && <BadgeDemo quantity={cartCount} />}
              <i className="fas fa-shopping-cart lg:text-xl"></i>
            </Link>
          </div>
          <Link to={"profile"}>
            <i className="fas fa-user-circle lg:text-xl"></i>
          </Link>
        </div>
      </div>
      <Outlet context={{ setCartCount }} />
      <footer
        style={{ fontfamily: "Montserrat" }}
        className="bg-black text-gray-400 py-8 flex flex-col space-y-11 border-t-2 border-gray-700"
      >
        <div className="flex flex-wrap justify-around gap-8">
          <div className="text-center flex flex-col items-center w-1/3 md:w-auto">
            <i className="fas fa-shipping-fast text-2xl mb-2"></i>
            <p className="font-semibold">EXPRESS SHIPPING</p>
            <p>Shipping in 24 Hours</p>
          </div>

          <div className="text-center flex flex-col items-center w-1/3 md:w-auto">
            <i className="fas fa-truck text-2xl mb-2"></i>
            <p className="font-semibold">SHIPPING TRACKING</p>
            <p>Online order tracking available</p>
          </div>

          <div className="text-center flex flex-col items-center w-1/3 md:w-auto">
            <i className="fas fa-shield-alt text-2xl mb-2"></i>
            <p className="font-semibold">BUY SAFELY</p>
            <p>Buy safely, any question is here to help!</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-around mt-8 gap-8">
          <div className="text-center w-1/2 md:w-auto">
            <h3 className="font-bold">CUSTOMER SERVICE</h3>
            <ul className="mt-2 space-y-2">
              <li>Contact us</li>
              <li>Shipping & Returns</li>
              <li>Terms & Conditions</li>
              <li>Delivery</li>
            </ul>
          </div>

          <div className="text-center w-1/2 md:w-auto">
            <h3 className="font-bold">INFORMATION</h3>
            <ul className="mt-2 space-y-2">
              <li>About</li>
              <li>Payments</li>
              <li>Size guide</li>
              <li>Administrator</li>
            </ul>
          </div>

          <div className="text-center w-1/2 md:w-auto">
            <h3 className="font-bold">FOLLOW US</h3>
            <div className="flex justify-center space-x-4 mt-2">
              <i className="fab fa-facebook-f"></i>
              <i className="fab fa-instagram"></i>
              <i className="fab fa-linkedin-in"></i>
            </div>
          </div>

          <div className="text-center w-1/2 md:w-auto">
            <h3 className="font-bold">CONTACT US</h3>
            <ul className="mt-2 space-y-2">
              <li>+91 6282004572</li>
              <li>info@skillpulse.com</li>
              <li>10:00 – 20:00 GMT+1</li>
            </ul>
          </div>
        </div>

        <div className=" mt-8 max-w-sm ">
          <img
            src={paymentTag || "https://placehold.co/100x50"}
            alt="Payment methods"
            className="mx-auto w-2/4"
          />
          <p className="text-center text-gray-300 font-bold font-mono">
            All Credit by <span className="uppercase">Abiram </span>
          </p>
        </div>
      </footer>
    </>
  );
}

export default UserLayout;
