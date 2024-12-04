import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  admin: JSON.parse(localStorage.getItem("adminData") || null),
  adminorderDetails: "",
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
    adminorderDetails: (state, action) => {
      state.adminorderDetails = action.payload;
    },
  },
});

export default adminSlice.reducer;
export const { addAdmin, logoutAdmin,adminorderDetails } = adminSlice.actions;
