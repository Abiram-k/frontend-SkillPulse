import React, { useEffect, useState } from "react";
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
import { Heart } from "lucide-react";
import {
  addToWishList,
  removeFromWishlist,
} from "../wishlist/addRemoveWishlit";
const Shop = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [brand, setBrand] = useState([]);
  const [filter, setFilter] = useState({
    category: "",
    brand: "",
    price: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(8);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [search, setSearch] = useState("");
  const [trigger, setTrigger] = useState(0);
  const user = useSelector((state) => state.users.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, [filter, trigger]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/products", {
        params: filter,
      });
      setProducts(response.data.products);
      setCategory(response.data.categoryDoc);
      setBrand(response.data.brandDoc);
    } catch (error) {
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
  const filteredProduct = products.filter((product, index) =>
    product.productName.toLowerCase().includes(search.toLowerCase())
  );
  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const currentProduct = filteredProduct.slice(firstPostIndex, lastPostIndex);

  const handleAddToWishList = async (product) => {
    setTrigger((prev) => prev + 1);
    try {
      await addToWishList(product, user, dispatch);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveFromWishlist = async (product) => {
    try {
      await removeFromWishlist(product, user, dispatch);
      setTrigger((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`/wishlist?user=${user._id}`);
      console.log(response.data.wishlist[0]);
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
      // dispatch(removefromWishlist());
      console.log("Wishlist Items : ", response.data.wishlist);
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
  return (
    <div>
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
        {currentProduct.length > 0 ? (
          currentProduct.map((product, index) =>
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

                {/* <Heart
                  className="absolute top-3 right-3 w-7 h-7 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                  onClick={() =>
                    addedToWishlist
                      ? handleRemoveFromWishlist()
                      : handleAddToWishlist()
                  }
                /> */}

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
                  {wishlistItems.includes(product._id) ? (
                    <Heart
                      className="absolute top-3 right-3 w-7 h-7 fill-red-600 text-red-600 cursor-pointer"
                      onClick={() => handleRemoveFromWishlist(product._id)}
                    />
                  ) : (
                    <Heart
                      className="absolute top-3 right-3 w-7 h-7 text-gray-300 transition-colors cursor-pointer"
                      onClick={() => handleAddToWishList(product._id)}
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
      <Pagination
        totalPosts={products.length}
        postsPerPage={postPerPage}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
      />
    </div>
  );
};

export default Shop;
