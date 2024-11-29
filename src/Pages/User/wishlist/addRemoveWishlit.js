// src/utils/wishlistUtils.js

import axios from "@/axiosIntercepters/AxiosInstance";
import { Toast } from "@/Components/Toast";
import { showToast } from "@/Components/ToastNotification";
import { logoutUser, removefromWishlist } from "@/redux/userSlice";

export const addToWishList = async (product, user, dispatch) => {
  try {
    const response = await axios.post("/wishList", {
      user: user._id,
      product,
    });
    showToast("success", response.data.message)
  } catch (error) {
    console.log(error);
    if (error?.response?.data?.isBlocked) {
      dispatch(logoutUser());
    }
    // Toast.fire({
    //   icon: "error",
    //   title: `${error?.response?.data?.message}`,
    // });
  }
};
export const removeFromWishlist = async (product, user, dispatch) => {
  try {
    const response = await axios.delete(
      `/wishList?user=${user._id}&product=${product}`
    );
    if (response.status == 200) {
      showToast("success", response.data.message)

      dispatch(removefromWishlist(product));
      // window.location.reload();
    }
  } catch (error) {
    console.log(error);
    if (error?.response.data.isBlocked) {
      dispatch(logoutUser());
    }
    Toast.fire({
      icon: "error",
      title: `${error?.response?.data.message}`,
    });
  }
};