import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const InternetCheck = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleConnectivityChange = () => {

      if (!navigator.onLine) {
        navigate("/offline");
      } else {
        navigate("/");
      }
    };

    if (!navigator.onLine) {
      navigate("/offline");
    }

    window.addEventListener("offline", handleConnectivityChange);
    window.addEventListener("online", handleConnectivityChange);

    return () => {
      window.removeEventListener("offline", handleConnectivityChange);
    };
    
  }, [navigate]);

  return <>{children}</>;
};

export default InternetCheck;
