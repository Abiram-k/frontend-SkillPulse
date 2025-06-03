import React, { useEffect, useState, useContext } from "react";
import banner from "../../../assets/homePageBanner.jpg";
import productBanner from "../../../assets/homeProductBanner.webp";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "../../../Components/Toast";
import axios from "@/axiosIntercepters/AxiosInstance";
import { useDispatch, useSelector } from "react-redux";
import {
  logoutUser,
  removefromWishlist,
  setProductDetails,
  wishlistItems,
} from "../../../redux/userSlice";
import { Heart } from "lucide-react";
import { addToWishList } from "../wishlist/addRemoveWishlit";
import { removeFromWishlist } from "../wishlist/addRemoveWishlit";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/Components/ui/carousel.jsx";
import { showToast } from "@/Components/ToastNotification";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [banners, setBanners] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.users.user);
  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`/wishlist`);

      const uniqueWishlistItems = [
        ...new Set(
          response.data.wishlist[0].products?.map(
            (product) => product.product._id
          )
        ),
      ];
      uniqueWishlistItems.forEach((id) => {
        setWishlistItems((prev) => [...prev, id]);
      });
    } catch (error) {
      console.error(
        "Error fetching wishlist:",
        error.response || error.message
      );
      if (
        error?.response.data.isBlocked ||
        error?.response.data.message == "token not found"
      ) {
        dispatch(logoutUser());
      }
      Toast.fire({
        icon: "error",
        title: `${error?.response?.data.message}`,
      });
    }
  };

  const goToDetails = (product) => {
    dispatch(setProductDetails(product));
    navigate("/user/productDetails");
  };

  const handleAddToWishList = async (product) => {
    try {
      setSpinner(true);
      await addToWishList(product, user, dispatch);
      setSpinner(false);
      setTrigger((prev) => prev + 1);
    } catch (error) {
      setSpinner(false);
      console.log(error);
    }
  };

  const handleRemoveFromWishlist = async (product) => {
    try {
      await removeFromWishlist(product, user, dispatch);
      setTrigger((prev) => prev + 1);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get("/products", {
          params: { newArrivals: true },
        });
        setProducts(response.data.products);
        setCategory(response.data.categoryDoc);
      } catch (error) {
        showToast("error", error?.response?.data.message);
        console.log(error.message);
      }
      try {
        const response = await axios.get("admin/banner");
        setBanners(response.data.banner);
      } catch (error) {
        alert(error.message);
        console.log(error.message);
      }
    })();
    fetchWishlist();
  }, [trigger]);
  return (
    <div>
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <section className="relative overflow-hidden h-80 lg:h-auto">
        <img
          src={banner}
          alt="Gaming setup with colorful lights"
          className="w-full h-auto"
        />
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center md:text-right max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-4 md:top-1/3 md:translate-x-0 md:right-10">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white break-words">
            EXHALE WORRIES WITH GAMING
          </h1>
          <p className="text-base sm:text-lg md:text-xl mt-2 text-gray-200 hidden lg:block">
            Deserve best, interpret your music differently
          </p>
          <Link
            to="/user/shop"
            className="mt-4 px-4 py-2 md:px-6 md:py-2 bg-red-600 text-white font-bold rounded inline-block text-center hover:bg-red-700"
          >
            ORDER NOW
          </Link>
        </div>
      </section>

      <h5 className="text-md lg:text-xl  ps-8 font-bold text-center mt-5">
        Categories
      </h5>
      <section className="flex flex-wrap justify-center gap-6 py-8 px-4 bg-black border-b border-gray-500">
        {category?.length > 0 ? (
          category.slice(0, 4)?.map(
            (cat) =>
              cat.isListed && (
                <div
                  className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 text-center mb-8 p-4 bg-gray-900  shadow-lg hover:shadow-xl transition-shadow  rounded duration-300"
                  key={cat._id}
                  onClick={() => {
                    navigate(`/user/shop?categoryId=${cat._id}`);
                  }}
                >
                  <img
                    src={cat.image || "https://placehold.co/150x150"}
                    className="mx-auto rounded-full w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover mb-4 hover:scale-105 transition-transform duration-300"
                    alt={cat.name}
                  />
                  <p className="text-white text-sm md:text-base font-semibold">
                    {cat.name}
                  </p>
                </div>
              )
          )
        ) : (
          <>
            {["RazorClaw X", "HyperVox Graphics card", "Vortex Controller"].map(
              (placeholder, index) => (
                <div
                  className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 text-center mb-8 p-4 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  key={index}
                >
                  <img
                    src="https://placehold.co/150x150"
                    alt={placeholder}
                    className="mx-auto rounded-full w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover mb-4 hover:scale-105 transition-transform duration-300"
                  />
                  <p className="text-white text-sm md:text-base font-semibold">
                    {placeholder}
                  </p>
                </div>
              )
            )}
          </>
        )}
      </section>

      <section className="w-screen flex justify-center p-4 h-auto">
        <Carousel className="relative w-full text-black">
          <CarouselContent className="relative w-full">
            {banners?.map((banner, index) => (
              <CarouselItem
                key={banner._id || index}
                className="relative flex items-center justify-center"
              >
                <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg sm:text-2xl font-semi-bold font-mono text-white text-center z-20">
                  {/* {banner.description} */}
                </p>
                <img
                  src={banner.image || "https://placehold.co/300x300"}
                  alt={`Banner ${banner._id || index}`}
                  className="object-cover w-full h-[200px] sm:h-[300px] lg:h-[400px]"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute top-1/2 left-4 -translate-y-1/2 bg-gray-600 text-green-400 z-10 p-2 rounded-full" />
          <CarouselNext className="absolute top-1/2 right-4 -translate-y-1/2 bg-gray-600 text-white z-10 p-2 rounded-full" />
        </Carousel>
      </section>

      <h2 className="text-md lg:text-xl  ps-8 font-bold ">New Arrivals</h2>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-8 bg-black ">
        {products?.length > 0 ? (
          products?.map(
            (product) =>
              product.isListed &&
              !product.isDeleted && (
                <div
                  className="relative bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300 flex flex-col items-center"
                  key={product._id}
                >
                  <img
                    src={
                      product.productImage[0] || "https://placehold.co/300x200"
                    }
                    alt={product.productDescription}
                    className="w-full h-40 object-cover rounded-md cursor-pointer"
                    onClick={() => goToDetails(product)}
                  />

                  {wishlistItems.includes(product._id) ? (
                    <Heart
                      className="absolute top-3 right-3 w-6 h-6 fill-red-600 text-red-600 cursor-pointer"
                      onClick={() => handleRemoveFromWishlist(product._id)}
                    />
                  ) : (
                    <Heart
                      className="absolute top-3 right-3 w-6 h-6 text-gray-300 transition-colors cursor-pointer hover:text-red-500"
                      onClick={() => handleAddToWishList(product._id)}
                    />
                  )}

                  <div className="w-full mt-3 text-center space-y-2">
                    <p className="text-sm text-gray-300 font-medium truncate">
                      {product.productName}
                    </p>

                    <p className="text-lg font-bold text-green-400">
                      {product.salesPrice < product.regularPrice && (
                        <span>₹ {product.salesPrice.toFixed(0)}</span>
                      )}
                      <span
                        className={`${
                          product.salesPrice < product.regularPrice
                            ? "line-through text-gray-500 ml-2"
                            : "text-green-400"
                        }`}
                      >
                        ₹ {product.regularPrice}
                      </span>
                      {(product.categoryOffer || product.offer > 0) && (
                        <span className="text-red-500 ml-2 text-xs">
                          {product.categoryOffer >= product.offer
                            ? product.categoryOffer
                            : product.offer}{" "}
                          % off
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-gray-400">
                      {product.salesPrice > 1000
                        ? "Free Delivery"
                        : "Delivery Charges Apply"}
                    </p>
                  </div>
                </div>
              )
          )
        ) : (
          <div className=" rounded w-screen text-center">
            <h2 className="text-center">No Products were added yet</h2>
          </div>
        )}
      </section>
    </div>
  );
};
export default HomePage;
