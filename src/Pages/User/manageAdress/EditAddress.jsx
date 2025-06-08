import { Toast } from "@/Components/Toast";
import { showToast } from "@/Components/ToastNotification";
import axios from "@/axiosIntercepters/AxiosInstance";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const EditAddress = () => {
  const [currentAddress, setCurrentAddress] = useState({});
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternativeMobile, setAlternativeMobile] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState({});
  const [addressDetails, setAddressDetails] = useState("");
  const [isChanged, setIsChanged] = useState(false);

  const user = useSelector((state) => state.users.user);
  const navigate = useNavigate();
  const { address } = useParams();

  const formValidate = () => {
    let error = {};

    const nameRegex = /^[A-Za-z][A-Za-z\s]*$/; // Names should start with letters, and allow spaces.
    const mobileRegex = /^\d{10}$/; // Exactly 10 digits.
    const pincodeRegex = /^\d{6}$/; // Exactly 6 digits.
    const addressRegex = /^.{8,}$/; // Minimum 8 characters for address.

    if (firstName.trim() === "") {
      error.firstName = "First name is required *";
    } else if (!nameRegex.test(firstName)) {
      error.firstName =
        "First name must start with a letter and contain only letters *";
    }

    if (secondName.trim() === "") {
      error.secondName = "Last name is required *";
    } else if (!nameRegex.test(secondName)) {
      error.secondName =
        "Last name must start with a letter and contain only letters *";
    }

    if (!mobileNumber.trim()) {
      error.mobileNumber = "Mobile number is required *";
    } else if (!mobileRegex.test(mobileNumber)) {
      error.mobileNumber = "Please enter a valid 10-digit mobile number *";
    }

    if (alternativeMobile.trim()) {
      if (!mobileRegex.test(alternativeMobile)) {
        error.alternativeMobile =
          "Please enter a valid 10-digit alternative mobile number *";
      }
    }

    if (city.trim() === "") {
      error.city = "City is required *";
    } else if (!nameRegex.test(city)) {
      error.city = "City must contain only letters and spaces *";
    }

    if (state.trim() === "") {
      error.state = "State is required *";
    } else if (!nameRegex.test(state)) {
      error.state = "State must contain only letters and spaces *";
    }

    if (!addressDetails.trim()) {
      error.addressDetails = "Address is required *";
    } else if (addressDetails.trim().length < 8) {
      error.addressDetails = "Address must be at least 8 characters long *";
    }

    if (pincode.trim() === "") {
      error.pincode = "Pincode is required *";
    } else if (!pincodeRegex.test(pincode)) {
      error.pincode = "Enter a valid 6-digit pincode *";
    }
    return error;
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/editAddress?id=${address}`);
        setCurrentAddress(response.data.address);
        setFirstName(response.data.address.firstName);
        setSecondName(response.data.address.secondName);
        setAlternativeMobile(response.data.address.alternativeMobile);
        setCity(response.data.address.city);
        setPincode(response.data.address.pincode);
        setState(response.data.address.state);
        setType(response.data.address.type);
        setMobileNumber(response.data.address.mobileNumber);
        setAddressDetails(response.data.address.address);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const handleEditAddress = async (e) => {
    e.preventDefault();
    const formErrors = formValidate();
    if (Object.keys(formErrors).length > 0) {
      setMessage(formErrors);
      return;
    }
    if (!isChanged) {
      navigate("/user/profile/manageAddress");
      return;
    }
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("secondName", secondName);
    formData.append("mobileNumber", mobileNumber);
    formData.append("alternativeMobile", alternativeMobile);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("pincode", pincode);
    formData.append("type", type);
    formData.append("address", addressDetails);
    try {
      if (Object.keys(formErrors).length == 0) {
        const response = await axios.put(
          `/address?id=${currentAddress._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        showToast("success", response.data.message);
        navigate("/user/profile/manageAddress");
      }
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: `${error?.response?.data.message}`,
      });
      console.log(error);
    }
  };

  return (
    <div className="content w-full lg:w-3/4 mx-auto p-4 sm:p-6 text-sm">
      <h2 className="text-center mb-6 lg:mb-8 text-xl lg:text-2xl font-semibold">
        Edit Address
      </h2>
      <form className="max-w-lg mx-auto space-y-4 sm:space-y-6 font-mono">
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-[48%] flex flex-col space-y-2">
            <label className="block mb-1 text-sm text-gray-500">
              First Name
            </label>
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => {
                setIsChanged(true);
                setFirstName(e.target.value);
              }}
              type="text"
            />
            {message.firstName && (
              <p className="text-red-500 text-xs">{message.firstName}</p>
            )}
          </div>
          <div className="w-full sm:w-[48%] flex flex-col space-y-2">
            <label className="block mb-1 text-sm text-gray-500">
              Second Name
            </label>
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="Last Name"
              type="text"
              value={secondName}
              onChange={(e) => {
                setIsChanged(true);
                setSecondName(e.target.value);
              }}
            />
            {message.secondName && (
              <p className="text-red-500 text-xs">{message.secondName}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-[48%] flex flex-col space-y-2">
            <label className="block mb-1 text-sm text-gray-500">Mobile</label>
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="Mobile Number"
              type="text"
              value={mobileNumber}
              onChange={(e) => {
                setIsChanged(true);
                setMobileNumber(e.target.value);
              }}
            />
            {message.mobileNumber && (
              <p className="text-red-500 text-xs">{message.mobileNumber}</p>
            )}
          </div>
          <div className="w-full sm:w-[48%] flex flex-col space-y-2">
            <label className="block mb-1 text-sm text-gray-500">
              Alternative Mobile
            </label>
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="Alternate Number (Optional)"
              type="text"
              value={alternativeMobile}
              onChange={(e) => {
                setIsChanged(true);
                setAlternativeMobile(e.target.value);
              }}
            />
            {message.alternativeMobile && (
              <p className="text-red-500 text-xs">
                {message.alternativeMobile}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-[48%] flex flex-col space-y-2">
            <label className="block mb-1 text-sm text-gray-500">City</label>
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="City / District / Town"
              type="text"
              value={city}
              onChange={(e) => {
                setIsChanged(true);
                setCity(e.target.value);
              }}
            />
            {message.city && (
              <p className="text-red-500 text-xs">{message.city}</p>
            )}
          </div>
          <div className="w-full sm:w-[48%] flex flex-col space-y-2">
            <label className="block mb-1 text-sm text-gray-500">State</label>
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="State"
              type="text"
              value={state}
              onChange={(e) => {
                setIsChanged(true);
                setState(e.target.value);
              }}
            />
            {message.state && (
              <p className="text-red-500 text-xs">{message.state}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-[48%] flex flex-col space-y-2">
            <label className="block mb-1 text-sm text-gray-500">Address</label>
            <textarea
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="Address"
              value={addressDetails}
              onChange={(e) => {
                setIsChanged(true);
                setAddressDetails(e.target.value);
              }}
            ></textarea>
            {message.addressDetails && (
              <p className="text-red-500 text-xs">{message.addressDetails}</p>
            )}
          </div>
          <div className="w-full sm:w-[48%] flex flex-col space-y-2">
            <label className="block mb-1 text-sm text-gray-500">Pincode</label>
            <input
              className="w-full py-2 px-3 border border-gray-300 rounded text-black"
              placeholder="Pin Code"
              type="text"
              value={pincode}
              onChange={(e) => {
                setIsChanged(true);
                setPincode(e.target.value);
              }}
            />
            {message.pincode && (
              <p className="text-red-500 text-xs">{message.pincode}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="block mb-1 text-sm text-gray-500">
            Address Type
          </label>
          <select
            name="type"
            id="type"
            className="w-full py-2 px-3 border border-gray-300 rounded text-black focus:outline-none"
            value={type}
            onChange={(e) => {
              setIsChanged(true);
              setType(e.target.value);
            }}
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
          </select>
          {message.type && (
            <p className="text-red-500 text-xs">{message.type}</p>
          )}
        </div>

        <button
          type="submit"
          className="block bg-blue-600 text-white py-2 px-4 rounded mx-auto hover:bg-blue-500 transition duration-200"
          onClick={handleEditAddress}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default EditAddress;
