import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const InternetCheck = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleConnectivityChange = () => {
      if (!navigator.onLine) {
        navigate("/offline"); 
      }
    };
    if (!navigator.onLine) {
      navigate("/offline");
    }
    window.addEventListener("offline", handleConnectivityChange);
    return () => {
      window.removeEventListener("offline", handleConnectivityChange);
    };
  }, [navigate]);

  return <>{children}</>;
};

export default InternetCheck;
