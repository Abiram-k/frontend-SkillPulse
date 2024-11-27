import { Toast } from "@/Components/Toast";
import { forgotEmailVerified } from "@/redux/userSlice";
import axios from "@/axiosIntercepters/AxiosInstance";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const EmailVerification = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [verifyEnable, setVerifyEnable] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setVerifyEnable(false);
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (email.trim() === "") {
      setMessage("Email is required *");
      return;
    }
    if (!emailRegex.test(email)) {
      setMessage("Email is not valid *");
      return;
    }

    setMessage("");

    setSpinner(true);
    try {
      const response = await axios.post("/verifyEmail", {
        email,
      });
      setSpinner(false);
      Toast.fire({
        icon: "success",
        title: `${response?.data.message}`,
      });
      setVerifyEnable(true);
      //   setEmail("");
    } catch (error) {
      console.error(error);
      setSpinner(false);
      Toast.fire({
        icon: "error",
        title: `${error?.response?.data.message || "An error occurred."}`,
      });
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post("/verifyResetOtp", {
        email,
        otp,
      });
      dispatch(forgotEmailVerified(email));
      Toast.fire({
        icon: "success",
        title: `${response.data.message}`,
      });
      navigate("/forgotPassword");
    } catch (error) {
      console.error(error);
      Toast.fire({
        icon: "error",
        title: `${error?.response?.data.message || "An error occurred."}`,
      });
    }
  };
  window.addEventListener("beforeunload", (event) => {
    if (email) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      <h1 className="text-white text-4xl font-bold tracking-wider mt-20 mb-16">
        SKILL PULSE
      </h1>

      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="w-full max-w-md bg-neutral-900 p-8 rounded-2xl shadow-lg relative">
        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-2xl -z-10"></div>

        <form onSubmit={handleSubmit} className="space-y-6 font-mono">
          <div>
            <input
              type="text"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full bg-transparent border-b border-gray-600 px-3 py-2 text-white focus:outline-none focus:border-red-500"
              disabled={verifyEnable}
            />
          </div>
          {message && <p className="text-red-600">{message}</p>}
          {verifyEnable && (
            <div className="flex gap-4">
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="flex-1 bg-transparent border-b border-gray-600 px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="p-1 text-sm bg-gray-300 text-black border border-gray-600 rounded-md hover:bg-gray-400"
              >
                Verify
              </button>
            </div>
          )}
          {!verifyEnable && (
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition-colors"
            >
              Confirm
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;
