import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PieChart = ({ orderStatusCount }) => {
  const chartData = {
    labels: Object.keys(orderStatusCount),
    datasets: [
      {
        label: "Order Status Distribution",
        data: Object.values(orderStatusCount),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 205, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Order Status Distribution",
      },
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div className="mt-4">
      <div className=" p-4 rounded shadow w-[350px] h-[300px]">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PieChart;
