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

const Brand = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brands, setBrands] = useState([]);
  const [message, setMessage] = useState({});
  const [brandImage, setBrandImage] = useState("");
  const [image, setImage] = useState(null);
  const [spinner, setSpinner] = useState(false);
  const { setData } = useContext(context);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const currentPage = useRef();
  const [pageCount, setPageCount] = useState(1);
  const [postPerPage, setPostPerPage] = useState(5);

  const searchFocus = useRef(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const error = {};

  const validateForm = () => {
    if (name.trim() === "") error.name = "Brand name is required *";
    const firstLetter = name[0];
    if (!isNaN(name)) error.name = "Brand name must start with a letter *";
    if (!image) error.image = "Upload an image for the brand *";
    return error;
  };

  const sendDataToEdit = (brand) => {
    setData(brand);
  };

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
    setBrandImage(null);
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
      window.location.reload();
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setBrandImage(reader.result);
    };
    reader.readAsDataURL(imageFile);
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(
        `/admin/brand?search=${search}&filter=${filter}&page=${
          currentPage.current || 1
        }&limit=${postPerPage}&startDate=${startDate}&endDate=${endDate}`
      );
      setBrands(response.data?.brands);
      setPageCount(response.data?.pageCount || 1);
    } catch (error) {
      if (
        error?.response.data.message == "Token not found" ||
        error?.response.data.message == "Failed to authenticate Admin"
      ) {
        dispatch(logoutAdmin());
      }
      console.log(error);
      alert(error?.response.data.message);
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
    fetchBrands();
  }, [search, filter, startDate, endDate]);

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
    fetchBrands();
  };

  const handleAddBrand = async (e) => {
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
      if (Object.keys(formError).length === 0) {
        setSpinner(true);
        const response = await axios.post("admin/brand", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setSpinner(false);
        setBrands((prev) => [response.data?.brand, ...prev]);
        setName("");
        setDescription("");
        setBrandImage("");

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
    const result = confirm("Are you sure to restore brand");
    try {
      if (result) {
        const response = await axios.patch(`/admin/brandRestore/${id}`);
        Toast.fire({
          icon: "success",
          title: `${response?.data.message}`,
        });
        setBrands((prev) =>
          prev?.map((brand) =>
            brand?._id === id ? { ...brand, isDeleted: false } : brand
          )
        );
      }
    } catch (error) {
      alert(error?.response?.data.message);
    }
  };

  const handleDelete = async (id) => {
    const result = confirm("Are you sure to delete brand");
    try {
      if (result) {
        const response = await axios.delete(`/admin/brand/${id}`);
        setBrands((prev) =>
          prev?.map((brand) =>
            brand?._id === id ? { ...brand, isDeleted: true } : brand
          )
        );
        Toast.fire({
          icon: "success",
          title: `${response.data?.message}`,
        });
      } else {
        Toast.fire({
          icon: "success",
          title: `Cancelled the deletion`,
        });
      }
    } catch (error) {
      Toast.fire({
        icon: "success",
        title: `${error?.response?.data?.message}`,
      });
    }
  };

  const handleListing = async (id) => {
    try {
      const response = await axios.patch(`/admin/brandListing/${id}`);
      if (response.data.brand.isListed) {
        Swal.fire({
          title: "Listed",
          text: `${response.data.brand.name} Listed successfully`,
          icon: "success",
          confirmButtonText: "Done",
        });
      } else {
        Swal.fire({
          title: "Unlisted",
          text: `${response.data.brand.name} Unlisted successfully`,
          icon: "success",
          confirmButtonText: "Done",
        });
      }
      const updatedBrand = response.data.brand;
      setBrands((prevBrands) =>
        prevBrands.map((br) =>
          br._id === updatedBrand._id ? updatedBrand : br
        )
      );
    } catch (error) {
      console.log(error);
      alert(error?.response?.data.message || "Error occurred at line 182");
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
          <thead>
            <tr className="bg-orange-500 ">
              <th className="p-2">S.No</th>
              <th className="p-2">Brand Name</th>
              <th className="p-2">Description</th>
              <th className="p-2">Image</th>
              <th className="p-2">List / Unlist</th>
            </tr>
          </thead>
          <tbody>
            {brands?.length > 0 ? (
              brands.map((brand, index) => (
                <tr className="border-t" key={brand._id}>
                  <td className={brand.isDeleted ? "line-through p-2" : "p-2"}>
                    {index + 1}
                  </td>
                  <td className={brand.isDeleted ? "line-through p-2" : "p-2"}>
                    {brand.name}
                  </td>
                  <td className={brand.isDeleted ? "line-through p-2" : "p-2"}>
                    {brand.description}
                  </td>
                  <td className="p-2">
                    <img
                      src={brand.image || "https://placehold.co/50x50"}
                      alt={brand.name}
                      className="w-12 h-12 object-cover mx-auto"
                    />
                  </td>
                  <td className="p-2 flex items-center space-x-3 text-xl">
                    {!brand.isDeleted && (
                      <button
                        className={
                          brand.isListed
                            ? "bg-red-600 hover:bg-red-700 lg:p-2 p-1 rounded w-22 w-1/2 font-mono"
                            : "bg-blue-600 hover:bg-blue-700 lg:p-2 p-1 rounded w-17 w-1/2 font-mono"
                        }
                        onClick={() => handleListing(brand._id)}
                      >
                        {brand.isListed ? "Unlist" : "List"}
                      </button>
                    )}
                    {!brand.isDeleted && (
                      <Link to="edit">
                        <i
                          className="fas fa-edit mr-2"
                          onClick={() => sendDataToEdit(brand)}
                        ></i>
                      </Link>
                    )}
                    {brand.isDeleted ? (
                      <button
                        onClick={() => handleRestore(brand._id)}
                        className="rounded bg-green-600 p-1 font-mono"
                      >
                        Restore
                      </button>
                    ) : (
                      <i
                        className="fas fa-trash-alt"
                        onClick={() => handleDelete(brand._id)}
                      ></i>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td className="p-2 font-bold">NO brands were added yet!</td>
              </tr>
            )}
          </tbody>
        </table>
        <ReactPaginate
          className="flex justify-center border-gray-700 items-center  space-x-2 mt-4"
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
          pageLinkClassName="px-4 py-2 border border-gray-400 rounded-md text-sm  transition duration-200"
          previousClassName="flex items-center"
          previousLinkClassName="px-4 py-2 border rounded-md text-sm hover:bg-gray-200 transition duration-200"
          nextClassName="flex items-center"
          nextLinkClassName="px-4 py-2 border rounded-md text-sm hover:bg-gray-200 transition duration-200"
          activeClassName="bg-blue-500 text-white "
        />
      </div>
      <div className="bg-gray-200 p-4 mt-8 rounded shadow-md text-black">
        <h2 className="text-xl font-bold mb-4">Add New Brand</h2>
        <form className="flex flex-col space-y-6">
          <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-6 lg:space-y-0">
            <div className="flex flex-col">
              <label className="mr-2 font-semibold">Brand Name</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Brand name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setMessage({ ...message, name: "" });
                }}
              />
              {message.name && (
                <span className="text-red-600 text-sm">{message.name}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="mr-2 font-semibold">Brand Description</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Brand description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setMessage({ ...message, description: "" });
                }}
              />
            </div>
            <div className="flex flex-col">
              <label className="mr-2 font-semibold">Brand Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleProductImageChange(e);
                  handleImageChange(e);
                }}
              />
              {message.image && (
                <span className="text-red-600 text-sm">{message.image}</span>
              )}
            </div>
          </div>
          {brandImage && (
            <img
              src={brandImage}
              alt="brand"
              className="h-32 w-32 object-cover rounded-md"
            />
          )}
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
            onClick={handleAddBrand}
          >
            Add Brand
          </button>
        </form>
      </div>
    </main>
  );
};

export default Brand;
