import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser } from "../../../redux/userSlice";
import axios from "@/axiosIntercepters/AxiosInstance";
function GoogleAuthComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/googleUser");
        dispatch(
          addUser({
            isLoggedIn: true,
            ...response.data,
          })
        );

        navigate("/user/home");
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);
}

export default GoogleAuthComponent;
