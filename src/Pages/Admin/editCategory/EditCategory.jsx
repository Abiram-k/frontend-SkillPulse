import React, { useState } from "react";
import axios from "@/axiosIntercepters/AxiosInstance";
import { useContext, useEffect } from "react";
import { context } from "../../../Components/Provider";
import { useNavigate } from "react-router-dom";
import { Toast } from "../../../Components/Toast";
function EditCategory() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [id, setId] = useState("");
  const [offer, setOffer] = useState(0);
  const [message, setMessage] = useState({});
  const [existingImage, setExistingImage] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [image, setImage] = useState(null);
  const [spinner, setSpinner] = useState(false);
  const [maxDiscount, setMaxDiscount] = useState("");

  const { data } = useContext(context); //to field data by default

  const error = {};
  const validateForm = () => {
    if (name.trim() === "") error.name = "Category name is required *";

    if ((maxDiscount == 0 || !maxDiscount) && Number(offer) !== 0)
      error.maxDiscount = "Max discount is required *";

    if (isNaN(offer)) error.offer = "offer price must a number";
    else if (offer < 0 || offer > 99)
      error.offer = "offer must between 0% and 99%";
    return error;
  };

  const navigate = useNavigate();
  useEffect(() => {
    if (!Object.keys(data).length) {
      navigate("/admin/category");
      return;
    }
    if (data) {
      setName(data.name || "");
      setDescription(data.description || "");
      setId(data._id || "");
      setExistingImage(data.image);
      setOffer(data.offer);
      setMaxDiscount(data?.maxDiscount || 0);
    }
  }, [data]);

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

  const handleEditCategory = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    console.log("Form errors: ", formErrors);
    if (Object.keys(formErrors).length > 0) {
      setMessage(formErrors);
      return;
    }
    setSpinner(true);
    const formData = new FormData();
    formData.append("id", id);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("offer", offer);
    formData.append("file", image);
    formData.append("maxDiscount", maxDiscount);
    try {
      const response = await axios.put("/admin/category", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSpinner(false);
      Toast.fire({
        icon: "success",
        title: `${response.data.message}`,
      });

      navigate("/admin/category");
    } catch (error) {
      console.log(error?.response?.data?.message);
      setSpinner(false);
      Toast.fire({
        icon: "error",
        title: `${error?.response?.data?.message}`,
      });
    }
  };

  return (
    <div className="bg-gray-200 p-4 mt-8 rounded shadow-md text-black ">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <h2 className="text-xl font-bold mb-4">Edit Category</h2>
      <form
        className="flex items-center flex-col space-x-2 space-y-3  "
        onSubmit={handleEditCategory}
      >
        {/* <div className="flex flex-col">
          <div> */}

        <label className="mr-2">Name :</label>
        <input
          type="text"
          className="border-2 border-gray-400 p-2 rounded flex-grow font-mono"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {Number(offer) > 0 && (
          <>
            <label className="mr-2">Max Discount :</label>
            <input
              type="text"
              className="border-2 border-gray-400 p-2 rounded flex-grow font-mono"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
            />
            {message.maxDiscount && (
              <p className="text-red-700 text-sm">{message.maxDiscount}</p>
            )}
          </>
        )}
        <label className="mr-2">Offer :</label>
        <input
          type="number"
          className="border-2 border-gray-400 p-2 rounded flex-grow font-mono"
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
        />
        {message.offer && (
          <p className="text-red-700 text-sm">{message.offer}</p>
        )}
        <label className="mr-2">Description :</label>
        <input
          type="text"
          className="border-2 border-gray-400 p-2 rounded flex-grow w-1/2 focus:outline-none font-mono"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="border rounded p-4 flex flex-col items-center  justify-center">
          <label htmlFor="fileInputone" className="w-full flex justify-center">
            <img
              src={
                categoryImage || existingImage || "https://placehold.co/100x100"
              }
              alt="product image"
              className="mb-2 w-1/3 h-auto rounded"
            />
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
          <p className="bg-gray-200 p-2 rounded w-1/3 text-center">
            Change image
          </p>
        </div>
        {message.name && <p className="text-red-700 text-sm">{message.name}</p>}
        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded ml-4"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default EditCategory;
