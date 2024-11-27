import React, { useEffect } from "react";
import { useState } from "react";
import axios from "@/axiosIntercepters/AxiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { context } from "../../../Components/Provider";
import { useContext } from "react";
import { Toast } from "../../../Components/Toast";
import { logoutAdmin } from "@/redux/adminSlice";
import { useDispatch } from "react-redux";

const Brand = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brands, setBrands] = useState([]);
  const [message, setMessage] = useState({});
  const [brandImage, setBrandImage] = useState("");
  const [image, setImage] = useState(null);
  const [spinner, setSpinner] = useState(false);
  const { setData } = useContext(context);
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
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandImage(reader.result);
      };
      reader.readAsDataURL(imageFile);
    }
  };

  useEffect(() => {
    (async () => {
      await axios
        .get("/admin/brand")
        .then((response) => {
          setBrands(response.data.brands);
        })
        .catch((error) => {
          if (
            error?.response.data.message == "Token not found" ||
            error?.response.data.message == "Failed to authenticate Admin"
          ) {
            dispatch(logoutAdmin());
          }
          console.log(error);
          alert(error?.response.data.message);
        });
    })();
  }, [brands]);

  const handleAddBrand = async (e) => {
    e.preventDefault();
    const formError = validateForm();
    if (Object.keys(formError).length > 0) {
      setMessage(formError);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("file", image);
    try {
      if (Object.keys(formError).length === 0) {
        setSpinner(true);
        const response = await axios.post(
          "admin/brand",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            }
          }
        );
        setSpinner(false);
        navigate("/admin/brand");
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
        const response = await axios.patch(
          `/admin/brandRestore/${id}`,
        );
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.response?.data.message);
    }
  };

  const handleDelete = async (id) => {
    const result = confirm("Are you sure to delete brand");
    try {
      if (result) {
        const response = await axios.delete(
          `/admin/brand/${id}`
                  );
        Toast.fire({
          icon: "success",
          title: `${response.data.message}`,
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
        title: `${response.data.message}`,
      });
    }
  };

  const handleListing = async (id) => {
    try {
      const response = await axios.patch(
        `/admin/brandListing/${id}`
      );
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
    <main className="w-4/5 p-8 font-mono">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="bg-gray-200 p-4 rounded-lg shadow-md text-black h-80 overflow-y-scroll">
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
      </div>
      <div className="bg-gray-200 p-4 mt-8 rounded-lg shadow-md text-black">
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
