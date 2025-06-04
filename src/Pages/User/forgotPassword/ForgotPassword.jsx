import { Toast } from "@/Components/Toast";
import { passwordReseted } from "@/redux/userSlice";
import axios from "@/axiosIntercepters/AxiosInstance";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const email = useSelector((state) => state.users.forgotEmailVerified);
  const email = localStorage.getItem("verifiedForgotEmail");

  const validateForm = () => {
    let error = {};
    if (newPassword.trim() == "") error.newPassword = "Field Cant be empty *";
    else if (newPassword.length < 8)
      error.newPassword = "Password must be 8 charscters *";
    else if (!/[A-Z]/.test(newPassword))
      error.newPassword =
        "Password must include at least one uppercase letter.";
    else if (!/[a-z]/.test(newPassword))
      error.newPassword =
        "Password must include at least one lowercase letter.";
    else if (!/[0-9]/.test(newPassword))
      error.newPassword = "Password must include at least one number.";
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword))
      error.newPassword =
        "Password must include at least one special character.";

    if (confirmPassword.trim() == "")
      error.confirmPassword = "Field Cant be empty *";
    if (confirmPassword != newPassword)
      error.newPassword = "Password is not matching *";
    return error;
    
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const formError = validateForm();
      if (Object.keys(formError).length > 0) {
        setMessage(formError);
        return;
      }
      if (Object.keys(formError).length == 0) {
        const response = await axios.patch(`/forgotPassword`, {
          email,
          newPassword,
        });
        Toast.fire({
          icon: "success",
          title: `${response.data.message}`,
        });
        navigate("/login");
        dispatch(passwordReseted());
      }
    } catch (error) {
      console.log(error);
      Toast.fire({
        icon: "error",
        title: `${error?.response.data.message}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      <h1 className="text-white text-4xl font-bold tracking-wider mt-20 mb-16">
        SKILL PULSE
      </h1>

      <div className="w-full max-w-md bg-neutral-900 p-8 rounded-2xl shadow-lg relative">
        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-2xl -z-10"></div>

        <form onSubmit={handleSubmit} className="space-y-6 font-mono">
          <div>
            <input
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-transparent border-b border-gray-600 px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>
          {message.newPassword && (
            <p className="text-red-600">{message.newPassword}</p>
          )}

          <div>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full bg-transparent border-b border-gray-600 px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>
          {message.confirmPassword && (
            <p className="text-red-600">{message.confirmPassword}</p>
          )}

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
