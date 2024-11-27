import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  admin: JSON.parse(localStorage.getItem("adminData") || null),
};
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    addAdmin: (state, action) => {
      state.admin = action.payload;
      localStorage.setItem("adminData", JSON.stringify(action.payload));
    },
    logoutAdmin: (state, action) => {
      state.admin = null;
      localStorage.removeItem("adminData");
    },
  },
});

export default adminSlice.reducer;
export const { addAdmin, logoutAdmin } = adminSlice.actions;
