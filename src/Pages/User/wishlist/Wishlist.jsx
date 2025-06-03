import { Toast } from "@/Components/Toast";
import { logoutUser } from "@/redux/userSlice";
import axios from "@/axiosIntercepters/AxiosInstance";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToWishList, removeFromWishlist } from "./addRemoveWishlit";
import AlertDialogueButton from "@/Components/AlertDialogueButton";
import { Link } from "react-router-dom";
import { showToast } from "@/Components/ToastNotification";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState({});
  const user = useSelector((state) => state.users.user);
  const [cartProduct, setCartProduct] = useState(
    JSON.parse(localStorage.getItem(`cart_${user._id}`)) || []
  );
  const dispatch = useDispatch();

  const [trigger, setTrigger] = useState(0);
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/wishlist`);
        const wishlistData = response.data.wishlist;
        if (wishlistData?.length)
          wishlistData.products = wishlistData[0]?.products?.reverse();
        setWishlist(wishlistData);
        // console.log("Wishlist Data: ", wishlistData);
        // setWishlist(response?.data.wishlist);
        // response?.data?.wishlist?.products?.reverse();
      } catch (error) {
        if (
          error?.response.data.isBlocked ||
          error?.response.data.message == "Token not found"
        ) {
          dispatch(logoutUser());
        }
        Toast.fire({
          icon: "error",
          title: `${error?.response?.data?.message}`,
        });
      }
    })();
  }, [trigger, wishlist]);

  const handleDeleteItem = async (product) => {
    try {
      await removeFromWishlist(product, user, dispatch);
      setTrigger((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToCart = async (id) => {
    try {
      const response = await axios.post(
        `/addToCart/${id}`,
        {},
        {
          params: {
            userId: user._id,
          },
        }
      );
      setCartProduct((prev) => {
        if (!prev.includes(id)) {
          const updatedCart = [...prev, id];
          localStorage.setItem(`cart_${user._id}`, JSON.stringify(updatedCart));
          return updatedCart;
        }
        return prev;
      });
      setTrigger((prev) => prev + 1);
      showToast("success", response.data.message);
    } catch (error) {
      if (error?.response.data.isBlocked) {
        dispatch(logoutUser());
      }
      Toast.fire({
        icon: "error",
        title: `${error?.response?.data?.message}`,
      });
      console.log(error);
    }
  };
  return (
    <main
      className="p-6 flex justify-center h-screen overflow-y-scroll font-mono mb-3"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div className="w-full max-w-3xl space-y-6">
        {wishlist.length > 0 ? (
          <>
            <div className="wishlist p-6 bg-gray-800 rounded-lg  flex items-center  space-x-4 justify-center text-xl font-semibold">
              <i className="fas fa-heart text-red-600"></i>
              <span>My Wishlist ({wishlist[0].products.length})</span>
            </div>

            {wishlist[0].products.map((product, index) => (
              <div
                key={index}
                className="wishlist-item p-4 bg-gray-800 shadow-md rounded flex flex-col lg:flex-row items-center lg:items-center space-y-4 lg:space-y-0 lg:space-x-6 lg:justify-center"
              >
                <img
                  src={
                    product.product?.productImage[0] ||
                    "https://placehold.co/100x100"
                  }
                  alt={product.product?.productName}
                  className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover"
                />
                <div className="flex-1 text-center lg:text-left">
                  <div className="text-lg lg:text-xl mb-2 font-bold">
                    {product.product?.productName}
                  </div>
                  <div className="text-sm lg:text-base">
                    {product.product?.productDescription}
                  </div>
                  <div className="flex flex-col lg:flex-row items-center lg:items-start lg:gap-3">
                    <div className="text-lg lg:text-xl font-semi-bold mt-2 text-gray-200">
                      ₹{product.product?.salesPrice}
                    </div>
                    <div className="text-base lg:text-xl mt-2 text-gray-400 line-through">
                      ₹{product.product?.regularPrice}
                    </div>
                  </div>
                  <div className="text-sm text-orange-500">
                    {product.product?.units === 0 ? "Out of Stock" : ""}
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row items-center  lg:gap-3 space-y-4 lg:space-y-0">
                  {!cartProduct.includes(product.product?._id) ? (
                    <button
                      className={`${
                        product.product?.units === 0
                          ? "bg-red-800 line-through"
                          : "bg-red-500 hover:bg-red-600"
                      } text-white px-4 py-2 rounded shadow transition duration-200`}
                      disabled={product.product?.units === 0}
                      onClick={() => handleAddToCart(product.product?._id)}
                    >
                      Add to cart
                    </button>
                  ) : (
                    <Link
                      to={"/user/cart"}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition duration-200 "
                    >
                      Go to Cart
                    </Link>
                  )}
                  <AlertDialogueButton
                    name="Delete"
                    onClick={() => handleDeleteItem(product.product?._id)}
                    className="text-white px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded shadow"
                  />
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="w-full max-w-3xl space-y-6">
            <div className="wishlist p-6 bg-gray-800 rounded-lg flex items-center space-x-4 justify-center text-xl font-semibold">
              <i className="fas fa-heart text-red-600"></i>
              <span>
                My Wishlist <span className="font-mono">(0)</span>
              </span>
            </div>
            <div className="w-full flex justify-center items-center">
              <h3 className="font-semibold">No Items were added yet</h3>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Wishlist;
