import React, { useEffect, useRef } from "react";
import { useState } from "react";
import axios from "@/axiosIntercepters/AxiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { context } from "../../../Components/Provider";
import { useContext } from "react";
import { Toast } from "../../../Components/Toast";
import { logoutAdmin } from "@/redux/adminSlice";
import { useDispatch } from "react-redux";
import ReactPaginate from "react-paginate";
import { Calendar, Search } from "lucide-react";
import AlertDialogueButton from "@/Components/AlertDialogueButton";
const Category = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [offer, setOffer] = useState("");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState({});
  const [categoryImage, setCategoryImage] = useState("");
  const [image, setImage] = useState(null);
  const [spinner, setSpinner] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const currentPage = useRef();
  const [pageCount, setPageCount] = useState(1);
  const [postPerPage, setPostPerPage] = useState(5);

  const searchFocus = useRef(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { setData } = useContext(context);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const error = {};
  const validateForm = () => {
    if (name.trim() == "") error.name = "Category name is required *";
    const firstLetter = name[0];
    if (!isNaN(name)) error.name = "Category name must statrt with a letter *";
    if (!image) error.image = "Upload a image for the category *";
    return error;
  };

  const sendDataToEdit = (category) => {
    setData(category);
  };
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleFilter = (e) => {
    setFilter(e.target.value);
  };
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handlePageClick = async (e) => {
    currentPage.current = e.selected + 1;
    fetchCategories();
  };

  const fetchCategories = async () => {
    try {
      setSpinner(true);
      const response = await axios.get(
        `/admin/category?search=${search}&filter=${filter}&page=${currentPage.current}&limit=${postPerPage}&startDate=${startDate}&endDate=${endDate}`
      );
      setCategories(response.data.categories);
      setSpinner(false);
      setPageCount(response.data?.pageCount);
    } catch (error) {
      setSpinner(false);
      console.log(error);
    } finally {
      searchFocus?.current.focus();
    }
  };
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearch("");
  };

  useEffect(() => {
    currentPage.current = 1;
    fetchCategories();
  }, [search, filter, startDate, endDate]);

  const handleProductImageChange = (e) => {
    const imageFile = e.target.files[0];
    if (imageFile) {
      setImage(imageFile);
    }
  };

  const handleImageChange = (e) => {
    const imageFile = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 1 * 1024 * 1024;

    if (!imageFile) return;

    if (!allowedTypes.includes(imageFile.type)) {
      Toast.fire({
        icon: "error",
        title: "Please upload a JPEG, JPG, or PNG file.",
      });
      return;
    }

    if (imageFile.size > maxSize) {
      Toast.fire({
        icon: "error",
        title: "File size must be under 1MB.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCategoryImage(reader.result);
    };
    reader.readAsDataURL(imageFile);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const formError = validateForm();
    if (Object.keys(formError).length > 0) {
      setMessage(formError);
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description);
    formData.append("file", image);
    try {
      if (Object.keys(formError).length == 0) {
        setSpinner(true);

        const response = await axios.post("/admin/category", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSpinner(false);
        setCategories((prev) => [, response.data?.category, ...prev]);
        setName("");
        setDescription("");
        setCategoryImage("");
        Toast.fire({
          icon: "success",
          title: `${response.data.message}`,
        });
      }
    } catch (error) {
      setSpinner(false);
      Toast.fire({
        icon: "error",
        title: `${error?.response?.data.message}`,
      });
      console.log(error);
    }
  };

  const handleRestore = async (id) => {
    // const result = confirm("Are you sure to restore categorie");
    try {
      // if (result) {
      const response = await axios.patch(`/admin/categoryRestore/${id}`);
      Toast.fire({
        icon: "success",
        title: `${response.data.message}`,
      });
      setCategories((prev) =>
        prev?.map((cat) =>
          cat?._id === id ? { ...cat, isDeleted: false } : cat
        )
      );

      // window.location.reload();
      // }
    } catch (error) {
      alert(error.response?.data.message);
    }
  };
  const handleDelete = async (id) => {
    // const result = confirm("Are you sure to delete categorie");
    try {
      // if (result) {
      const response = await axios.delete(`/admin/category/${id}`);
      setCategories((prev) =>
        prev?.map((cat) =>
          cat?._id === id ? { ...cat, isDeleted: true } : cat
        )
      );
      Toast.fire({
        icon: "success",
        title: `${response.data.message}`,
      });
      // } else {
      //   Toast.fire({
      //     icon: "success",
      //     title: `Cancelled the deletion`,
      //   });
      // }
    } catch (error) {
      Toast.fire({
        icon: "success",
        title: `${response.data.message}`,
      });
    }
  };
  const handleListing = async (id) => {
    try {
      const response = await axios.patch(`/admin/categoryListing/${id}`);
      if (response.data.category.isListed) {
        Swal.fire({
          title: "Listed",
          text: `${response.data.category.name}
            "Listed successfully`,
          icon: "success",
          confirmButtonText: "Done",
        });
      } else {
        Swal.fire({
          title: "Unlisted",
          text: `${response.data.category.name}
            "Unlisted successfully`,
          icon: "success",
          confirmButtonText: "Done",
        });
      }
      const updatedCategory = response.data.category;

      setCategories((prevCat) =>
        prevCat.map((cate) =>
          cate._id == updatedCategory._id ? updatedCategory : cate
        )
      );
    } catch (error) {
      console.log(error);
      alert(error?.response?.data.message || "Error occured at line 182");
    }
  };

  return (
    //w-4/5
    <main className="w-full p-8 font-mono">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
        <button
          className="flex items-center text-gray-600 mb-4 lg:mb-0"
          onClick={handleRefresh}
        >
          <i className="fas fa-sync-alt mr-2"></i> Refresh
        </button>
        <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4 w-full lg:w-auto">
          <div className="w-full max-w-4xl mx-auto p-6  rounded-lg shadow-sm font-sans">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name,description..."
                  value={search}
                  ref={searchFocus}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Date Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Start Date */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        min={startDate} // Ensure end date is not before start date
                        className="w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm mt-5 font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="font-semibold text-gray-600">Sort: </span>
            <select
              className="border rounded px-2 py-1 font-mono text-black  "
              value={filter}
              onChange={handleFilter}
            >
              <option value="">Select Option</option>
              <option value="oldest">Oldest</option>
              <option value="A-Z">A-Z</option>
              <option value="Z-A">Z-A</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-200 p-4 rounded shadow-md text-black h-80 overflow-y-scroll">
        <table className="w-full text-left ">
          <thead className="">
            <tr className="bg-orange-500 ">
              <th className="p-2">S.No</th>
              <th className="p-2">Category Name</th>
              <th className="p-2">Description</th>
              <th className="p-2">Offer</th>
              <th className="p-2">Max discount</th>
              <th className="p-2">image</th>
              <th className="p-2">List / Unlist</th>
            </tr>
          </thead>
          <tbody className="">
            {categories?.length > 0 ? (
              categories.map((category, index) => (
                <tr className="border-2 border-b-gray-300" key={category._id}>
                  <td
                    className={category.isDeleted ? "line-through p-2" : "p-2"}
                  >
                    {index + 1}
                  </td>
                  <td
                    className={category.isDeleted ? "line-through p-2" : "p-2"}
                  >
                    {category.name}
                  </td>
                  <td
                    className={category.isDeleted ? "line-through p-2" : "p-2"}
                  >
                    {category.description?.slice(0, 12)}{" "}
                    {category.description.length > 12 && "..."}
                  </td>
                  <td
                    className={category.isDeleted ? "line-through p-2" : "p-2"}
                  >
                    {category?.offer} %
                  </td>
                  <td
                    className={category.isDeleted ? "line-through p-2" : "p-2"}
                  >
                    {category?.maxDiscount || 0} ₹
                  </td>
                  <td className="p-2">
                    <img
                      src={category.image || "https://placehold.co/50x50"}
                      alt={category.name}
                      className="w-12 h-12 object-cover mx-auto"
                    />
                  </td>
                  <td className="p-2 flex items-center space-x-3 text-xl">
                    {!category.isDeleted && (
                      <button
                        className={
                          category.isListed
                            ? "bg-red-600 hover:bg-red-700 lg:p-2 p-1 rounded w-22 w-1/2 font-mono"
                            : "bg-blue-600 hover:bg-blue-700 lg:p-2 p-1 rounded w-17 w-1/2 font-mono"
                        }
                        onClick={() => handleListing(category._id)}
                      >
                        {category.isListed ? "Unlist" : "List"}
                      </button>
                    )}
                    {!category.isDeleted && (
                      <Link className="" to="edit">
                        <i
                          className="fas fa-edit mr-2"
                          onClick={() => sendDataToEdit(category)}
                        ></i>
                      </Link>
                    )}

                    {category.isDeleted ? (
                      <AlertDialogueButton
                        name={
                          <button className="rounded bg-green-600 p-1 font-mono">
                            Restore
                          </button>
                        }
                        onClick={() => handleRestore(category._id)}
                        className="text-white px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded shadow"
                      />
                    ) : (
                      <AlertDialogueButton
                        name={<i className="fas fa-trash-alt"></i>}
                        onClick={() => handleDelete(category._id)}
                        className="text-white px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded shadow"
                      />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td className="p-2 font-bold mt-10 ms-10 ">
                  No Categories added yet!
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <ReactPaginate
          className="flex justify-center border-gray-700 items-center space-x-2 mt-4"
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
      <div className="bg-gray-200 p-4 mt-8 rounded shadow-md text-black">
        <h2 className="text-xl font-bold mb-4">Add New Category</h2>
        <form className="flex flex-col space-y-6">
          <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-6 lg:space-y-0">
            <div className="flex flex-col">
              <label className="mr-2 font-mono">Name :</label>
              <input
                type="text"
                className="border-2 border-gray-400 p-2 rounded font-mono"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {message.name && (
                <p className="text-red-700 text-sm">{message.name}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="mr-2 font-mono">Description (optional):</label>
              <input
                type="text"
                className="border-2 border-gray-400 p-2 rounded font-mono"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Improved Image Upload Area */}
          <div className="border-2 border-gray-300 rounded p-4 flex flex-col items-center">
            <label htmlFor="fileInputone" className="cursor-pointer group">
              <div className="relative w-32 h-32 mb-4 border-2 border-dashed border-gray-300 rounded flex justify-center items-center hover:bg-gray-100 group-hover:border-blue-500 transition-all">
                <img
                  src={categoryImage || "https://placehold.co/100x100"}
                  alt="product image"
                  className={`object-cover w-full h-full rounded ${
                    !categoryImage ? "opacity-50" : ""
                  }`}
                />
                {!categoryImage && (
                  <div className="absolute inset-0 flex justify-center items-center">
                    <p className="text-gray-500 font-mono bold">Upload Image</p>
                  </div>
                )}
              </div>
            </label>
            <input
              id="fileInputone"
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleImageChange(e);
                handleProductImageChange(e);
              }}
              style={{ display: "none" }}
            />
            <p className="bg-gray-200 p-2 rounded font-mono">Change Image</p>
          </div>
          {message.image && (
            <p className="text-red-700 text-sm">{message.image}</p>
          )}

          {/* Save Button at the Bottom */}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-green-500 text-white p-3 rounded font-mono w-32 hover:bg-green-600 transition-all"
              onClick={handleAddCategory}
            >
              SAVE
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Category;
