import React, { useState, useCallback, useEffect } from "react";
import { useAsyncError, useNavigate } from "react-router-dom";
import { Toast } from "../../../Components/Toast";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";
import axios from "@/axiosIntercepters/AxiosInstance";

const AddProduct = () => {
  const [message, setMessage] = useState({});
  const [spinner, setSpinner] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [brands, setBrands] = useState([]);

  const [units, setUnits] = useState("");
  const [categories, setCategories] = useState([]);
  const [offerPrice, setOfferPrice] = useState("0");

  const [productImage, setProductImage] = useState([]); // Array of images to send to backend
  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
  });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [image, setImage] = useState(null); // Image for cropping
  const [currentField, setCurrentField] = useState(""); // Track which image is being cropped
  const navigate = useNavigate();

  const error = {};
  const validateForm = () => {
    const salesPriceInt = Number(salesPrice);
    const regularPriceInt = Number(regularPrice);
    const unitsInt = Number(units);
    if (name.trim() === "") error.name = "Name is required *";
    if (category.trim() === "") error.category = "Category is required *";
    if (description.trim() === "")
      error.description = "description is required *";
    if (regularPrice.trim() === "")
      error.regularPrice = "regularPrice is required *";
    else if (isNaN(regularPriceInt))
      error.regularPrice = "regular price must a number";

    if (isNaN(offerPrice)) error.offerPrice = "offerPrice price must a number";
    else if (offerPrice < 0 || offerPrice > 99)
      error.offerPrice = "offerPrice must between 0% and 99%";

    if (brand.trim() === "") error.brand = "brand is required *";
    if (units.trim() === "") error.units = "units is required *";
    else if (isNaN(unitsInt)) error.units = "Units  must a number";

    if (Object.values(images).some((value) => !value)) {
      error.image = "Upload at least three images *";
    }

    return error;
  };
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get("/admin/category");
        setCategories(response?.data?.categories);
      } catch (err) {
        alert(err?.response?.data?.message);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get("/admin/brand");
        setBrands(response?.data?.brands);
      } catch (err) {
        alert(err?.response?.data?.message);
      }
    })();
  }, []);
  // Handle image file change and set image for cropping
  const handleImageChange = (e, field) => {
    const imageFile = e.target.files[0];
    setMessage({});
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 1 * 1024 * 1024;
    if (
      imageFile &&
      allowedTypes.includes(imageFile.type) &&
      imageFile.size <= maxSize
    ) {
      setCurrentField(field); // Track which image field is being edited
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Set image to be cropped
      };
      reader.readAsDataURL(imageFile);
    } else {
      setMessage({
        image: "Please upload a JPEG, JPG, or PNG file under 1MB.",
      });
      setImage((prevImages) => ({ ...prevImages, [field]: null }));
    }
  };
  // Set cropped area after cropping completes
  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Save the cropped image and update the state for display
  const saveCroppedImage = async (e) => {
    e.preventDefault(); // Prevent the default behavior to avoid page reload
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      const croppedFile = new File([croppedImage], `${currentField}.jpg`, {
        type: "image/jpeg",
      });

      // Revoke previous object URL to prevent memory leaks
      if (images[currentField]) {
        URL.revokeObjectURL(images[currentField]);
      }

      // Update the image preview for the specific field
      setImages((prevImages) => ({
        ...prevImages,
        [currentField]: URL.createObjectURL(croppedFile), // Preview the cropped image
      }));

      // Update the productImage array with the cropped file to send to backend
      setProductImage((prevImages) => {
        const updatedImages = [...prevImages];
        const imageIndex = updatedImages.findIndex(
          (img) => img.field === currentField
        );

        if (imageIndex > -1) {
          updatedImages[imageIndex] = {
            file: croppedFile,
            field: currentField,
          };
        } else {
          updatedImages.push({ file: croppedFile, field: currentField });
        }

        return updatedImages;
      });

      setImage(null); // Clear the crop modal after cropping is done
    } catch (error) {
      console.error(error);
    }
  };

  // Handle adding the product with images
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setImage(null);
    setMessage(formErrors);
    const formData = new FormData();
    formData.append("productName", name);
    formData.append("productDescription", description);
    formData.append("category", category);
    formData.append("offer", offerPrice);
    formData.append("regularPrice", regularPrice);
    formData.append("brand", brand);
    formData.append("units", units); // Add product details like name, price, etc.

    productImage.forEach((image, index) => {
      formData.append("file", image?.file); // Append cropped images to formData
    });

    try {
      if (Object.keys(formErrors).length === 0) {
        setSpinner(true);

        const response = await axios.post("/admin/product", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSpinner(false);

        Toast.fire({ icon: "success", title: `${response.data.message}` });
        navigate("/admin/products");
      }
    } catch (error) {
      setSpinner(false);

      Toast.fire({ icon: "error", title: `${error.response?.data.message}` });
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
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          {message.name && <p className="text-red-600">{message.name}</p>}
        </div>

        <div>
          <label className="flex items-center">
            Category:
            <select
              className="ml-2 p-2 border rounded w-full focus:outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="">No category were added</option>
              )}
            </select>
          </label>
          {message.category && (
            <p className="text-red-600">{message.category}</p>
          )}
        </div>
        <div>
          <label className="flex items-center">
            Brand:
            <select
              className="ml-2 p-2 border rounded w-full focus:outline-none"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="" disabled>
                Select Brand
              </option>
              {brands.length > 0 ? (
                brands.map((brand) => (
                  <>
                    <option key={brand._id} value={brand.name}>
                      {brand.name}
                    </option>
                  </>
                ))
              ) : (
                <option value="">No Brands were added</option>
              )}
            </select>
          </label>
          {message.brand && <p className="text-red-600">{message.brand}</p>}
        </div>
        <div>
          <label className="flex items-center col-span-2">
            Description:
            <input
              type="text"
              className="ml-2 p-2 border rounded w-full focus:outline-none"
              placeholder="Enter description"
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
            Regular Price :
            <input
              type="text"
              className="ml-2 p-2 border rounded w-full focus:outline-none"
              placeholder="Enter regular price"
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
              placeholder="Enter discount percentage"
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
              placeholder="Enter units "
              value={units}
              onChange={(e) => setUnits(e.target.value)}
            />
          </label>
          {message.units && <p className="text-red-600">{message.units}</p>}
        </div>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Upload Images :</label>
        <div className="grid grid-cols-4 gap-4">
          {["image1", "image2", "image3", "image4"].map((field, index) => (
            <div
              key={index}
              className="border rounded p-4 flex flex-col items-center"
            >
              <label htmlFor={`fileInput${index}`}>
                <img
                  src={images[field] || "https://placehold.co/100x100"}
                  alt="product"
                  className="mb-2"
                  style={{ maxWidth: "100%", height: "auto" }} // Dynamically sized cropped image
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
          {message.image && (
            <p className="text-red-600 text-center">{message.image}</p>
          )}
        </div>
      </div>

      {image &&
        message.image !=
          "Please upload a JPEG, JPG, or PNG file under 1MB." && (
          <div className="modal">
            <div className="modal-content">
              <h3>Crop Image</h3>
              <div
                className="crop-container"
                style={{ width: "100%", height: "400px", position: "relative" }}
              >
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={2 / 3}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <button
                onClick={saveCroppedImage}
                className="mt-4 rounded bg-red-800 text-white p-3 ms-3 mb-5 "
              >
                Save Cropped Image
              </button>
            </div>
          </div>
        )}
      <button
        className="bg-green-500 text-white p-4 rounded w-full flex justify-center"
        type="submit"
        onClick={handleAddProduct}
      >
        {spinner ? "Adding Product ..." : "Submit"}
      </button>
    </form>
  );
};

export default AddProduct;
