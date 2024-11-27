import React from "react";
import { useState, useEffect } from "react";
function Notification({ message }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      {visible && (
        <div
          id="notification"
          className=" error notification"
          itemID="errorNotification"
        >
          {message}
        </div>
      )}
    </>
  );
}

export default Notification;
