import React, { useEffect } from "react";
import loginImage from "../../../assets/login-image.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { addUser, passwordReseted } from "../../../redux/userSlice";
import { useDispatch } from "react-redux";
import Notification from "../../../Components/Notification";
import axios from "@/axiosIntercepters/AxiosInstance";
import { Toast } from "@/Components/Toast";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({});
  const [referralCode, setReferralCode] = useState("");
  const [isReferral, setIsReferral] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let error = {};
  const formValidate = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      error.email = "email is required.";
    } else if (!emailRegex.test(email)) {
      error.email = "Email is invalid.";
    }
    if (!password.trim()) {
      error.password = "Password is required.";
    }
    if (referralCode.trim() !== "" && referralCode.length != 8) {
      error.referralCode = "referralCode is incorrect";
    }
    return error;
  };

  useEffect(() => {
    localStorage.removeItem("otpTimer");
    localStorage.removeItem("productDetails");
    dispatch(passwordReseted());
  }, []);
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({});
    const errors = formValidate();
    console.log("Error object for validation:", errors);

    if (Object.keys(errors).length > 0) {
      setMessage(errors);
      return;
    }
    try {
      console.log(email, password, referralCode);
      const response = await axios.post("/login", {
        email,
        password,
        referralCode,
      });
      if (response.status === 200) {
        dispatch(addUser(response.data.user));
        setMessage({ response: response?.data?.message });
        navigate("/user/home");
      }
    } catch (err) {
      setMessage({ response: err?.response?.data?.message });
    }
  };
  const handleGoogleAuth = () => {
    window.location.href = `http://localhost:3000/auth/google?method=login`;
  };
  const toggleReferral = () => {
    setIsReferral((prev) => !prev);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    if (error === "user_exists") {
      Toast.fire({
        icon: "error",
        title: `User already exists. Please log in instead.`,
      });
      urlParams.delete("error");
      window.history.replaceState(null, "", window.location.pathname);
    } else if (error === "server_error") {
      urlParams.delete("error");
      window.history.replaceState(null, "", window.location.pathname);
      alert("An internal server error occurred. Please try again.");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 lg:ps-10 ">
      <h1 className="text-white text-3xl lg:text-6xl mb-6 lg:mb-10">
        SKILL PULSE
      </h1>
      {message.response && <Notification message={message.response} />}
      <div
        className="bg-[#1C1C1C] rounded shadow-lg w-full max-w-md lg:max-w-none lg:w-[600px] p-6 lg:p-8 lg:flex lg:items-center lg:flex-row "
        style={{ boxShadow: "0 0 20px rgba(255, 0, 0, 0.5)" }}
      >
        <div className="flex justify-center mb-6 lg:mb-0 lg:mr-10">
          <img
            src={loginImage}
            alt="A person with headphones in a red and black theme"
            className="rounded-full w-32 h-32 lg:w-48 lg:h-32 object-cover"
          />
        </div>
        <div className="flex flex-col font-mono lg:flex-1">
          <h2 className="text-white text-2xl text-center mb-6 font-bold tracking-wide">
            LOGIN
          </h2>
          <form className="space-y-4" onSubmit={handleLogin} style={{fontFamily:"Montserrat"}}>
            <div>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 rounded w-full bg-gray-800 text-white border-b-2 border-gray-600 focus:outline-none"
              />
              {message.email && <p className="error text-red-500 text-sm mt-1">{message.email}</p>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded p-2 w-full bg-gray-800 text-white border-b-2 border-gray-600 focus:outline-none"
              />
              {message.password && (
                <p className="error text-red-500 text-sm mt-1">{message.password}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Referral Code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="rounded p-2 w-full bg-gray-800 text-white border-b-2 border-gray-600 focus:outline-none"
              />
              {message.referralCode && (
                <p className="error text-red-500 text-sm mt-1">{message.referralCode}</p>
              )}
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-red-600 text-white py-2 px-6 rounded-full hover:bg-red-700 transition duration-300"
              >
                Login
              </button>
            </div>
          </form>
          <div className="text-center mt-4"  style={{fontFamily:"Montserrat"}}>
            <Link
              to="/verifyEmail"
              className="text-gray-400 text-sm hover:underline block mb-2"
            >
              Forgot Password?
            </Link>
            <Link
              to="/signup"
              className="text-gray-400 text-sm hover:underline block "
            >
              Don't have an account?
              <span className="text-white block lg:inline lg:ms-1">
                Create an account
              </span>
            </Link>
          </div>
        </div>
      </div>
      <p className="mt-6 text-white">CONTINUE WITH</p>
      <button
        onClick={handleGoogleAuth}
        className="mt-2 flex items-center justify-center cursor-pointer bg-transparent"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="w-12 h-12 lg:w-24 lg:h-10"
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
}

export default Login;

