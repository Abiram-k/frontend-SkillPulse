import React, { useState, useEffect, useCallback } from "react";
import { Star, Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
// import axios from "axios";
import axios from "@/axiosIntercepters/AxiosInstance";
import { logoutUser, setProductDetails } from "../../../redux/userSlice";
import { Toast } from "@/Components/Toast";
import {
  Link,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import { showToast } from "@/Components/ToastNotification";
import { addToWishList } from "../wishlist/addRemoveWishlit";
import axiosInstance from "@/axiosIntercepters/AxiosInstance";

const ProductDetails = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [error, setError] = useState(null);
  const [magnifierVisible, setMagnifierVisible] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [isAvailable, setIsAvailable] = useState(false);
  const dispatch = useDispatch();
  let productData = useSelector((state) => state.users.details);
  const [product, setProduct] = useState(productData);
  const user = useSelector((state) => state.users.user);
  const navigate = useNavigate();
  const [isAlreadyWishlisted, setIsAlreadyWishlisted] = useState();
  const [goToCart, setGoToCart] = useState(false);
  const [cartProduct, setCartProduct] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    const isProductInCart = cartProduct.includes(product[0]?._id);
    setGoToCart(isProductInCart);
  }, [cartProduct, product]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `/brand-category-info/${product[0]?._id}`
        );
        if (response.data.isAvailable)
          if (product[0].units === 0) {
            setIsAvailable(false);
          } else {
            setIsAvailable(response.data.isAvailable);
          }
      } catch (error) {
        if (
          error?.response.data.isBlocked ||
          error?.response.data.message == "token not found"
        ) {
          dispatch(logoutUser());
        }
        console.log(error.message);
      }
    })();
    if (id) return;
    (async () => {
      try {
        const response = await axios.get(
          `/getSimilarProduct/${product[0]?._id}`
        );
        setSimilarProducts(response.data.similarProducts);
      } catch (error) {
        setError("Failed to load similar products. Please try again later.");
        if (error.response?.status === 404)
          setError(error?.response?.data?.message);
        console.error(error);
      }
    })();
  }, [product, isAvailable]);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/product/${id}`);
        console.log("Fetched product:", response?.data?.productData);
        setProduct([response?.data?.productData]);
      } catch (error) {
        console.log("Fetch error:", error);
        navigate("/user/shop");
        Toast.fire({
          icon: "error",
          title:
            error?.response?.data?.message || "Failed to fetch product data",
        });
      }
    };

    fetchProduct();
  }, [id]);

  const reviews = [
    {
      id: 1,
      name: "Anonymous",
      rating: 5,
      comment: "Good Product",
      description: "Professional build quality, nice...",
    },
    {
      id: 2,
      name: "Rahul",
      rating: 4,
      comment: "Nice Quality, Worth for money",
      description: "Good material",
    },
    {
      id: 3,
      name: "Rizwana",
      rating: 5,
      comment: "Nice Quality, Worth for money",
      description: "Good Sound Quality...",
    },
  ];

  // Memoize mouse enter/leave and move handlers to prevent re-creation on each render
  const handleMouseEnter = useCallback(() => setMagnifierVisible(true), []);
  const handleMouseLeave = useCallback(() => setMagnifierVisible(false), []);

  const handleMouseMove = useCallback(
    (e) => {
      const { left, top } = e.target.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;

      if (
        Math.abs(x - magnifierPosition.x) > 5 ||
        Math.abs(y - magnifierPosition.y) > 5
      ) {
        setMagnifierPosition({ x, y });
      }
    },
    [magnifierPosition.x, magnifierPosition.y]
  );

  const gotoDetails = (product) => {
    dispatch(setProductDetails(product));
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleAddToCart = async () => {
    try {
      if (!user) {
        navigate("/login");
        showToast("warning", `Login for add to cart`);
        return;
      }
      setSpinner(true);
      const response = await axios.post(
        `/addToCart/${product[0]._id}`,
        {}
        // {
        //   params: {
        //     userId: user?._id,
        //   },
        // }
      );
      setCartProduct((prev) => {
        if (!prev.includes(product[0]._id)) {
          const updatedCart = [...prev, product[0]._id];
          localStorage.setItem(
            `cart_${user?._id}`,
            JSON.stringify(updatedCart)
          );
          return updatedCart;
        }
        return prev;
      });
      showToast("success", `${response?.data.message}`);
    } catch (error) {
      if (error?.response.data.isBlocked) {
        dispatch(logoutUser());
      }
      showToast("error", `${error?.response?.data?.message}`);
      console.log(error);
    } finally {
      setSpinner(false);
    }
  };

  useEffect(() => {
    if (user?._id && cartProduct.length > 0) {
      localStorage.setItem(`cart_${user?._id}`, JSON.stringify(cartProduct));
    }
  }, [cartProduct, user?._id]);

  const handleAddToWishList = async () => {
    try {
      if (!product[0]?._id) {
        alert("Product not founded");
        return;
      }
      setSpinner(true);
      await addToWishList(product[0]?._id, user, dispatch);
      setSpinner(false);
      navigate("/user/wishlist");
    } catch (error) {
      setSpinner(false);
      console.log(error);
    }
  };

  const fetchWishlist = async () => {
    try {
      // const response = await axios.get(`/wishlist?user=${user._id}`);
      const response = await axios.get(`/wishlist`);
      const isWishlisted = response.data.wishlist[0].products.some(
        (p) => p.product?._id == product[0]?._id
      );
      setIsAlreadyWishlisted(isWishlisted);
    } catch (error) {
      console.error(
        "Error fetching wishlist:",
        error.response || error.message
      );
      if (error?.response?.data.isBlocked) {
        dispatch(logoutUser());
      }
    }
  };

  useEffect(() => {
    const savedCart =
      JSON.parse(localStorage.getItem(`cart_${user?._id}`)) || [];
    setCartProduct(savedCart);
    if (user) fetchWishlist();
  }, [user?._id]);

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <main className="container mx-auto px-4 py-8">
        {product.length === 0 ? (
          <div>Loading...</div>
        ) : (
          product?.map((product, index) => (
            <div
              key={index}
              className="relative grid grid-cols-1 md:grid-cols-2 gap-8 p-4"
            >
              <div className="space-y-4">
                <div className="flex flex-col space-y-4">
                  <div
                    className="relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                  >
                    <img
                      src={
                        product?.productImage?.[selectedImage] ||
                        product?.productImage?.[0] ||
                        ""
                      }
                      alt="Product"
                      className="w-full h-72 object-cover rounded-lg"
                    />
                    {magnifierVisible && (
                      <div
                        className="absolute rounded pointer-events-none"
                        style={{
                          left: `${magnifierPosition.x}px`,
                          top: `${magnifierPosition.y}px`,
                          width: "300px",
                          height: "300px",
                          backgroundImage: `url(${
                            product?.productImage?.[selectedImage] ||
                            product?.productImage?.[0]
                          })`,
                          backgroundPosition: `-${
                            magnifierPosition.x * 1.2
                          }px -${magnifierPosition.y * 1.2}px`,
                          backgroundSize: "400%",
                        }}
                      />
                    )}
                  </div>
                  <div className="flex space-x-4 overflow-x-auto">
                    {product?.productImage?.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className={`w-20 h-20 rounded cursor-pointer  ${
                          selectedImage === idx
                            ? "border-2 border-blue-500"
                            : ""
                        }`}
                        onClick={() => setSelectedImage(idx)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold">{product.productName}</h1>
                  <p className="text-l font-semi-bold text-gray-300">
                    {product.productDescription}
                  </p>
                </div>
                <h2 className="text-sm text-gray-300 font-semibold">
                  Brand : {product.brand?.name || "Brand not added"}
                </h2>
                {product.category?.name && (
                  <h2 className="text-sm text-gray-300 font-semibold">
                    category : {product.category?.name || "Category not added"}
                  </h2>
                )}
                <div className="flex items-baseline space-x-4">
                  <span className="text-2xl font-bold text-green-500">
                    ₹{Math.round(product.salesPrice) || "Not available"}
                  </span>

                  {(product?.offer > 0 || product?.categoryOffer > 0) && (
                    // product?.salesPrice < product?.regularPrice &&
                    <>
                      <span className="text-gray-400 line-through">
                        ₹{product?.regularPrice}
                      </span>
                      <span className="text-green-500 text-sm">
                        {Math.max(
                          product?.offer || 0,
                          product?.categoryOffer || 0
                        )}
                        % off
                      </span>
                    </>
                  )}
                </div>
                <h6 className="text-orange-500 text-sm font-sans">
                  {product.units
                    ? product.units + " Stocks left"
                    : "Out of stock"}
                </h6>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5 text-yellow-400"
                      fill={star <= product.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <div className="flex md:space-x-4 flex-col md:flex-row gap-2 ">
                  {isAvailable ? (
                    !goToCart ? (
                      <button
                        className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 text-sm w-full md:w-auto font-mono"
                        onClick={handleAddToCart}
                      >
                        Add To Cart
                      </button>
                    ) : (
                      <Link
                        to={"/user/cart"}
                        className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 text-sm w-full md:w-auto font-mono"
                      >
                        Go to cart
                      </Link>
                    )
                  ) : (
                    <button
                      className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 text-sm w-full md:w-auto font-mono"
                      disabled
                    >
                      Product is Unavailable
                    </button>
                  )}

                  {isAvailable && user && (
                    <button
                      className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-full transition-colors duration-300 text-sm w-full md:w-auto"
                      onClick={() => {
                        if (!isAlreadyWishlisted) {
                          handleAddToWishList();
                        } else {
                          navigate("/user/wishlist");
                        }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6.01 4.01 4 6.5 4c1.74 0 3.41 1.01 4.22 2.44h1.56C14.09 5.01 15.76 4 17.5 4 19.99 4 22 6.01 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {!isAlreadyWishlisted
                        ? "Add to Wishlist"
                        : "Go to wishlist"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {!id && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Similar Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarProducts
                .filter((product) => product._id !== product[0]?._id)
                .map((product) => (
                  <div
                    key={product._id}
                    className="bg-gray-900 rounded-lg p-4 relative"
                  >
                    <img
                      src={product?.productImage?.[0]}
                      alt={product.productName}
                      className="w-full h-48 object-contain mb-4"
                      onClick={() => {
                        window.location.reload();
                        gotoDetails(product);
                      }}
                    />
                    <div className="space-y-2">
                      <h3 className="text-sm text-gray-400">
                        {product.brand?.name}
                      </h3>
                      <p className="font-semibold">{product.productName}</p>
                      <div className="flex items-baseline space-x-2">
                        <span className="font-bold">
                          {product.salesPrice.toFixed(0)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {product.regularPrice}
                        </span>
                        <span className="text-green-500 text-sm">
                          {/* {product.offer + "% off" || "99% off"} */}

                          {(product?.categoryOffer || product?.offer > 0) && (
                            <span className="text-red-500 ml-2 text-xs">
                              {product?.categoryOffer >= product?.offer
                                ? product.categoryOffer
                                : product?.offer}{" "}
                              % off
                            </span>
                          )}
                        </span>
                      </div>
                      {product.salesPrice > 1000 && (
                        <p className="text-sm text-gray-400">Free Delivery</p>
                      )}
                    </div>
                  </div>
                ))}
              {error && <div className="text-blue-500">{error}</div>}
            </div>
          </section>
        )}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
          <div className="space-y-8">
            {reviews?.map((review) => (
              <div key={review.id} className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-lg font-semibold">{review.name}</h3>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 text-yellow-400"
                      fill={star <= review.rating ? "currentColor" : "none"}
                    />
                  ))}
                  //{" "}
                </div>
                <p className="mt-2">{review.comment}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {review.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductDetails;
