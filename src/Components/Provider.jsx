import React, { useState } from "react";
import { createContext } from "react";
export const context = createContext();
function Provider({ children }) {
  const [data, setData] = useState({});
  
  return (
    <context.Provider value={{ data, setData }}>
        {children}
    </context.Provider>
  );
}

export default Provider;