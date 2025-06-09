import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "@/axiosIntercepters/AxiosInstance";
import { context } from "../../../Components/Provider";
import { useContext, useRef } from "react";
import Pagination from "../../../Components/Pagination";
import { Toast } from "../../../Components/Toast";
import { logoutAdmin } from "@/redux/adminSlice";
import ReactPaginate from "react-paginate";
import { useDispatch } from "react-redux";
import AlertDialogueButton from "@/Components/AlertDialogueButton";

function Products() {
  const [product, setProduct] = useState([]);
  const [search, setSearch] = useState("");
  const [filterProduct, setFilterProduct] = useState("All");
  const [spinner, setSpinner] = useState(false);
  const searchFocus = useRef(null);
  const { setData } = useContext(context);
  const [pageCount, setPageCount] = useState(1);
  const currentPage = useRef();
  const [postPerPage, setPostPerPage] = useState(5);
  const dispatch = useDispatch();

  //to refresh the page
  const handleRefresh = () => {
    window.location.reload();
  };

  //to send data to edit product page
  const sendDataToEdit = (product) => {
    setData(product);
  };

  const handleListing = async (id) => {
    try {
      const response = await axios.patch(`/admin/productListing/${id}`);
      if (response.data.product.isListed) {
        Swal.fire({
          title: "Unlisted",
          text: `${response.data.product.productName}
            Listed successfully`,
          icon: "success",
          confirmButtonText: "Done",
        });
      } else {
        Swal.fire({
          title: "Listed",
          text: `${response.data.product.productName}
            Unlisted successfully`,
          icon: "success",
          confirmButtonText: "Done",
        });
      }
      const updatedProduct = response.data.product;

      setProduct((prevPro) => ({
        ...prevPro,
        products: prevPro.products.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        ),
      }));
    } catch (error) {
      console.log(error);
      alert(error?.response?.data.message || "error admin/product");
    }
  };

  useEffect(() => {
    currentPage.current = 1;
    fetchProducts();
  }, [filterProduct, search]);

  const handlePageClick = async (e) => {
    currentPage.current = e.selected + 1;
    fetchProducts();
  };
  const fetchProducts = async () => {
    try {
      setSpinner(true);
      const response = await axios.get(
        `/admin/product?filter=${filterProduct}&page=${currentPage.current}&limit=${postPerPage}&search=${search}`
      );
      setSpinner(false);
      setProduct(response.data.results);
      setPageCount(response.data.results.pageCount);
      console.log(response.data.results);
    } catch (error) {
      setSpinner(false);
      console.log(error);
    }
  };
  const handleFilter = (e) => {
    setFilterProduct(e.target.value);
  };
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleDelete = async (id) => {
    setSpinner(true);
    // const result = confirm("Are you sure to delete this product");
    try {
      // if (result) {
      const response = await axios.delete(`/admin/product/${id}`);

      setProduct((prev) => ({
        ...prev,
        products: prev.products.map((product) =>
          product._id === id ? { ...product, isDeleted: true } : product
        ),
      }));

      setSpinner(false);
      Toast.fire({
        icon: "success",
        title: `${response.data.message}`,
      });

      // } else {
      //   setSpinner(false);
      //   Toast.fire({
      //     icon: "success",
      //     title: `Cancelled the deletion`,
      //   });
      // }
    } catch (error) {
      setSpinner(false);
      Toast.fire({
        icon: "success",
        title: `${response.data.message}`,
      });
    }
  };
  const handleRestore = async (id) => {
    // const result = confirm("Are you sure to restore categorie");
    try {
      // if (result) {
      const response = await axios.patch(`/admin/productRestore/${id}`);

      setProduct((prev) => ({
        ...prev,
        products: prev.products.map((product) =>
          product._id === id ? { ...product, isDeleted: false } : product
        ),
      }));

      Toast.fire({
        icon: "success",
        title: `${response.data.message}`,
      });
      // }
    } catch (error) {
      Toast.fire({
        icon: "success",
        title: `${response.data.message}`,
      });
    }
  };
  return (
    <>
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <Link
        className="bg-green-500 text-white px-4 py-2 rounded mb-4 block sm:inline-block"
        to="add"
      >
        <i className="fas fa-plus mr-2"></i> Add Product
      </Link>

      <main className="flex-1 p-6 bg-white text-black font-mono ">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
          <button
            className="flex items-center text-gray-600 mb-4 lg:mb-0"
            onClick={handleRefresh}
          >
            <i className="fas fa-sync-alt mr-2"></i> Refresh
          </button>
          <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search..."
              className="border rounded px-4 py-2 w-full lg:w-auto"
              value={search}
              ref={searchFocus}
              onChange={handleSearchChange}
            />
            <div className="flex items-center space-x-4">
              <span className="font-semibold">Filter</span>
              <select
                className="border rounded px-2 py-1 font-mono"
                value={filterProduct}
                onChange={handleFilter}
              >
                <option value="">Select Option</option>
                <option value="Recently Added">Recently Added</option>
                <option value="High-Low">High-Low</option>
                <option value="Low-High">Low-High</option>
                <option value="A-Z">A-Z</option>
                <option value="Z-A">Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Added overflow-x-auto to handle mobile overflow */}

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded shadow text-center font-mono">
            <thead className="bg-orange-500 text-white ">
              <tr>
                <th className="p-2">S.No</th>
                <th className="p-2">Product Name</th>
                <th className="p-2">Category</th>
                <th className="p-2">Description</th>
                <th className="p-2">Sale Price</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Image</th>
                <th className="p-2">Update</th>
              </tr>
            </thead>

            <tbody>
              {product?.products?.length > 0 ? (
                product.products?.map((product, index) => (
                  <tr className="border-b" key={index}>
                    <td className="p-2">{index + 1}</td>
                    {product.isDeleted ? (
                      <>
                        <td className="p-2 line-through">
                          {product.productName}
                        </td>
                        <td className="p-2 line-through">
                          {product.category?.name || "not Fetched"}
                        </td>
                        <td className="p-2 line-through">
                          {product?.productDescription}
                        </td>
                        <td className="p-2 line-through">
                          {product.salesPrice}
                        </td>
                        <td className="p-2 line-through">{product.units}</td>
                      </>
                    ) : (
                      <>
                        <td className="p-2 ">{product.productName}</td>
                        <td className="p-2 ">
                          {product.category?.name || "not Fetched"}
                        </td>
                        <td className="p-2 whitespace-normal">
                          {product.productDescription
                            .split(" ")
                            .slice(0, 2)
                            .join(" ")}
                          ...
                        </td>
                        <td className="p-2 ">
                          {Math.round(product.salesPrice)}
                        </td>
                        <td className="p-2 ">{product.units}</td>
                      </>
                    )}
                    <td className="p-2">
                      <img
                        src={
                          product.productImage[0] ||
                          "https://placehold.co/50x50"
                        }
                        alt={product.productName}
                        className="w-12 h-12 object-cover mx-auto"
                      />
                    </td>
                    <td className="p-2 flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2 align-middl justify-center relative">
                      {!product.isDeleted && (
                        <Link to="edit">
                          <i
                            className="fas fa-edit mr-2"
                            onClick={() => sendDataToEdit(product)}
                          ></i>
                        </Link>
                      )}
                      {!product.isDeleted && (
                        <button
                          className={
                            product.isListed
                              ? "bg-red-600 hover:bg-red-700 lg:p-2 p-1 rounded w-22  font-mono"
                              : "bg-blue-600 hover:bg-blue-700 lg:p-2 p-1 rounded w-17 font-mono"
                          }
                          onClick={() => handleListing(product._id)}
                        >
                          {product.isListed ? "Unlist" : "List"}
                        </button>
                      )}
                      {product.isDeleted ? (
                        // <button
                        //   onClick={() => handleRestore(product._id)}
                        //   className="rounded bg-green-600 p-2  font-mono "
                        // >
                        //   Restore
                        // </button>

                        <AlertDialogueButton
                          name={
                            <button className="rounded bg-green-600 p-2  font-mono ">
                              Restore
                            </button>
                          }
                          onClick={() => handleRestore(product._id)}
                          className="text-white px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded shadow"
                        />
                      ) : (
                        // <i
                        //   className="fas fa-trash-alt top-5 right-0 absolute"
                        //   onClick={() => handleDelete(product._id)}
                        // ></i>

                        <AlertDialogueButton
                          name={
                            <i className="fas fa-trash-alt top-5 right-0 absolute"></i>
                          }
                          onClick={() => handleDelete(product._id)}
                          className="text-white px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded shadow"
                        />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2">No product were listed yet</td>
                </tr>
              )}
            </tbody>
          </table>

          <ReactPaginate
            className="flex justify-center items-center space-x-2 mt-4"
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
            pageLinkClassName="px-4 py-2 border border-gray-400 rounded-md text-sm hover:bg-gray-200 transition duration-200"
            previousClassName="flex items-center"
            previousLinkClassName="px-4 py-2 border rounded-md text-sm hover:bg-gray-200 transition duration-200"
            nextClassName="flex items-center"
            nextLinkClassName="px-4 py-2 border rounded-md text-sm hover:bg-gray-200 transition duration-200"
            activeClassName="bg-blue-500 text-white"
          />
        </div>
      </main>
    </>
  );
}

export default Products;
