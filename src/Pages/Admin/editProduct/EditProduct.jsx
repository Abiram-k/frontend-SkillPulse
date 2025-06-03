import React, { useContext, useEffect, useState } from "react";
import { Toast } from "../../../Components/Toast";
import axios from "@/axiosIntercepters/AxiosInstance";
import { context } from "../../../Components/Provider";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";

const EditProduct = () => {
  const [id, setId] = useState("");
  const [message, setMessage] = useState({});
  const [spinner, setSpinner] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [units, setUnits] = useState("");
  const [productImage, setProductImage] = useState([]);
  const [images, setImages] = useState({
    image1: "",
    image2: "",
    image3: "",
  });

  // For cropping
  const [cropping, setCropping] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [croppedArea, setCroppedArea] = useState(null);
  const [cropSettings, setCropSettings] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const navigate = useNavigate();
  const { data } = useContext(context);
  useEffect(() => {
    if (data && Object.keys(data).length === 0) {
      navigate("/admin/products");
    }
    setId(data?._id || "");
    setName(data?.productName || "");
    setCategory(data?.category?.name || "Not fetched");
    setDescription(data?.productDescription || "");
    setRegularPrice(data?.regularPrice || "");
    setSalesPrice(data?.salesPrice || "");
    setBrand(data?.brand?.name || "not fetched");
    setUnits(data?.units || "");
    setProductImage(data?.productImage || []);
    setOfferPrice(data?.offer);
  }, [data]);

  const error = {};
  const validateForm = () => {
    const salesPriceInt = Number(salesPrice);
    const regularPriceInt = Number(regularPrice);
    const unitsInt = Number(units);
    if (name.trim() === "") error.name = "Name is required *";
    if (category.trim() === "") error.category = "Category is required *";
    if (description.trim() === "")
      error.description = "description is required *";
    if (String(regularPrice)?.trim() === "")
      error.regularPrice = "regularPrice is required *";
    else if (isNaN(regularPriceInt))
      error.regularPrice = "regular price must a number";

    if (isNaN(offerPrice)) error.offerPrice = "offerPrice price must a number";
    else if (offerPrice < 0 || offerPrice > 100)
      error.offerPrice = "offerPrice must between 0% and 100%";

    if (brand.trim() === "") error.brand = "brand is required *";
    if (String(units).trim() === "") error.units = "units is required *";
    else if (isNaN(unitsInt)) error.units = "Units  must a number";

    if (Object.values(productImage).some((value) => !value)) {
      error.image = "Upload at least three images *";
    }
    return error;
  };

  const handleImageChange = (e, field) => {
    const imageFile = e.target.files[0];
    if (imageFile) {
      const imageUrl = URL.createObjectURL(imageFile);
      setCurrentImage({ url: imageUrl, field });
      setCropping(true); // Open cropping modal at the bottom
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  };

  const handleSaveCroppedImage = async (e) => {
    e.preventDefault();
    const croppedImage = await getCroppedImg(currentImage.url, croppedArea);

    // Create a URL for the cropped image if it's a blob
    const imageUrl = URL.createObjectURL(croppedImage);

    const field = currentImage.field;
    setImages((prevImages) => ({ ...prevImages, [field]: imageUrl })); // Update preview

    setProductImage((prevImages) => {
      const fieldIndex = field === "image1" ? 0 : field === "image2" ? 1 : 2;
      const updatedImages = [...prevImages];
      updatedImages[fieldIndex] = croppedImage;
      return updatedImages;
    });

    // Close cropping modal and reset currentImage
    setCropping(false);
    setCurrentImage(null);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setMessage(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    const formData = new FormData();
    formData.append("productName", name);
    formData.append("productDescription", description);
    formData.append("category", category);
    formData.append("offer", offerPrice);
    formData.append("regularPrice", regularPrice);
    formData.append("brand", brand);
    formData.append("units", units);
    Object.values(productImage).forEach((image, index) => {
      if (image) formData.append("file", image);
    });
    try {
      if (Object.keys(formErrors).length === 0) {
        setSpinner(true);
        const response = await axios.put(`/admin/product/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSpinner(false);
        Toast.fire({
          icon: "success",
          title: `${response.data.message}`,
        });
        navigate("/admin/products");
      }
    } catch (error) {
      console.error(error);
      setSpinner(false);
      Toast.fire({
        icon: "error",
        title: `${error.response?.data.message} `,
      });
    }
  };

  return (
    <form className="bg-gray-200 text-black p-8 shadow-md rounded font-sans">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="flex items-center">
            Name:
            <input
              type="text"
              className="ml-2 p-2 border rounded w-full focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          {message.name && <p className="text-red-600">{message.name}</p>}
        </div>
        <div>
          <label className="flex items-center">
            Category:
            <input
              type="text"
              className="ml-2 p-2 border rounded w-full focus:outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>
          {message.category && (
            <p className="text-red-600">{message.category}</p>
          )}
        </div>
        <div>
          <label className="flex items-center col-span-2">
            Description:
            <input
              type="text"
              className="ml-2 p-2 border rounded w-full focus:outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          {message.description && (
            <p className="text-red-600">{message.description}</p>
          )}
        </div>
        <div>
          <label className="flex items-center">
            Brand:
            <input
              type="text"
              className="ml-2 p-2 border rounded w-full focus:outline-none"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </label>
          {message.brand && <p className="text-red-600">{message.brand}</p>}
        </div>
        <div>
          <label className="flex items-center">
            Regular Price :
            <input
              type="text"
              className="ml-2 p-2 border rounded w-full focus:outline-none"
              value={regularPrice}
              onChange={(e) => setRegularPrice(e.target.value)}
            />
          </label>
          {message.regularPrice && (
            <p className="text-red-600">{message.regularPrice}</p>
          )}
        </div>
        <div>
          <label className="flex items-center">
            Discount offer:
            <input
              type="text"
              className="ml-2 p-2 border rounded w-full focus:outline-none"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
            />
          </label>
          {message.offerPrice && (
            <p className="text-red-600">{message.offerPrice}</p>
          )}
        </div>
        <div>
          <label className="flex items-center">
            Units:
            <input
              type="text"
              className="ml-2 p-2 border rounded w-full focus:outline-none"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
            />
          </label>
          {message.units && <p className="text-red-600">{message.units}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Upload Images :</label>
        <div className="grid grid-cols-3 gap-4">
          {["image1", "image2", "image3"].map((field, index) => (
            <div
              key={field}
              className="border rounded p-4 flex flex-col items-center"
            >
              <label htmlFor={`fileInput${index}`}>
                <img
                  src={
                    images[field] ||
                    productImage[index] ||
                    "https://placehold.co/100x100"
                  }
                  alt="product image"
                  className="mb-2"
                />
              </label>
              <input
                id={`fileInput${index}`}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, field)}
                style={{ display: "none" }}
              />
              <p className="bg-gray-200 p-2 rounded">Change image</p>
            </div>
          ))}
        </div>
        {message.image && (
          <p className="text-red-600 text-center">{message.image}</p>
        )}
      </div>

      {cropping && (
        <div
          className="mt-4 crop-container"
          style={{
            width: "100%",
            height: "auto",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ width: "100%", height: "400px", position: "relative" }}>
            <Cropper
              image={currentImage.url}
              crop={cropSettings}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCropSettings}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex justify-center mt-4">
            <button
              className="mr-2 bg-blue-500 text-white p-2 rounded"
              onClick={handleSaveCroppedImage}
            >
              Save Cropped Image
            </button>
            <button
              className="bg-gray-500 text-white p-2 rounded"
              onClick={() => setCropping(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <button
        className="bg-green-500 text-white p-4 rounded w-full flex justify-center"
        type="submit"
        onClick={handleEditProduct}
      >
        {spinner ? "Adding Product ..." : "Submit"}
      </button>
    </form>
  );
};

export default EditProduct;
