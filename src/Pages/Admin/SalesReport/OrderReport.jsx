import axios from "@/axiosIntercepters/AxiosInstance";
import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ArrowDown } from "lucide-react";
import PieChart from "./PieChart";
import * as XLSX from "xlsx";

const OrderReport = () => {
  const [filter, setFilter] = useState("Daily");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [totalCategoryDiscount, setTotalCategoryDiscount] = useState("");
  const [totalCouponDiscount, setTotalCouponDiscount] = useState("");
  const [totalProductDiscount, setTotalProductDiscount] = useState("");
  const [salesData, setSalesData] = useState([
    {
      slNo: "",
      orderNumber: "",
      orderDate: "",
      productName: "",
      paymentMethod: "",
      userName: "",
      phoneNumber: "",
    },
  ]);
  useEffect(() => {
    if (filter !== "Custom") {
      setStartDate("");
      setEndDate("");
    }
    (async () => {
      try {
        const response = await axios(
          `/admin/recentSales?filter=${filter}&startDate=${startDate}&endDate=${endDate}`
        );
        setOrders(response?.data?.orders);
        const updatedSalesData = [];

        response?.data?.orders.forEach((order) => {
          order?.orderItems.forEach((item, index) => {
            updatedSalesData.push({
              slNo: index + 1,
              orderNumber: order.orderId,
              orderDate: order.orderDate,
              orderStatus: item.productStatus,
              productName: item.product.productName,
              userName: order.user.firstName,
              phoneNumber: order.user.mobileNumber,
              paymentMethod: order.paymentMethod,
              paymentStatus: order.paymentStatus,
              grandTotal: item.totalPrice,
              totalDiscount: item.price,
              discountedAmount: item.totalPrice - item.price || 0,
            });
          });
        });
        setSalesData(updatedSalesData);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [filter, startDate, endDate]);

  const reportRef = useRef();

  const paymentMethodCounts = orders.reduce((acc, order) => {
    const method = order.paymentMethod;
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  const downloadPDF = async () => {
    const reportElement = reportRef.current;

    const canvas = await html2canvas(reportElement, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    pdf.save(`${filter} Sales-report.pdf`);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(salesData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${filter} Sales Report`);
    XLSX.writeFile(workbook, "sales_report.xlsx");
  };

  const calculateTotalProductOffer = () => {
    let total = 0;
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (item.product.offer > item.product.categoryOffer)
          total = item.product.regularPrice - item.product.salesPrice;
      });
    });
    return total;
  };
  const calculateTotalCategoryOffer = () => {
    let total = 0;
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (item.product.categoryOffer) {
          if (item.product.offer < item.product.categoryOffer)
            total = item.product.regularPrice - item.product.salesPrice;
        }
      });
    });
    return total;
  };

  const orderStatusCount = orders.reduce((acc, order) => {
    order.orderItems.forEach(
      (item) => (acc[item.productStatus] = (acc[item.productStatus] || 0) + 1)
    );
    return acc;
  }, {});

  const topSellingProduct = () => {
    const productQuantities = {};
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (productQuantities[item.product.productName]) {
          productQuantities[item.product.productName] += Number(item.quantity);
        } else {
          productQuantities[item.product.productName] = Number(item.quantity);
        }
      });
    });
    let topSellingProduct = null;
    let maxQuantity = 0;

    for (const product in productQuantities) {
      if (productQuantities[product] > maxQuantity) {
        maxQuantity = productQuantities[product];
        topSellingProduct = product;
      }
    }
    return { topSellingProduct, maxQuantity };
  };

  const costumers = {};
  const totalCustomers = () => {
    orders.forEach((order, index) => {
      if (costumers[order.user._id]) {
        costumers[order.user._id] = costumers[order.user._id] + 1;
      } else {
        costumers[order.user._id] = 1;
      }
    });
    return Object.keys(costumers).length;
  };

  return (
    <div className="p-6 font-mono rounded ">
      <h2 className="text-2xl font-bold mb-4 text-gray-400 ms-1">
        Order Report
      </h2>
      <div className="flex justify-between">
        <div className="mb-4 flex space-x-4">
          {["Daily", "Weekly", "Monthly", "Custom"].map((option) => (
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
        {filter === "Custom" && (
          <div className="mb-4 flex space-x-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded text-black"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded text-black"
            />
          </div>
        )}
        <div className="flex gap-2">
          <button
            className="bg-green-500 rounded shadow-md font-bold px-4 h-10 flex items-center justify-center space-x-1"
            onClick={downloadPDF}
          >
            <ArrowDown className="w-4 h-4" />
            <span>Download pdf</span>
          </button>
          <button
            className="bg-green-500 rounded shadow-md font-bold px-4 h-10 flex items-center justify-center space-x-1"
            onClick={downloadExcel}
          >
            <ArrowDown className="w-4 h-4" />
            <span>Download Excel</span>
          </button>
        </div>
      </div>
      <div className="p-6 rounded bg-white shadow-lg" ref={reportRef}>
        <h3 className="text-3xl font-extrabold mb-6 text-gray-900">
          {`${filter == "Daily" ? "Today's" : filter}`} Sales Report
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded shadow-md">
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-semibold text-gray-800">Summary</h3>
            <p className="text-lg text-gray-700">
              Total Orders:{" "}
              <span className="font-semibold text-gray-900">
                {orders?.length}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Total Customers:{" "}
              <span className="font-semibold text-gray-900">
                {totalCustomers()}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Total Revenue: ₹
              <span className="font-semibold text-gray-900">
                {orders
                  .reduce((acc, order) => order?.totalAmount + acc, 0)
                  .toFixed(2)}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Total Revenue after Discount: ₹
              <span className="font-semibold text-gray-900">
                {Math.round(
                  orders.reduce((acc, order) => order?.totalDiscount + acc, 0)
                ).toFixed(2)}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-semibold text-gray-800">
              Top Selling Product
            </h3>
            <p className="text-lg text-gray-700">
              Product Name:{" "}
              <span className="font-semibold text-gray-900">
                {topSellingProduct().topSellingProduct}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Quantity Purchased:{" "}
              <span className="font-semibold text-gray-900">
                {topSellingProduct().maxQuantity}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Total Discounts
            </h3>
            <p className="text-lg text-gray-700">
              Coupon: ₹
              <span className="font-semibold text-gray-900">
                {Math.round(
                  orders.reduce((acc, order) => order?.totalAmount + acc, 0) -
                    orders.reduce((acc, order) => order?.totalDiscount + acc, 0)
                ).toFixed(2)}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Product Offer: ₹
              <span className="font-semibold text-gray-900">
                {calculateTotalProductOffer().toFixed(2)}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Category Offer: ₹
              <span className="font-semibold text-gray-900">
                {calculateTotalCategoryOffer().toFixed(2)}
              </span>
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Payment Method Usage
            </h3>
            {Object.keys(paymentMethodCounts).map((method) => (
              <p key={method} className="text-lg text-gray-700">
                {method}:{" "}
                <span className="font-semibold text-gray-900">
                  {paymentMethodCounts[method]}
                </span>
              </p>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-6 rounded shadow-md flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Order Status
            </h3>
            {Object.keys(orderStatusCount).map((status) => (
              <p key={status} className="text-lg text-gray-700">
                {status}:{" "}
                <span className="font-semibold text-gray-900">
                  {orderStatusCount[status]}
                </span>
              </p>
            ))}
          </div>
          <PieChart orderStatusCount={orderStatusCount} />
        </div>

        <div className="overflow-x-auto mt-6 rounded shadow-md">
          <table className="min-w-full bg-white border border-gray-200 rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 border text-sm text-gray-600">
                  Order ID
                </th>
                <th className="px-6 py-3 border text-sm text-gray-600">Date</th>
                <th className="px-6 py-3 border text-sm text-gray-600">
                  Customer
                </th>
                <th className="px-6 py-3 border text-sm text-gray-600">
                  Payment Method
                </th>
                <th className="px-6 py-3 border text-sm text-gray-600">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {orders?.length > 0 ? (
                orders.map((order) => (
                  <tr key={order?.id} className="text-center text-gray-700">
                    <td className="px-6 py-3 border">{order?.orderId}</td>
                    <td className="px-6 py-3 border">{order?.orderDate}</td>
                    <td className="px-6 py-3 border">
                      {order?.user.firstName} {order?.user?.lastName}
                    </td>
                    <td className="px-6 py-3 border">{order?.paymentMethod}</td>
                    <td className="px-6 py-3 border">₹{order?.totalAmount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-3 border text-center text-gray-600"
                  >
                    No orders found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderReport;
