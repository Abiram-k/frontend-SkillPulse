import Wishlist from "@/Pages/User/wishlist/Wishlist";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("userData")) || null,
  details: 
  JSON.parse(localStorage.getItem("productDetails")) ||
   [],
  checkoutItems: JSON.parse(localStorage.getItem("checkoutItems")) || null,
  signUpSuccess: localStorage.getItem("signUpSuccess") || null,
  // selectedAddress also need to remove from localstorage
  cartProductsQty: JSON.parse(localStorage.getItem("cartProductsQty")) || [],
  forgotEmailVerified:
    JSON.parse(localStorage.getItem("verifiedForgotEmail")) || "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("userData", JSON.stringify(action.payload));
    },
    signUpSuccess: (state, action) => {
      state.signUpSuccess = action.payload;
      localStorage.setItem("signUpSuccess", action.payload);
    },
    otpSuccess: (state, action) => {
      state.signUpSuccess = null;
      localStorage.removeItem("signUpSuccess");
    },
    forgotEmailVerified: (state, action) => {
      state.verifiedForgotEmail = action.payload;
      localStorage.setItem(
        "verifiedForgotEmail",
        JSON.stringify(action.payload)
      );
    },
    passwordReseted: (state, action) => {
      state.verifiedForgotEmail = "";
      localStorage.removeItem("verifiedForgotEmail");
    },
    setProductDetails: (state, action) => {
      state.details = [action.payload];
      localStorage.setItem("productDetails", JSON.stringify(state.details));
    },
    setCartProductQty: (state, action) => {
      state.cartProductsQty = action.payload;
      localStorage.setItem("cartProductsQty", JSON.stringify(action.payload));
    },
    checkoutItems: (state, action) => {
      state.checkoutItems = action.payload;
      localStorage.setItem("checkoutItems", JSON.stringify(action.payload));
    },
    ordered: (state, action) => {
      state.checkoutItems = null;
      localStorage.removeItem("checkoutItems");
    },
    removefromWishlist: (state, action) => {
      if (!action.payload) state.wishlistItems = [];
      else state.wishlistItems.filter((item) => item !== action.payload);
    },
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem("userData");
      localStorage.removeItem("productDetails");
    },
  },
});

export default userSlice.reducer;
export const {
  addUser,
  setProductDetails,
  logoutUser,
  signUpSuccess,
  otpSuccess,
  checkoutItems,
  ordered,
  setCartProductQty,
  forgotEmailVerified,
  passwordReseted,
  wishlistItems,
  removefromWishlist,
} = userSlice.actions;
