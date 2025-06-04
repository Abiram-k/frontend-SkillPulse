import React, { useEffect, useRef, useState } from "react";
import productBanner from "../../../assets/homeProductBanner.webp";
import axios from "@/axiosIntercepters/AxiosInstance";
import { Toast } from "../../../Components/Toast";
import {
  logoutUser,
  setProductDetails,
  wishlistItems,
} from "../../../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../Components/Pagination";
import { Heart, Share2, ShoppingCart } from "lucide-react";
import {
  addToWishList,
  removeFromWishlist,
} from "../wishlist/addRemoveWishlit";
import { showToast } from "@/Components/ToastNotification";
import { useSearchParams } from "react-router-dom";
import ReactPaginate from "react-paginate";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const [brand, setBrand] = useState([]);
  const [filter, setFilter] = useState({
    category: "",
    brand: "",
    price: "",
  });

  const [wishlistItems, setWishlistItems] = useState([]);
  const [search, setSearch] = useState("");
  const [trigger, setTrigger] = useState(0);

  const [searchParams] = useSearchParams();

  const currentPage = useRef();
  const [pageCount, setPageCount] = useState(1);
  const [postPerPage, setPostPerPage] = useState(8);

  const categoryIdFromQuery = searchParams.get("categoryId");

  const [cartProduct, setCartProduct] = useState([]);

  const user = useSelector((state) => state.users.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, [filter, trigger, search]);

  useEffect(() => {
    if (categoryIdFromQuery && category.length > 0) {
      const matchedCategory = category.find(
        (item) => item._id === categoryIdFromQuery
      );

      if (
        !filter.category &&
        matchedCategory &&
        filter.category !== matchedCategory.name
      ) {
        setFilter((prev) => ({ ...prev, category: matchedCategory.name }));
      }
    }
  }, [category, categoryIdFromQuery]);

  const handlePageClick = async (e) => {
    currentPage.current = e.selected + 1;
    fetchProducts();
  };

  useEffect(() => {
    if (user) {
      const savedCart =
        JSON.parse(localStorage.getItem(`cart_${user?._id}`)) || [];
      setCartProduct(savedCart);
    }
  }, [user?._id]);

  const fetchProducts = async () => {
    try {
      // setSpinner(true);
      const response = await axios.get(
        `/products?search=${search}&page=${
          currentPage.current || 1
        }&limit=${postPerPage}`,
        {
          params: filter,
        }
      );
      setSpinner(false);
      setProducts(response.data.products);
      setCategory(response.data.categoryDoc);
      setBrand(response.data.brandDoc);
      setPageCount(response.data?.pageCount);
    } catch (error) {
      setSpinner(false);
      if (error?.response.data.isBlocked) {
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

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      setSpinner(true);
      await removeFromWishlist(product, user, dispatch);
      setWishlistItems((prev) => prev.filter((pr) => (pr = !product)));
      setTrigger((prev) => prev + 1);
      setSpinner(false);
    } catch (error) {
      alert("Error while remove wishlist");
      setSpinner(false);
      console.log(error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`/wishlist?user=${user._id}`);
      const uniqueWishlistItems = [
        ...new Set(
          response.data.wishlist[0].products.map(
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
      if (error?.response?.data.isBlocked) {
        dispatch(logoutUser());
      }
    }
  };

  const handleShare = async (product, productId) => {
    const shareData = {
      title: product.name || "Check out this product",
      text: product.description || "Amazing product you might like!",
      url: `${window.location.origin}/user/productDetails?id=${productId}`,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        console.log("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      try {
        await navigator.clipboard.writeText(shareData.url);
        console.log("Link copied to clipboard!");
      } catch (clipboardError) {
        console.error("Failed to copy to clipboard:", clipboardError);
      }
    }
  };

  const handleAddToCart = async (id) => {
    if (!user?._id) {
      navigate("/login");
      return;
    }
    try {
      setSpinner(true);
      const response = await axios.post(
        `/addToCart/${id}`,
        {},
        {
          params: {
            userId: user?._id,
          },
        }
      );
      setCartProduct((prev) => {
        if (!prev.includes(id)) {
          const updatedCart = [...prev, id];
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

  return (
    <div>
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div
        className="py-8 bg-cover bg-center mb-10 w-full h-96 md:h-[500px] lg:h-[600px] relative"
        style={{
          backgroundImage: `url(${
            "https://digitalalliance.co.id/wp-content/uploads/2021/05/banner-category-gaming-gear-accessories-stands.jpg" ||
            productBanner
          })`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
          height: "150px",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 text-sm md:text-2xl font-bold mx-3">
            Unleash Your Inner Gamer with the Gear That Powers Champions—Level
            Up Your Game Today!
          </h1>
        </div>
      </div>

      <div className="filters grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-950 rounded-lg shadow-lg border-b-2 border-t-2 border-gray-800 mb-10">
        <div>
          <p className="font-bold text-2xl mb-4">Category</p>

          <select
            className="w-full p-2 bg-gray-800 text-white rounded font-mono"
            defaultValue=""
            name="category"
            value={filter.category || ""}
            onChange={handleFilter}
          >
            <option value="" disabled>
              Select a Category
            </option>
            <option value="">All Categories</option>
            {category.map((item) => (
              <option value={item.name} key={item._id} onClick={handleFilter}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Discount Offers Filter */}
        <div>
          <p className="font-bold text-2xl mb-4">Discount offers</p>
          <select
            className="w-full p-2 bg-gray-800 text-white rounded font-mono"
            defaultValue=""
            onChange={handleFilter}
            value={filter.offer}
            name="offer"
          >
            <option value="" disabled>
              Select a Offer
            </option>
            <option value="">All products</option>
            <option value="10-20">10% - 20%</option>
            <option value="20-30">20% - 30%</option>
            <option value="above-50">Up to 50%</option>
          </select>
        </div>

        {/* Price Filter */}
        <div>
          <p className="font-bold text-2xl mb-4">Price Filter</p>
          <select
            className="w-full p-2 bg-gray-800 text-white rounded font-mono"
            defaultValue=""
            value={filter.price || ""}
            onChange={handleFilter}
            name="price"
          >
            <option value="" disabled>
              Select Price Range
            </option>
            <option value="">All products</option>
            <option value="Low-High">Low-High</option>
            <option value="High-Low">High-Low</option>
            <option value="below-5000">Below 5000₹</option>
            <option value="5000-10000">5000₹ - 10,000₹</option>
            <option value="10000-50000">10,000₹ - 50,000₹</option>
            <option value="above-50000">Above 50,000₹</option>
          </select>
        </div>

        <div>
          <p className="font-bold text-2xl mb-4">Brand</p>
          <select
            className="w-full p-2 bg-gray-800 text-white rounded font-mono"
            defaultValue=""
            name="brand"
            value={filter.brand || ""}
            onChange={handleFilter}
          >
            <option value="" disabled>
              Select a Brand
            </option>
            <option value="">All Brands</option>
            {brand.map((item) => (
              <option value={item.name} key={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="search-bar mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search you product here..."
          className="border-2 border-gray-600 rounded font-mono rounded-l-md p-2 w-2/3 bg-transparent outline-none focus:outline-none  "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="products grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 font-mono">
        {products?.length > 0 ? (
          products?.map((product, index) =>
            product?.isListed &&
            !product?.isDeleted &&
            product?.category?.isListed &&
            !product?.category?.isDeleted ? (
              <div
                className="relative bg-gray-800 p-4 rounded shadow-lg transform hover:scale-105 transition-transform duration-300"
                key={product._id}
              >
                <img
                  src={
                    product.productImage[0] || "https://placehold.co/300x200"
                  }
                  alt={product.productDescription}
                  className="w-full h-40 object-cover rounded-t-lg cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => goToDetails(product)}
                />

                <div className="p-3 text-center">
                  <p className="text-sm  text-white truncate lg:text-lg font-bold">
                    {product.productName}
                  </p>
                  <p className="text-sm font-medium text-gray-400 ">
                    {product.productDescription}
                  </p>

                  <p className="text-lg font-bold text-green-400 mt-1">
                    {product.salesPrice < product.regularPrice && (
                      <span>₹ {product.salesPrice.toFixed(0)}</span>
                    )}
                    <span
                      className={`${
                        product.salesPrice < product.regularPrice
                          ? "line-through text-gray-500"
                          : "text-green-400"
                      }  ml-2`}
                    >
                      ₹ {product.regularPrice}
                    </span>
                    {(product.categoryOffer || product?.offer > 0) && (
                      <span className="text-red-500 ml-2 text-xs">
                        {product.categoryOffer >= product.offer
                          ? product.categoryOffer
                          : product.offer}{" "}
                        % off
                      </span>
                    )}
                  </p>
                  <div className="absolute top-2 left-2 w-10 h-10 bg-gray-600 hover:bg-gray-700 border-white border-1 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
                    <Share2
                      className="w-5 h-5 text-white hover:text-blue-700 transition-colors"
                      onClick={() => handleShare(product, product._id)}
                    />
                  </div>
                  {cartProduct.includes(product._id) ? (
                    <div className="absolute top-2 right-12 w-10 h-10 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
                      <ShoppingCart
                        className="w-5 h-5 fill-green-600 text-green-600"
                        onClick={() => {
                          if (!user?._id) {
                            navigate("/login");
                            return;
                          } else {
                            navigate("/user/cart");
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="absolute top-2 right-12 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
                      <ShoppingCart
                        className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={() => {
                          // if (spinner) {
                          //   return;
                          // }
                          if (user) handleAddToCart(product._id);
                          else navigate("/login");
                        }}
                      />
                    </div>
                  )}
                  {wishlistItems.includes(product._id) ? (
                    <Heart
                      className="absolute top-3 right-3 w-7 h-7 fill-red-600 text-red-600 cursor-pointer"
                      onClick={() => {
                        if (user) handleRemoveFromWishlist(product._id);
                        else navigate("/login");
                      }}
                    />
                  ) : (
                    <Heart
                      className="absolute top-3 right-3 w-7 h-7 text-gray-300 transition-colors cursor-pointer"
                      onClick={() => {
                        if (user) handleAddToWishList(product._id);
                        else navigate("/login");
                      }}
                    />
                  )}

                  <p className="text-xs text-gray-400 mt-1">
                    {product.salesPrice > 1000
                      ? "Free Delivery"
                      : "Delivery Charges Apply"}
                  </p>
                </div>
              </div>
            ) : (
              <div
                key={""}
                className="product-card p-4 rounded-lg shadow-lg relative w-screen"
              >
                <p className="text-center font-bold">
                  {/* NO Product Were Founded{" "} */}
                </p>
              </div>
            )
          )
        ) : (
          <div
            key={""}
            className="product-card p-4 rounded-lg shadow-lg relative w-screen"
          >
            <p className="text-center font-bold">NO Product Were Founded </p>
          </div>
        )}
      </div>

      <ReactPaginate
        className="flex justify-center border-gray-700 items-center space-x-2 mt-4 mb-3 font-mono"
        breakLabel="..."
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="< previous"
        renderOnZeroPageCount={null}
        marginPagesDisplayed={2}
        containerClassName="flex flex-wrap justify-center gap-2"
        pageClassName="flex items-center"
        pageLinkClassName="px-4 py-2 border border-gray-400 rounded-md text-sm hover:bg-blue-600 transition duration-200"
        previousClassName="flex items-center"
        previousLinkClassName="px-4 py-2 border rounded-md text-sm hover:bg-gray-200 transition duration-200"
        nextClassName="flex items-center"
        nextLinkClassName="px-4 py-2 border rounded-md text-sm hover:bg-gray-200 transition duration-200"
        activeClassName="bg-blue-500 text-white"
      />
    </div>
  );
};

export default Shop;
