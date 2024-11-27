import React, { useState } from "react";
import "./otpInputBox.css";

const OtpInput = ({ length, handleOtpChange, disable }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    handleOtpChange(newOtp.join(""));

    if (element.nextElementSibling && element.value) {
      element.nextElementSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] !== "") {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        handleOtpChange(newOtp.join(""));
      } else if (e.target.previousElementSibling) {
        e.target.previousElementSibling.focus();
      }
    }
  };

  return (
    <div className="otp-input flex justify-center gap-2 md:gap-3">
    {otp.map((data, index) => (
      <input
        key={index}
        type="text"
        maxLength="1"
        value={data}
        onChange={(e) => handleChange(e.target, index)}
        onKeyDown={(e) => handleKeyDown(e, index)}
        onFocus={(e) => e.target.select()}
        className="otp-field bg-transparent border-2 border-gray-500 rounded text-white text-center
                   w-8 h-8 text-lg sm:w-10 sm:h-10 sm:text-xl md:w-12 md:h-12 md:text-2xl
                   focus:border-blue-500 focus:outline-none transition-all duration-200 "
        disabled={disable}
      />
    ))}
  </div>
  );
};

export default OtpInput;
