import React, { useEffect, useRef, useState } from "react";
import {
  User,
  Package,
  MapPin,
  Wallet,
  LogOut,
  UserPen,
  DoorOpen,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../redux/userSlice";
import { Toast } from "../../../Components/Toast";
import { ChangePassword } from "@/Components/ChangePassword";
import axios from "@/axiosIntercepters/AxiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "@/Components/ToastNotification";

const AccountOverview = () => {
  const user = useSelector((state) => state.users.user);
  const [profileImage, setProfileImage] = useState(null);
  const [dbImage, setDbImage] = useState(null);
  const [userProfile, setUserProfile] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [mobileNumber, setMobileNumber] = useState("");
  const [spinner, setSpinner] = useState(false);
  const [message, setMessage] = useState({});
  const [editMode, setEditMode] = useState(false);
  const dateRef = useRef(null);
  const editButtonRef = useRef(null);

  const [referral, setRefferal] = useState();
  const dispatch = useDispatch();
  const nameRegex = /^[A-Za-z\s]+$/;

  const formValidate = () => {
    let error = {};
    const firstnameFirstCharecter = firstName.charAt(0);
    const lastnameFirstCharecter = secondName.charAt(0);

    if (firstName?.trim() == "") error.firstName = "first name is required *";
    else if (!isNaN(firstnameFirstCharecter)) {
      error.firstName = "Name must start with a charecter *";
    } else if (!nameRegex.test(firstName)) {
      error.firstName =
        "First name must not include numbers or special characters.";
    }

    if (!isNaN(lastnameFirstCharecter) && lastnameFirstCharecter?.trim()) {
      error.lastName = "Last name must start with a charecter *";
    } else if (!nameRegex.test(secondName)) {
      error.lastName =
        "Last name must not include numbers or special characters.";
    }

    // if (mobileNumber?.trim() && mobileNumber?.length !== 10) {
    //   error.mobileNumber = "Please enter a 10-digit mobile number *";
    // }

    if (mobileNumber?.trim()) {
      const isOnlyDigits = /^\d{10}$/.test(mobileNumber);

      if (!isOnlyDigits) {
        error.mobileNumber =
          "Please enter a valid 10-digit mobile number (digits only) *";
      }
    }

    return error;
  };

  const handleEditToastAlert = () => {
    Toast.fire({
      icon: "info",
      position: "top-start",
      title: "Click edit button, for edit mode!",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleImageChanges = (e) => {
    handleImageChange(e);
  };

  const handleImageChange = (e) => {
    const imageFile = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (
      imageFile &&
      allowedTypes.includes(imageFile.type) &&
      imageFile.size <= maxSize
    ) {
      setMessage({});
      setDbImage(imageFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(imageFile);
    } else {
      setMessage({
        image: "Please upload a JPEG, JPG, or PNG file under 1MB.",
      });
    }
  };
  const handleCopyReferralCode = (e) => {
    e.preventDefault();
    navigator.clipboard
      .writeText(referral)
      .then(() => {
        toast.success("Text copied to clipboard!", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          style: { backgroundColor: "#008000", color: "#ffffff" },
        });
      })
      .catch((error) => {
        Toast.fire({
          icon: "error",
          title: "Error occured while copying",
        });
      });
  };

  useEffect(() => {
    (async () => {
      try {
        setSpinner(true);
        const response = await axios.get(`/user`);
        setFirstName(response.data?.userData.firstName);
        setSecondName(response.data?.userData.lastName);
        setDateOfBirth(response.data?.userData.dateOfBirth);
        setEmail(response.data?.userData?.email);
        setMobileNumber(response.data?.userData.mobileNumber);
        setUserProfile(response.data?.userData);
        setProfileImage(response.data?.userData.profileImage);
        setRefferal(response.data?.userData.referralCode);
        setSpinner(false);
      } catch (error) {
        setSpinner(false);
        if (
          error?.response.data.isBlocked ||
          error?.response.data.message == "token not found"
        ) {
          dispatch(logoutUser());
        }
        console.log(error?.response?.data?.message);
      }
    })();
  }, []);

  const handleProfileChange = async (e) => {
    e.preventDefault();

    const formError = formValidate();
    if (Object.keys(formError).length > 0) {
      setMessage(formError);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", secondName);
      formData.append("email", email);
      formData.append("file", dbImage);
      formData.append("mobileNumber", mobileNumber);
      formData.append("dateOfBirth", dateOfBirth);
      setSpinner(true);
      const response = await axios.post("/user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        params: {
          id: user._id,
        },
      });
      setSpinner(false);
      setEditMode(false);
      setMessage({});
      setProfileImage(response.data?.updatedUser);
      window.location.reload();
      showToast("success", response?.data?.message);
    } catch (error) {
      setSpinner(false);

      Toast.fire({
        icon: "error",
        title: `${error?.response.data?.message || "Error occured"}`,
      });
    }
  };

  const handleEditMode = () => {
    setEditMode((editMode) => !editMode);
  };

  return (
    <div
      className="flex-1 bg-black rounded-lg p-4 sm:p-6 font-mono"
      style={{ fontFamily: "Montserrat" }}
    >
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-8">
        <div className="flex items-center gap-3 mb-6">
          <label
            htmlFor="fileInput"
            className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden cursor-pointer bg-yellow-400"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-gray-800" />
            )}
          </label>
          <input
            onClick={(e) => {
              if (!editMode) {
                e.preventDefault();
                e.stopPropagation();
                handleEditToastAlert();
              }
            }}
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageChanges}
            style={{ display: "none" }}
          />
          <span className="font-semibold">{user.firstName || "User name"}</span>
        </div>
        <div className="flex gap-3">
          {!user.googleid && (
            <ChangePassword
              name="Change Password"
              className="mt-5"
              id={user._id}
            />
          )}
          <button
            className="bg-green-500 rounded p-2 hover:scale-110 transition-all duration-100 flex gap-2 justify-center items-center"
            onClick={handleEditMode}
            ref={editButtonRef}
          >
            {editMode ? (
              <>
                <DoorOpen />
                Exit
              </>
            ) : (
              <>
                <UserPen />
                Edit
              </>
            )}
          </button>
        </div>
      </div>

      {message.image && <p className="text-red-600 mb-4">{message.image}</p>}

      <h2 className="text-xl font-semibold mb-6">
        {editMode ? (
          <>
            <span className="text-green-400">Edit</span> Personal Information
          </>
        ) : (
          "Personal Information"
        )}
      </h2>

      <form className="space-y-6 font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">First Name</label>
            <input
              type="text"
              className="w-full bg-gray-700 rounded-lg p-2"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onClick={() => !editMode && handleEditToastAlert()}
            />
            {message.firstName && (
              <p className="text-red-600">{message.firstName}</p>
            )}
          </div>
          <div>
            <label className="block mb-2">Last Name</label>
            <input
              type="text"
              className="w-full bg-gray-700 rounded-lg p-2"
              value={secondName}
              onChange={(e) => setSecondName(e.target.value)}
              onClick={() => !editMode && handleEditToastAlert()}
            />
            {message.lastName && (
              <p className="text-red-600">{message.lastName}</p>
            )}
          </div>
          {!user.googleid && (
            <div>
              <label className="block mb-2">Password</label>
              <input
                type="password"
                className="w-full bg-gray-700 rounded-lg p-2"
                defaultValue={"* * * * * * * *"}
                disabled
              />
            </div>
          )}
          <div>
            <label className="block mb-2">Referral Code</label>
            <div className="flex items-center">
              <input
                type="text"
                value={referral}
                className="w-full bg-gray-700 rounded-lg p-2 text-white"
                disabled
              />
              <button
                onClick={handleCopyReferralCode}
                className="bg-gray-700 text-white rounded p-2 ml-2"
              >
                Copy
              </button>
              <ToastContainer />
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2">Date of Birth</label>
          <input
            ref={dateRef}
            type="date"
            className="w-full bg-gray-700 rounded-lg p-2  "
            value={dateOfBirth?.split("T")[0]}
            onClick={() => {
              if (editMode && dateRef.current?.showPicker) {
                dateRef.current.showPicker();
              } else {
                handleEditToastAlert();
              }
            }}
            max={
              new Date(new Date().setFullYear(new Date().getFullYear() - 10))
                .toISOString()
                .split("T")[0]
            }
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>

        <h3 className="text-lg font-semibold pt-4">Contact Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Mobile Number</label>
            <input
              type="tel"
              className="w-full bg-gray-700 rounded-lg p-2"
              value={mobileNumber ? mobileNumber : ""}
              onChange={(e) => setMobileNumber(e.target.value)}
              onClick={() => !editMode && handleEditToastAlert()}
            />
            {message.mobileNumber && (
              <p className="text-red-600">{message.mobileNumber}</p>
            )}
          </div>
          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              className="w-full bg-gray-700 rounded-lg p-2"
              defaultValue={email}
              disabled
            />
          </div>
        </div>

        {editMode && (
          <button
            className="bg-green-600 text-white px-6 py-2 rounded-lg w-full sm:w-auto"
            onClick={handleProfileChange}
          >
            {spinner ? "Profile updating ..." : "Submit"}
          </button>
        )}
      </form>
    </div>
  );
};

export default AccountOverview;
