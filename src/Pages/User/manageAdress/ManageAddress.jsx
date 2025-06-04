import AlertDialogueButton from "@/Components/AlertDialogueButton";
import { SkeletonDemo } from "@/Components/SkeletonDemo";
import { Toast } from "@/Components/Toast";
import { showToast } from "@/Components/ToastNotification";
import axios from "@/axiosIntercepters/AxiosInstance";
import { logoutUser } from "@/redux/userSlice";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const ManageAddress = () => {
  const user = useSelector((state) => state.users.user);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/address?id=${user?._id}`);
        setAddresses(response.data.addresses);
      } catch (error) {
        if (
          error?.response.data.isBlocked ||
          error?.response.data.message == "token not found"
        ) {
          dispatch(logoutUser());
        }
        console.log(error);
      }
    })();
  }, [addresses]);

  const handleDeleteAddress = async (id) => {
    try {
      const response = await axios.delete(`/address?id=${id}`);
      showToast("success", response.data.message);
      window.location.reload();
    } catch (error) {
      console.log(error);
      Toast.fire({
        icon: "success",
        title: `${error.response.data.message}`,
      });
    }
  };

  return (
    <div className="font-mono flex justify-center items-center min-h-screen bg-gray-900 mx-auto overflow-y-scroll h-screen">
      <main className="p-4 sm:p-6 md:p-8 max-w-5xl w-full mx-auto bg-gray-800 shadow-lg rounded-lg overflow-y-auto h-5/6">
        <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-white">
          Manage Addresses
        </h1>
        <p className="text-center mb-6 text-xs sm:text-sm md:text-base text-gray-400">
          Manage your addresses easily. Add, edit, or delete addresses as
          needed.
        </p>
        <div className="flex justify-center mb-6">
          <Link
            to="/user/profile/addNewAdress"
            className="bg-blue-600 text-white py-2 px-4 rounded flex items-center hover:bg-blue-500 transition duration-200"
          >
            <i className="fas fa-plus mr-2"></i> Add New Address
          </Link>
        </div>
        <div className="space-y-4 ">
          {addresses.length > 0 ? (
            addresses.map((address, index) => (
              <div
                key={index}
                className="bg-gray-700 p-4 rounded text-white shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-white text-gray-900 py-1 px-2 rounded-full text-xs sm:text-sm">
                    {address.type}
                  </span>
                  <div className="space-x-4">
                    <Link
                      to={`/user/profile/editAddress/${address._id}`}
                      className="text-gray-400 hover:text-white transition duration-200"
                    >
                      Edit
                    </Link>
                    <AlertDialogueButton
                      name="delete"
                      onClick={() => handleDeleteAddress(address._id)}
                    />
                  </div>
                </div>
                <p className="text-xs sm:text-sm leading-6 text-gray-300">
                  {address.address}
                  <br />
                  {address.city}, {address.state}
                  <br />
                  {address.pincode}
                  <br />
                  Mobile: {address.mobileNumber}
                </p>
              </div>
            ))
          ) : (
            <>
              {/* <SkeletonDemo />
              <SkeletonDemo />
              <SkeletonDemo />
              <SkeletonDemo /> */}
              <p className="text-gray-400">No Address were added yet !</p>
            </>
          )}
        </div>
      </main>

      <style>{`
      .overflow-y-scroll::-webkit-scrollbar {
        width: 1px;
      }
      .overflow-y-scroll::-webkit-scrollbar-thumb {
        background-color: #4b5563; /* Gray-600 */
        border-radius: 8px;
      }
      .overflow-y-scroll::-webkit-scrollbar-track {
        background-color: #1f2937; /* Gray-800 */
      }
    `}</style>
    </div>
  );
};

export default ManageAddress;
