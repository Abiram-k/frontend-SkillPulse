import axios from "@/axiosIntercepters/AxiosInstance";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Toast } from "../../../Components/Toast";
import { showToast } from "@/Components/ToastNotification";

const AddAddress = () => {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternativeMobile, setAlternativeMobile] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [type, setType] = useState("Home");
  const [message, setMessage] = useState({});
  const user = useSelector((state) => state.users.user);
  const navigate = useNavigate();
  const formValidate = () => {
    let error = {};
    const firstnameFirstCharacter = firstName.charAt(0);
    const secondnameFirstCharacter = secondName.charAt(0);

    if (firstName.trim() === "") error.firstName = "First name is required *";
    else if (!isNaN(firstnameFirstCharacter)) {
      error.firstName = "Name must start with a character *";
    }

    if (secondName.trim() === "") error.secondName = "Last name is required *";
    else if (!isNaN(secondnameFirstCharacter)) {
      error.secondName = "Last name must start with a character *";
    }

    if (!mobileNumber.trim())
      error.mobileNumber = "Mobile number is required *";
    else if (mobileNumber.length !== 10) {
      error.mobileNumber = "Please enter a 10-digit mobile number *";
    }
    if (alternativeMobile.length > 0 && alternativeMobile.length < 10)
      error.alternativeMobile = "Please enter  10-digit mobile number *";

    if (city.trim() === "") error.city = "City is required *";
    if (state.trim() === "") error.state = "State is required *";

    if (address.trim() === "") error.address = "Address is required *";
    else if (address.length < 8)
      error.address = "Address must be at least 8 characters *";

    if (pincode.trim() === "") error.pincode = "Pincode is required *";
    else if (pincode.length < 6) error.pincode = "Enter a valid pincode *";

    return error;
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const formErrors = formValidate();
    if (Object.keys(formErrors).length > 0) {
      setMessage(formErrors);
      return;
    }
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("secondName", secondName);
    formData.append("mobileNumber", mobileNumber);
    formData.append("alternativeMobile", alternativeMobile);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("address", address);
    formData.append("pincode", pincode);
    formData.append("type", type);

    try {
      const response = await axios.post(`/address?id=${user?._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response.data);

      showToast("success",response.data.message)
     
      navigate("/user/profile/manageAddress");
    } catch (error) {
      console.log(error.message);

      Toast.fire({
        icon: "error",
        title: `${error?.response.data.message}`,
      });
    }
  };

  return (
    <div className="content w-full lg:w-3/4 mx-auto p-6 text-sm">
      <h2 className="text-center mb-8 text-2xl font-semibold">Add Address</h2>
      <form
        className="max-w-lg mx-auto space-y-6 font-mono"
        onSubmit={handleAddAddress}
      >
        <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
          <div className="w-full lg:w-1/2">
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            {message.firstName && (
              <p className="text-red-500 text-xs">{message.firstName}</p>
            )}
          </div>
          <div className="w-full lg:w-1/2">
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="Last Name"
              type="text"
              value={secondName}
              onChange={(e) => setSecondName(e.target.value)}
            />
            {message.secondName && (
              <p className="text-red-500 text-xs">{message.secondName}</p>
            )}
          </div>
        </div>
  
        {/* Mobile and Alternate Mobile Numbers */}
        <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
          <div className="w-full lg:w-1/2">
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="Mobile Number"
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
            />
            {message.mobileNumber && (
              <p className="text-red-500 text-xs">{message.mobileNumber}</p>
            )}
          </div>
          <div className="w-full lg:w-1/2">
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="Alternate Number (Optional)"
              type="text"
              value={alternativeMobile}
              onChange={(e) => setAlternativeMobile(e.target.value)}
            />
            {message.alternativeMobile && (
              <p className="text-red-500 text-xs">{message.alternativeMobile}</p>
            )}
          </div>
        </div>
  
        {/* City and State */}
        <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
          <div className="w-full lg:w-1/2">
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="City / District / Town"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            {message.city && (
              <p className="text-red-500 text-xs">{message.city}</p>
            )}
          </div>
          <div className="w-full lg:w-1/2">
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="State"
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            {message.state && (
              <p className="text-red-500 text-xs">{message.state}</p>
            )}
          </div>
        </div>
  
        {/* Address */}
        <div>
          <textarea
            className="w-full py-2 px-3 border border-gray-300 rounded mb-4 text-black"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          ></textarea>
          {message.address && (
            <p className="text-red-500 text-xs">{message.address}</p>
          )}
        </div>
  
        {/* Pin Code and Address Type */}
        <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
          <div className="w-full lg:w-1/2">
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="Pin Code"
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
            {message.pincode && (
              <p className="text-red-500 text-xs">{message.pincode}</p>
            )}
          </div>
          <div className="w-full lg:w-1/2">
            <select
              name="type"
              id="type"
              className="w-full py-2 px-3 border border-gray-300 rounded border-none text-black focus:outline-none"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="home">Home</option>
              <option value="work">Work</option>
            </select>
          </div>
        </div>
  
        {/* Submit Button */}
        <button
          type="submit"
          className="block bg-blue-600 text-white py-2 px-4 rounded mx-auto hover:bg-blue-500 transition duration-200"
        >
          Submit
        </button>
      </form>
    </div>
  );
  
};

export default AddAddress;
