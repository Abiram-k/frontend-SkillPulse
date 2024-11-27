import React from "react";

const Spinner = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-transparent">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;
