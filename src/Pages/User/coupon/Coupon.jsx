import React, { useState } from "react";

const Coupon = () => {
  const [couponCode, setCouponCode] = useState("");

  const handleCouponSubmit = () => {
    // console.log("Coupon code:", couponCode);
  };

  return (
    <div className="bg-black text-gray-200 min-h-screen">
      <section className="py-8 px-6">
        <h2 className="text-2xl font-bold mb-4">Apply Coupon Code</h2>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Enter your code..."
            className="bg-gray-800 border-gray-600 border rounded-lg py-2 px-4 flex-1 mr-4"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
            onClick={handleCouponSubmit}
          >
            Apply
          </button>
        </div>
        <div className="mt-4">
          <p>By applying coupon code you agreed to our terms and conditions</p>
        </div>
        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-bold mb-2">$ 100 off (FIRST PURCHASE)</h3>
          <p>code : LM10</p>
          <p>₹100 off on orders above ₹1,500</p>
          <p>Expires on 31-12-2024</p>
        </div>
        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-bold mb-2">$ 200 off (FIRST PURCHASE)</h3>
          <p>code : NJR10</p>
          <p>₹200 off on orders above ₹2,999</p>
          <p>Expires on 31-12-2024</p>
        </div>
      </section>
    </div>
  );
};

export default Coupon;
