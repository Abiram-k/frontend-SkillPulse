"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card.jsx";

export default function Chart({ orders, filter }) {
  const [chartData, setChartData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    if (orders && orders.length > 0) {
      processData();
    }
  }, [orders, filter, selectedMonth])

  const processData = () => {
    if (filter === "Yearly") {
      processYearlyData();
    } else {
      processMonthlyData();
    }
  };

  const processYearlyData = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const initialMonthData = months.reduce((acc, month) => {
      acc[month] = { revenue: 0, orders: 0 };
      return acc;
    }, {});

    orders.forEach((order) => {
      const [day, month, year] = order.orderDate.split("/");
      initialMonthData[months[month - 1]].orders += 1;
      const revenue = order.totalDiscount || order.totalAmount;
      initialMonthData[months[month - 1]].revenue += revenue;
    });

    const monthlyOrders = months.map((month) => ({
      label: month,
      orders: initialMonthData[month].orders,
      revenue: initialMonthData[month].revenue,
    }));

    setChartData(monthlyOrders);
  };

  const processMonthlyData = () => {
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    const weeklyData = weeks.reduce((acc, week) => {
      acc[week] = { revenue: 0, orders: 0 };
      return acc;
    }, {});

    orders.forEach((order) => {
      const [day, month, year] = order.orderDate.split("/");
      if (parseInt(month) === selectedMonth + 1) {
        const weekNumber = Math.ceil(parseInt(day) / 7);
        const revenue = order.totalDiscount || order.totalAmount;
        weeklyData[`Week ${weekNumber}`].orders += 1;
        weeklyData[`Week ${weekNumber}`].revenue += revenue;
      }
    });

    const weeklyOrders = weeks.map((week) => ({
      label: week,
      orders: weeklyData[week].orders,
      revenue: weeklyData[week].revenue,
    }));

    setChartData(weeklyOrders);
  };

  const changeMonth = (direction) => {
    setSelectedMonth((prevMonth) => {
      let newMonth = prevMonth + direction;
      if (newMonth < 0) newMonth = 11;
      if (newMonth > 11) newMonth = 0;
      return newMonth;
    });
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <Card className="w-full font-mono">
      {chartData.length > 0 ? (
        <>
          <CardHeader>
            <CardTitle className="text-gray-600">Total Orders</CardTitle>
            <CardDescription className="text-gray-500">
              {filter === "Yearly"
                ? "January - December 2024"
                : `${months[selectedMonth]} 2024`}
            </CardDescription>
            <div className="flex justify-between items-center mt-4">
              <p></p>
              {filter === "Monthly" && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  >
                    &lt;
                  </button>
                  <span className="text-gray-600">{months[selectedMonth]}</span>
                  <button
                    onClick={() => changeMonth(1)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="2 2" />
                  <XAxis
                    dataKey="label"
                    tickFormatter={
                      (value) =>
                        filter === "Yearly" ? value.slice(0, 3) : value // to make monthname within 3 letters
                    }
                  />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            style={{
                              background: "#ffffff",
                              border: "1px solid #cccccc",
                              padding: "8px",
                              borderRadius: "4px",
                            }}
                          >
                            <p
                              style={{
                                fontWeight: "bold",
                                margin: 0,
                                color: "black",
                              }}
                            >
                              {label}
                            </p>
                            <p style={{ margin: 0, color: "gray" }}>
                              Revenue: <strong>₹{data.revenue}</strong>
                            </p>
                            <p style={{ margin: 0, color: "gray" }}>
                              Orders: <strong>{data.orders}</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #cccccc",
                    }}
                  />

                  <Bar dataKey="revenue" fill="#2563eb" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this {filter === "Yearly" ? "year" : "month"}{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total orders for{" "}
              {filter === "Yearly"
                ? "the last 12 months"
                : "the selected month"}
            </div>
          </CardFooter>
        </>
      ) : (
        <p>Nothing to show</p>
      )}
    </Card>
  );
}
