import axios from "@/axiosIntercepters/AxiosInstance";
import React, { useEffect, useState } from "react";
import { Toast } from "../../../Components/Toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser, setProductDetails } from "@/redux/userSlice";

const SearchProducts = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/products?search=${search}`);
        setProducts(response.data.products);
        setCategory(response.data.category);
      } catch (error) {
        if (error?.response.data.isBlocked) {
          dispatch(logoutUser());
        }
        Toast.fire({
          icon: "error",
          title: `${error?.response?.data.message}`,
        });
        console.log(error.message);
      }
    })();
  }, [search]);

  const goToDetails = (product) => {
    dispatch(setProductDetails(product));
    navigate("/user/productDetails");
  };

  return (
    <div className="container mx-auto px-4">
      {/* Carousel Section */}
      <div className="carousel mb-6">
        <img
          src={
            "https://digitalalliance.co.id/wp-content/uploads/2021/05/banner-category-gaming-gear-accessories-stands.jpg" ||
            "https://placehold.co/1200x300"
          }
          alt="Carousel Image"
          className="w-full rounded-lg"
        />
      </div>

      {/* Search Bar */}
      <div className="search-bar mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search you product here..."
          className="border-2 border-gray-600 rounded font-mono rounded-l-md p-2 w-2/3 bg-transparent outline-none focus:outline-none  "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Product Grid */}
      <div className="product-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20 font-mono">
        {products?.length > 0 ? (
          products?.map(
            (product, index) =>
              product.isListed &&
              !product.isDeleted &&
              product.category.isListed &&
              !product.category.isDeleted && (
                <div
                  className="product-card border-gray-100 rounded-lg p-2 shadow-md hover:shadow-slate-800 hover:scale-105 transition-all duration-100  h-full"
                  key={index}
                >
                  <img
                    src={
                      product.productImage[0] || "https://placehold.co/200x200"
                    }
                    alt="Product Image"
                    className="w-full h-32 object-cover mb-2 rounded-md" // Adjust height of the image
                    onClick={() => goToDetails(product)}
                  />
                  <h2 className="text-lg font-bold  ">{product.productName}</h2>{" "}
                  {/* Smaller text size */}
                  <p className=" text-sm font-semibold text-gray-200">
                    {product.category.name}
                  </p>
                  <p className="text-gray-400 text-sm mb-3">
                    {product.productDescription}
                  </p>
                  <p className="price font-bold  text-md ">
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
                      ₹ {product.regularPrice}{" "}
                    </span>
                    {(product.categoryOffer || product?.offer > 0) && (
                      <span className="text-red-500 ml-2 text-xs">
                        {product.categoryOffer >= product.offer
                          ? product.categoryOffer
                          : product.offer}{" "}
                        % off
                      </span>
                    )}{" "}
                  </p>
                  <p className="text-green-600 text-xs">
                    {product.salesPrice > 1000 ? "Free Delivery" : ""}
                  </p>
                </div>
              )
          )
        ) : (
          <p className="text-gray-300 font-bold text-sm text-center w-screen">
            "{search}" No products were founded
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchProducts;
