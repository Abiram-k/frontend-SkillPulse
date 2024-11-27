import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import adminSlice from "./adminSlice";

const store = configureStore({
  reducer: {
    users: userSlice,
    admins: adminSlice,
  },
});
export default store;
