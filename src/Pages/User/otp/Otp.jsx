import React, { useEffect, useState } from "react";
import OtpInput from "./OtpInputBox";
import axios from "@/axiosIntercepters/AxiosInstance";
import "./otp.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { otpSuccess } from "../../../redux/userSlice";
import { Toast } from "@/Components/Toast";

function Otp() {
  const [input, setInput] = useState(true);
  const [timer, setTimer] = useState(
    localStorage.getItem("otpTimer")
      ? Number(localStorage.getItem("otpTimer"))
      : 60
  );
  const [otp, setOtp] = useState("");
  const [resendOtp, setResendOtp] = useState(false);
  const [message, setMessage] = useState({});
  const [spinner, setSpinner] = useState(false); // Initially enabled
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          const updatedTime = prevTimer - 1;
          localStorage.setItem("otpTimer", updatedTime);
          return updatedTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setResendOtp(true);
      setInput(false);
    }
  }, [timer]);

  const handleOtpChange = (value) => {
    setOtp(value);
  };
  useEffect(() => {
    if (otp.length == 6) handleClick();
  }, [otp]);

  const handleClick = async () => {
    try {
      const response = await axios.post("/otp", { otp });
      if (response.status === 200) {
        dispatch(otpSuccess());
        Toast.fire({
          icon: "success",
          title: `${"Signup successfull, Login now!"}`,
        });
        navigate("/login");
        localStorage.removeItem("otpTimer");
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setMessage({ serverError: error.response.data.message });
      }
    }
  };

  const handleResendOtp = async () => {
    setInput(true);
    setSpinner(true);
    setTimer(60);
    setResendOtp(false);

    try {
      const response = await axios.post("/resendOtp");
      setSpinner(false);
      setMessage({ success: response.data.message });
    } catch (error) {
      setSpinner(false);
      if (error.response?.status === 400) {
        setMessage({ serverError: error.response.data.message });
      }
    }
  };

  useEffect(() => {
    const messageTimer = setTimeout(() => {
      setMessage({});
    }, 2000);
    return () => clearTimeout(messageTimer);
  }, [message]);

  return (
    <div className="text-center flex items-center flex-col justify-center h-screen px-4 transition-transform duration-300">
      {message.serverError && (
        <div
          id="notification"
          className="error notification"
          itemID="errorNotification"
        >
          {message.serverError}
        </div>
      )}
      {message.success && (
        <div
          id="notification"
          className="notification"
          itemID="successNotification"
        >
          {message.success}
        </div>
      )}

      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <h1
        className="text-white text-6xl font-bold mb-10"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        SKILL PULSE
      </h1>
      <div
        className="bg-gray-900 text-gray-200 p-10 rounded-lg w-full sm:w-2/3 md:w-1/2 lg:w-1/3 "
        style={{
          boxShadow: "0 0 5px 5px rgba(255, 0, 0, 0.1)",
          fontFamily: "Montserrat",
        }}
      >
        <h2 className="text-2xl font-bold mb-2">OTP Verification</h2>
        <p className="mb-6">Enter the OTP to confirm [Email]</p>

        <div className="flex items-center justify-end space-x-3 mb-4 text-white lg:ms-5">
          <OtpInput
            length={6}
            handleOtpChange={handleOtpChange}
            disable={!input}
          />
          <div className="p-2 rounded-full w-14 h-11">
            <span>{timer}</span>
          </div>
        </div>

        {resendOtp && (
          <p
            className="mb-6 rounded text-gray-400 hover:scale-125 cursor-pointer transform transition-transform duration-300"
            onClick={handleResendOtp}
          >
            Resend OTP?
          </p>
        )}

        {/* <button
          className="bg-red-600 text-white py-2 px-6 mt-2 rounded-full hover:bg-red-700"
          onClick={handleClick}
          disabled={!input}
        >
          CONFIRM
        </button> */}
      </div>
    </div>
  );
}

export default Otp;
