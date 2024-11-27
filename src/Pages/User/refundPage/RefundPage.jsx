import React from "react";

const RefundPage = () => {
  return (
    <div>
      <main className="w-3/4 p-4 font-mono">
        <div className="flex space-x-4 mb-4">
          <img
            src="https://placehold.co/100x100"
            alt="Product image of boAt Immortal 131 with Beast Mode"
            className="w-24 h-24"
          />
          <div>
            <div className="text-green-500">Shipped</div>
            <div className="font-bold">boAt Immortal 131 with Beast Mode</div>
            <div>Order Date : 10/04/2023</div>
            <div>Order Number : #112-112133213</div>
            <div>Prize : 11,9000 RS</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="place"
            className="p-2 bg-gray-700 rounded"
            value="Ernakulam"
          />
          <input
            type="text"
            placeholder="name"
            className="p-2 bg-gray-700 rounded"
            value="abiram"
          />
          <input
            type="text"
            placeholder="amount paid"
            className="p-2 bg-gray-700 rounded"
            value="11,900"
          />
          <input
            type="text"
            placeholder="email"
            className="p-2 bg-gray-700 rounded"
            value="Abiram@gmail.com"
          />
          <input
            type="text"
            placeholder="refund amount"
            className="p-2 bg-gray-700 rounded"
            value="11,900"
          />
          <input
            type="text"
            placeholder="order Id"
            className="p-2 bg-gray-700 rounded"
          />
          <div className="col-span-2">Refund period: 5 - 7 days</div>
          <textarea
            placeholder="reason for cancelling"
            className="col-span-2 p-2 bg-gray-700 rounded h-24"
          >
            Type your Reason ...
          </textarea>
          <button className="col-span-2 p-2 bg-red-500 rounded">CONFIRM</button>
        </div>
      </main>
    </div>
  );
};

export default RefundPage;
