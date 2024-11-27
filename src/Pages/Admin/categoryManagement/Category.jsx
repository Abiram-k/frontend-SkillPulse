import React, { useEffect } from "react";
import { useState } from "react";
import axios from "@/axiosIntercepters/AxiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { context } from "../../../Components/Provider";
import { useContext } from "react";
import { Toast } from "../../../Components/Toast";
import { logoutAdmin } from "@/redux/adminSlice";
import { useDispatch } from "react-redux";
const Category = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [offer, setOffer] = useState("");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState({});
  const [categoryImage, setCategoryImage] = useState("");
  const [image, setImage] = useState(null);
  const [spinner, setSpinner] = useState(false);
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
        setCategoryImage(reader.result);
      };
      reader.readAsDataURL(imageFile);
    }
  };

  useEffect(() => {
    (async () => {
      await axios
        .get("/admin/category")
        .then((response) => {
          setCategories(response.data.categories);
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
  }, [categories]);

  const handleAddCategory = async (e) => {
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
      if (Object.keys(formError).length == 0) {
        setSpinner(true);

        const response = await axios.post("/admin/category", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSpinner(false);
        navigate("/admin/category");
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
    const result = confirm("Are you sure to restore categorie");
    try {
      if (result) {
        const response = await axios.patch(`/admin/categoryRestore/${id}`);
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.response?.data.message);
    }
  };
  const handleDelete = async (id) => {
    const result = confirm("Are you sure to delete categorie");
    // alert(result);
    try {
      if (result) {
        const response = await axios.delete(`/admin/category/${id}`);
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
      const response = await axios.patch(`/admin/categoryListing/${id}`);
      if (response.data.category.isListed) {
        Swal.fire({
          title: "Listed",
          text: `${response.data.category.name}
            "Listed successfully`,
          icon: "sucess",
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
    <main className="w-4/5 p-8 font-mono">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="bg-gray-200 p-4 rounded-lg shadow-md text-black h-80 overflow-y-scroll">
        <table className="w-full text-left ">
          <thead className="">
            <tr className="bg-orange-500 ">
              <th className="p-2">S.No</th>
              <th className="p-2">Category Name</th>
              <th className="p-2">Description</th>
              <th className="p-2">image</th>
              <th className="p-2">List / Unlist</th>
            </tr>
          </thead>
          <tbody className="">
            {categories?.length > 0 ? (
              categories.map((category, index) => (
                <tr className="border-t" key={category._id}>
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
                    {category.description}
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
                      <button
                        onClick={() => handleRestore(category._id)}
                        className="rounded bg-green-600 p-1 font-mono"
                      >
                        Restore
                      </button>
                    ) : (
                      <i
                        className="fas fa-trash-alt"
                        onClick={() => handleDelete(category._id)}
                      ></i>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td className="p-2 font-bold  ">
                  NO categorie were added Yet!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-200 p-4 mt-8 rounded-lg shadow-md text-black">
        <h2 className="text-xl font-bold mb-4">Add New Category</h2>
        <form className="flex flex-col space-y-6">
          <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-6 lg:space-y-0">
            
            <div className="flex flex-col">
              <label className="mr-2 font-mono">Name :</label>
              <input
                type="text"
                className="border-2 border-gray-400 p-2 rounded-lg font-mono"
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
                className="border-2 border-gray-400 p-2 rounded-lg font-mono"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Improved Image Upload Area */}
          <div className="border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center">
            <label htmlFor="fileInputone" className="cursor-pointer group">
              <div className="relative w-32 h-32 mb-4 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center hover:bg-gray-100 group-hover:border-blue-500 transition-all">
                <img
                  src={categoryImage || "https://placehold.co/100x100"}
                  alt="product image"
                  className={`object-cover w-full h-full rounded-lg ${
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
              className="bg-green-500 text-white p-3 rounded-lg font-mono w-32 hover:bg-green-600 transition-all"
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
