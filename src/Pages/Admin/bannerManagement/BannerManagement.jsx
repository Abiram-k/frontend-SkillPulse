import React, { useEffect, useRef } from "react";
import { useState } from "react";
import axios from "@/axiosIntercepters/AxiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "../../../Components/Toast";
import { logoutAdmin } from "@/redux/adminSlice";
import { useDispatch } from "react-redux";
import { showToast } from "@/Components/ToastNotification";
import { Calendar, Search } from "lucide-react";
import ReactPaginate from "react-paginate";

const BannerManagement = () => {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [spinner, setSpinner] = useState(false);
  const [banner, setBanner] = useState([]);
  const [message, setMessage] = useState({});
  const [bannerImage, setBannerImage] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const searchFocus = useRef(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const currentPage = useRef();
  const [pageCount, setPageCount] = useState(1);
  const [postPerPage, setPostPerPage] = useState(5);

  const validateForm = () => {
    const error = {};
    if (!image) error.image = "Upload an image *";
    if (description.trim() === "")
      error.description = "Description is required *";
    if (description.length < 4)
      error.description = "Description must be at least 4 characters *";
    return error;
  };
  const handleBannerImageChange = (e) => {
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
      setBannerImage(reader.result);
    };
    reader.readAsDataURL(imageFile);
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

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
  const handlePageClick = async (e) => {
    currentPage.current = e.selected + 1;
    fetchCategories();
  };
  const fetchBanners = async () => {
    try {
      setSpinner(true);
      const response = await axios.get(
        `/admin/banner?search=${search}&page=${currentPage.current}&limit=${postPerPage}&startDate=${startDate}&endDate=${endDate}`
      );
      setBanner(response?.data.banner);
      setPageCount(response.data?.pageCount);
      setSpinner(false);
    } catch (error) {
      setSpinner(false);
      if (
        error?.response?.data.message === "Token not found" ||
        error?.response?.data.message === "Failed to authenticate Admin"
      ) {
        dispatch(logoutAdmin());
      }
      console.log(error);
      Toast.fire({
        icon: "error",
        title: `${error?.response?.data.message}`,
      });
    }
  };
  useEffect(() => {
    currentPage.current = 1;
    fetchBanners();
  }, [search, startDate, endDate]);

  const handleAddBanner = async (e) => {
    e.preventDefault();
    const formError = validateForm();
    if (Object.keys(formError).length > 0) {
      setMessage(formError);
      return;
    }
    const formData = new FormData();
    formData.append("description", description);
    formData.append("file", image);
    try {
      if (Object.keys(formError).length == 0) {
        setSpinner(true);
        const response = await axios.post("/admin/banner", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setDescription("");
        window.location.reload();
        setImage(null);
        setSpinner(false);
        showToast("success", `${response.data.message}`);
      }
    } catch (error) {
      setSpinner(false);
      showToast("error", `${error.response?.data.message}`);

      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const result = confirm("Are you sure to delete banner");
    try {
      if (result) {
        const response = await axios.delete(`/admin/banner/${id}`);
        showToast("success", `${response.data.message}`);
        window.location.reload();
      } else {
        showToast("info", "Cancelled Deletion");
      }
    } catch (error) {
      showToast("error", `${error.response?.data.message}`);
    }
  };
  const handleListing = async (id) => {
    try {
      const response = await axios.patch(`/admin/bannerListing/${id}`);
      if (response.data.banner?.isListed) {
        showToast("info", "Banner Listed successfully");
      } else {
        showToast("info", "Banner Unlisted successfully");
      }
      const updatedBanner = response.data.banner;

      setBanner((prevCat) =>
        prevCat.map((cate) =>
          cate._id == updatedBanner._id ? updatedBanner : cate
        )
      );
    } catch (error) {
      console.log(error);
      alert(error?.response?.data.message || "Error occured at line 182");
    }
  };

  return (
    <main className="w-4/5 p-8 font-mono">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto p-6  rounded-lg shadow-sm font-sans">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by description..."
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

      <div className="bg-gray-200 p-4 rounded shadow-md text-black h-80 overflow-y-scroll">
        <table className="w-full text-left ">
          <thead className="">
            <tr className="bg-orange-500 ">
              <th className="p-2">S.No</th>
              <th className="p-2">image</th>
              <th className="p-2">Banner Description</th>
              <th className="p-2">List / Unlist</th>
            </tr>
          </thead>
          <tbody className="">
            {banner?.length > 0 ? (
              banner.map((banner, index) => (
                <tr className="border-t" key={banner._id}>
                  <td className={"p-2"}>{index + 1}</td>

                  <td className="p-2">
                    <img
                      src={banner.image || "https://placehold.co/50x50"}
                      alt={banner.description}
                      className="w-12 h-12 object-cover mx-auto"
                    />
                  </td>
                  <td className={"p-2"}>{banner.description}</td>
                  <td className="p-2 flex items-center space-x-3 text-xl">
                    <button
                      className={
                        banner.isListed
                          ? "bg-red-600 hover:bg-red-700 lg:p-2 p-1 rounded w-22 w-1/2 font-mono"
                          : "bg-blue-600 hover:bg-blue-700 lg:p-2 p-1 rounded w-17 w-1/2 font-mono"
                      }
                      onClick={() => handleListing(banner._id)}
                    >
                      {banner.isListed ? "Unlist" : "List"}
                    </button>

                    <i
                      className="fas fa-trash-alt"
                      onClick={() => handleDelete(banner._id)}
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td className="p-2 font-bold  ">NO Banners were added Yet!</td>
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
        <h2 className="text-xl font-bold mb-4">Add New Banner</h2>
        <form className="flex flex-col space-y-6">
          <div className="flex flex-col">
            <label className="mr-2 font-mono">Description *:</label>
            <input
              type="text"
              className="border-2 border-gray-400 p-2 rounded font-mono"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {message.description && (
              <p className="text-red-700 text-sm">{message.description}</p>
            )}
          </div>

          <div className="border-2 border-gray-300 rounded p-4 flex flex-col items-center">
            <label htmlFor="fileInputone" className="cursor-pointer group">
              <div className="relative w-32 h-32 mb-4 border-2 border-dashed border-gray-300 rounded flex justify-center items-center hover:bg-gray-100 group-hover:border-blue-500 transition-all">
                <img
                  src={bannerImage || "https://placehold.co/100x100"}
                  alt="product image"
                  className={`object-cover w-full h-full rounded ${
                    !bannerImage ? "opacity-50" : ""
                  }`}
                />
                {!bannerImage && (
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
                handleBannerImageChange(e);
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
              onClick={handleAddBanner}
            >
              SAVE
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default BannerManagement;
