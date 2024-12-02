import React, { useEffect } from "react";
import { useState } from "react";
import axios from "@/axiosIntercepters/AxiosInstance";
import { Link } from "react-router-dom";
import Chart from "./Chart";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "@/redux/adminSlice";

export default function Dashboard() {
  const [recentSales, setRecentSales] = useState([]);
  const [filter, setFilter] = useState("Yearly");
  const [spinner, setSpinner] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    setSpinner(true);
    (async () => {
      try {
        const response = await axios.get(`/admin/recentSales?filter=${filter}`);
        setRecentSales(response.data.orders);
        setSpinner(false);
      } catch (error) {
        setSpinner(false);
        console.log(error?.response?.data?.message);
        if (
          error?.response.data.message == "Token not found" ||
          error?.response.data.message == "Failed to authenticate Admin"
        ) {
          dispatch(logoutAdmin());
        }
      }
    })();
  }, [filter]);

  const topTenSellingProducts = () => {
    let topSellingProducts = {};

    recentSales?.forEach((order) => {
      order?.orderItems.forEach((item) => {
        let productName = item.product.productName;
        if (topSellingProducts[productName]) {
          topSellingProducts[productName][1] += parseInt(item.quantity);
        } else {
          topSellingProducts[productName] = [
            ...item?.product?.productImage[0],
            parseInt(item?.quantity),
          ];
        }
      });
    });
    const topSellingProductsArray = Object.entries(topSellingProducts)
      .map(([productName, [productImage, quantity]]) => ({
        productName,
        productImage,
        quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity);

    return topSellingProductsArray;
  };

  const topTenSellingCategory = () => {
    let topSellingCategory = {};

    recentSales?.forEach((order) => {
      order?.orderItems.forEach((item) => {
        let categoryName = item.product?.category.name;
        if (topSellingCategory[categoryName]) {
          topSellingCategory[categoryName][1] += 1;
        } else {
          topSellingCategory[categoryName] = [item?.product?.category.image, 1];
        }
      });
    });
    const topTenSellingCategoryArray = Object.entries(topSellingCategory)
      .map(([categoryName, [categoryImage, quantity]]) => ({
        categoryName,
        categoryImage,
        quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity);

    return topTenSellingCategoryArray;
  };

  const topTenSellingBrand = () => {
    let topSellingBrand = {};

    recentSales?.forEach((order) => {
      order?.orderItems?.forEach((item) => {
        let brandName = item?.product?.brand.name;
        if (topSellingBrand[brandName]) {
          topSellingBrand[brandName][1] += 1;
        } else {
          topSellingBrand[brandName] = [item?.product?.brand.image, 1];
        }
      });
    });

    const topTenSellingBrandArray = Object.entries(topSellingBrand)
      .map(([brandName, [brandImage, quantity]]) => ({
        brandName,
        brandImage,
        quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity);

    return topTenSellingBrandArray;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {spinner && (
          <div className="spinner-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <StatsCard
          title="Total Sales"
          value={recentSales.reduce(
            (acc, order) =>
              acc +
              order.orderItems.reduce(
                (itemAcc, item) => itemAcc + parseInt(item.quantity || 0),
                0
              ),
            0
          )}
          bgColor="bg-gray-800"
        />
        <StatsCard
          title="Total Orders"
          value={recentSales.length}
          bgColor="bg-gray-800"
        />
        <StatsCard
          title="Users"
          value={new Set(recentSales.map((order) => order.user?.email)).size}
          bgColor="bg-gray-800"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full ">
        <div className="lg:col-span-2 bg-white p-6 rounded shadow">
          <div className="mb-4 flex space-x-4 font-mono">
            {["Monthly", "Yearly"].map((option) => (
              <button
                key={option}
                className={`px-4 py-2 rounded ${
                  filter === option
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <Chart orders={recentSales} filter={filter} />
        </div>
        <div className="bg-white p-6 rounded  shadow h-auto ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl  text-gray-400 font-bold ">Recent Sales</h2>
          </div>
          <div className="space-y-4 font-sans">
            {recentSales.length > 0 ? (
              recentSales
                ?.reverse()
                .slice(0, 8)
                .map((sale) => (
                  <div
                    key={sale?._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          sale.user.profileImage ||
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhCuoop0MD3fNefnFp8SWPdfnsXdOzFBeAQg&s"
                        }
                        alt=""
                        className="w-10 h-10 bg-gray-200 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-black">
                          {sale?.user?.firstName}
                          {""}
                          {sale?.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {sale?.orderDate}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-black">
                      ₹{" "}
                      {sale?.totalDiscount
                        ? sale?.totalDiscount
                        : sale?.totalAmount}
                    </span>
                  </div>
                ))
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500">"No Order Yet !</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <Link
            to={"/admin/orderReport"}
            className="bg-gray-300 p-3 rounded font-bold text-orange-600  shadow-lg hover:scale-105 duration-300"
          >
            Download Sales Report
          </Link>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row mt-10 gap-6">
        <div className="bg-white p-6 rounded  shadow-lg hover:scale-105 duration-300 w-full lg:w-2/3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl text-gray-400 font-bold">
              Top 10 Products
            </h2>
          </div>
          <div className="space-y-4 font-sans">
            {topTenSellingProducts().length > 0 ? (
              topTenSellingProducts()
                .slice(0, 10)
                .map((product, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-12"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          product.productImage ||
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhCuoop0MD3fNefnFp8SWPdfnsXdOzFBeAQg&s"
                        }
                        alt=""
                        className="w-10 h-10 bg-gray-200 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-black">
                          {product?.productName}
                        </p>
                        <p className="text-sm text-gray-500"></p>
                      </div>
                    </div>
                    <span className="font-medium text-black">
                      {product.quantity}
                      <span className="text-gray-600 text-sm ms-2">pcs</span>
                    </span>
                  </div>
                ))
            ) : (
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500">No Products Yet!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded  shadow-lg hover:scale-105 duration-300 w-full lg:w-2/3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl text-gray-400 font-bold">
              Top 10 Category
            </h2>
          </div>
          <div className="space-y-4 font-sans">
            {topTenSellingCategory().length > 0 ? (
              topTenSellingCategory()
                .slice(0, 10)
                .map((cat, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-12"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          cat.categoryImage ||
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhCuoop0MD3fNefnFp8SWPdfnsXdOzFBeAQg&s"
                        }
                        alt=""
                        className="w-10 h-10 bg-gray-200 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-black">
                          {cat.categoryName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {/* {sale?.orderDate} */}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-black">
                      {cat.quantity}{" "}
                      <span className="text-gray-600">Cat. sold</span>
                    </span>
                  </div>
                ))
            ) : (
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500">No Order Yet!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow-lg hover:scale-105 duration-300 w-full lg:w-2/3 ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl text-gray-400 font-bold">
              Top 10 Brands
            </h2>
          </div>
          <div className="space-y-4 font-sans">
            {topTenSellingBrand()?.length > 0 ? (
              topTenSellingBrand()
                .slice(0, 10)
                .map((brand, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-12"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          brand?.brandImage || "https://via.placeholder.com/40"
                        }
                        alt={brand?.brandName}
                        className="w-10 h-10 bg-gray-200 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-black">
                          {brand?.brandName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {/* {brand?.quantity} Brand sold */}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-black">
                      {/* ₹ {brand?.quantity * 100}{" "} */}
                      {/* Assuming ₹100 per item sold */}
                      {brand?.quantity} Brand sold
                    </span>
                  </div>
                ))
            ) : (
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500">No Sales Yet!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StatsCard({ title, value, bgColor }) {
  return (
    <div className={`${bgColor} p-6 rounded`}>
      <h3 className="text-gray-600 mb-2">{title}</h3>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
