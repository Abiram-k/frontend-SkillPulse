import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "@/axiosIntercepters/AxiosInstance";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";
import { useDispatch } from "react-redux";
import { signUpSuccess } from "../../../redux/userSlice";
const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({});
  const [spinner, setSpinner] = useState(false);
  const [serverMessage, setServerMessage] = useState();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  //Form Validation
  let error = {};
  const formValidate = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const firstnameFirstCharecter = firstName.charAt(0);
    const lastnameFirstCharecter = lastName.charAt(0);
    if (!firstName && !lastName && !mobileNumber && !email) {
      error.all = "Please fill all the fields";
    }
    // if (!firstName.trim()) {
    //   error.firstName = "Name is required.";
    // } else if (!isNaN(firstnameFirstCharecter)) {
    //   error.firstName = "Name must start with a charecter";
    // }
    // if (!isNaN(lastnameFirstCharecter) && lastName && firstName) {
    //   error.secondName = "Last name must start with a charecter";
    // }
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!firstName.trim()) {
      error.firstName = "First name is required.";
    } else if (!nameRegex.test(firstName)) {
      error.firstName =
        "First name must not include numbers or special characters.";
    }

    if (!lastName.trim()) {
      error.secondName = "Last name is required.";
    } else if (!nameRegex.test(lastName)) {
      error.secondName =
        "Last name must not include numbers or special characters.";
    }
    if (!email.trim()) {
      error.email = "email is required.";
    } else if (!emailRegex.test(email)) {
      error.email = "Email is invalid.";
    }
    // if (!password.trim()) {
    //   error.password = "Password is required.";
    // } else if (password.length < 8) {
    //   error.password = "Password must be 8 characters";
    // } else if (password != confirmPassword) {
    //   error.password = "Password not match";
    // }

    if (!password.trim()) {
      error.password = "Password is required.";
    } else if (password.length < 8) {
      error.password = "Password must be at least 8 characters long.";
    } else if (!/[A-Z]/.test(password)) {
      error.password = "Password must include at least one uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      error.password = "Password must include at least one lowercase letter.";
    } else if (!/[0-9]/.test(password)) {
      error.password = "Password must include at least one number.";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      error.password = "Password must include at least one special character.";
    } else if (password !== confirmPassword) {
      error.password = "Passwords do not match.";
    }
    if (!mobileNumber.trim()) {
      error.mobile = "Mobile number is required.";
    } else if (mobileNumber?.trim()) {
      const isOnlyDigits = /^\d{10}$/.test(mobileNumber);
      if (!isOnlyDigits) {
        error.mobile =
          "Please enter a valid 10-digit mobile number (digits only) *";
      }
    }

    return error;
  };

  // const notification = document.getElementById("errorNotification");
  useEffect(() => {
    localStorage.removeItem("otpTimer");
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage({ serverMessage: "" });
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formErrors = formValidate();
      if (Object.keys(formErrors).length > 0) {
        setMessage(formErrors);
        return;
      }
      console.log(message);
      if (Object.keys(formErrors.length != 0)) {
        setSpinner(true);
        const response = await axios.post(
          "/signUp",
          {
            firstName,
            lastName,
            email,
            mobileNumber,
            password,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        setSpinner(false);
        if (response.status === 200) {
          dispatch(signUpSuccess(response.data.message));
          navigate("/otp");
          setMessage({ success: response.data.message });
        }
      }
    } catch (error) {
      setSpinner(false);
      setMessage({ serverError: error?.response?.data.message });
      console.log(error);
    }
  };
  const handleGoogleAuth = () => {
    window.location.href = `https://skillpulseapi.abiram.website/auth/google?method=signup`;
  };
  return (
    <div className="text-white text-center my-6 lg:my-10 px-4 lg:px-0">
      {message.serverError && (
        <div
          id="notification"
          className="error notification"
          itemID="errorNotification"
        >
          {message.serverError}
        </div>
      )}

      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <h1 className="text-4xl lg:text-5xl font-bold mb-6 lg:mb-10">
        SKILL PULSE
      </h1>
      <div
        className="bg-gray-900 p-6 lg:p-8 rounded-lg shadow-lg w-full max-w-sm lg:w-96 mx-auto font-mono"
        style={{ boxShadow: "0 0 20px rgba(255, 0, 0, 0.5)" }}
      >
        <h2 className="text-xl lg:text-2xl font-bold mb-6">SIGN UP</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-transparent border-b border-gray-600 focus:outline-none w-full py-2"
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-transparent border-b border-gray-600 focus:outline-none w-full py-2"
            />
          </div>
          {message.firstName && !message.all && (
            <p className="error text-sm">{message.firstName}</p>
          )}
          {message.secondName && !message.all && (
            <p className="error text-sm">{message.secondName}</p>
          )}
          <input
            type="text"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border-b border-gray-600 focus:outline-none w-full py-2"
          />
          {message.email && !message.all && (
            <p className="error text-sm">{message.email}</p>
          )}

          <input
            type="text"
            placeholder="Enter mobile number"
            value={mobileNumber}
            onChange={(e) => setMobile(e.target.value)}
            className="bg-transparent border-b border-gray-600 focus:outline-none w-full py-2"
          />
          {message.mobile && !message.all && (
            <p className="error text-sm">{message.mobile}</p>
          )}

          <div className="flex gap-1">
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-b border-gray-600 focus:outline-none w-full py-2"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="  p-1  border-gray-600"
            >
              {isPasswordVisible ? (
                <i class="fa-solid fa-eye"></i>
              ) : (
                <i class="fa-solid fa-eye-slash"></i>
              )}
            </button>
          </div>
          <input
            type={isPasswordVisible ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-transparent border-b border-gray-600 focus:outline-none w-full py-2"
          />
          {message.password && !message.all && (
            <p className="error text-sm">{message.password}</p>
          )}
          {message.all && <p className="error text-sm">{message.all}</p>}
          <button
            type="submit"
            className="bg-red-600 text-white py-2 px-4 rounded-full mt-4 w-full lg:w-auto"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-sm lg:text-base">
          Existing User?{" "}
          <Link to="/login" className="text-blue-500">
            Login in
          </Link>
        </p>
      </div>

      <p className="mt-6 text-sm lg:text-base">CONTINUE WITH</p>
      <button
        onClick={handleGoogleAuth}
        className="mt-2 flex items-center justify-center cursor-pointer mx-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="w-16 h-8 lg:w-24 lg:h-10"
        >
          <path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          />
          <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          />
          <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
          />
        </svg>
      </button>
    </div>
  );
};

export default Signup;
