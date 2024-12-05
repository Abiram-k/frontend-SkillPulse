import React from "react";
import loginImage from "../../../assets/login-image.jpg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import Notification from "../../../Components/Notification";
import axios from "@/axiosIntercepters/AxiosInstance";
import { addAdmin } from "../../../redux/adminSlice";
const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
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
    } else if (password.length < 8) {
      error.password = "Password is incorrect";
    }
    return error;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({});
    const errors = formValidate();
    if (Object.keys(errors).length > 0) {
      setMessage(errors);
      return;
    }
    try {
      const response = await axios.post("/admin/adminLogin", {
        email,
        password,
      });
      if (response.status === 200) {
        dispatch(addAdmin(response.data.adminData));
        setMessage({ response: response?.data?.message });
        navigate("dashboard");
      }
    } catch (err) {
      setMessage({ response: err?.response?.data?.message });
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-0">
      <h1 className="text-red-50 text-[24px] sm:text-6xl mb-5 sm:mb-10 ">
        SKILL PULSE
      </h1>
      {message.response && <Notification message={message.response} />}
      <div
        className="bg-[#1C1C1C] rounded shadow-lg flex flex-col sm:flex-row items-center p-6 sm:p-8"
        style={{
          width: "100%",
          maxWidth: "600px",
          boxShadow: "0 0 20px rgba(255, 0, 0, 0.5)",
        }}
      >
        <div className="flex justify-center sm:mr-10 mb-4 sm:mb-0">
          <img
            src={loginImage}
            alt="A person with headphones in a red and black theme"
            className="rounded-full w-32 h-32 sm:w-56 sm:h-32"
          />
        </div>
        <div className="flex flex-col font-mono w-full">
          <h2 className="text-white text-2xl text-center mb-6 sm:mb-8 font-bold tracking-wide">
            ADMIN LOGIN
          </h2>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="flex flex-col">
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 w-full bg-gray-800 text-white border-b-2 border-gray-600 focus:outline-none rounded"
              />
            </div>
              {message.email && (
                <p className="error text-red-500">{message.email}</p>
              )}
            <div className="flex ">
              <input
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 w-full bg-gray-800 text-white border-b-2 border-gray-600 focus:outline-none "
              />
               <button
                type="button"
                onClick={togglePasswordVisibility}
                className="  p-1 bg-gray-800 border-b-2 border-gray-600"
              >
                {isPasswordVisible ? (
                  <i class="fa-solid fa-eye"></i>
                ) : (
                  <i class="fa-solid fa-eye-slash"></i>
                )}
              </button>
            </div>
              {message.password && (
                <p className="error text-red-500">{message.password}</p>
              )}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-red-600 text-white py-2 px-6 rounded-full hover:bg-red-700"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
