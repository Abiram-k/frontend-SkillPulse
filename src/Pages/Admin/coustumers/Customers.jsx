import React, { useEffect, useRef, useState } from "react";
import axios from "@/axiosIntercepters/AxiosInstance";
import Pagination from "../../../Components/Pagination";
import { User } from "lucide-react";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "@/redux/adminSlice";
import { showToast } from "@/Components/ToastNotification";

const Customers = () => {
  const [users, setUsers] = useState([]);
  const searchFocus = useRef(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(5);
  const [slno, setSlNo] = useState(0);
  const [filterUser, setFilterUser] = useState("All");
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `/admin/customers?filter=${filterUser}`
        );
        console.log(response.data.users);
        setUsers(response.data.users);
      } catch (error) {
        if (
          error?.response.data.message == "Token not found" ||
          error?.response.data.message == "Failed to authenticate Admin"
        ) {
          dispatch(logoutAdmin());
        }
        console.log(error);
      }
    })();
    searchFocus.current.focus();
  }, [filterUser]);

  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const currentUsers = users.slice(firstPostIndex, lastPostIndex);

  const handleblocking = async (id) => {
    try {
      const response = await axios.get(`/admin/block/${id}`);
      if (response.data.user.isBlocked) {
        Swal.fire({
          title: "Blocked",
          text: `${response.data.name}
          "Blocked successfully`,
          icon: "success",
          confirmButtonText: "Done",
        });
      } else {
        Swal.fire({
          title: "Unblocked",
          text: `${response.data.name}
            "Unblocked successfully`,
          icon: "success",
          confirmButtonText: "Done",
        });
      }
      const updatedUser = response.data.user;
      //to change particular user object after block or unbloking
      setUsers((prevUser) =>
        prevUser.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        )
      );
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };
  return (
    <div className="flex bg-white text-black h-4/5">
      <div className="flex-1">
        <div className="p-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="px-4 font-semi-bold lg:text-lg">Coustomers</h1>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="border rounded px-4 py-2 w-full lg:w-auto"
              value={search}
              ref={searchFocus}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="font-mono">
              <label htmlFor="order" className="mr-2">
                Sort By
              </label>

              <select
                id="order"
                className="border rounded p-1"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              >
                <option value="">All Costumers</option>
                <option value="Recently added">Recently added</option>
                <option value="A-Z">A-Z</option>
                <option value="Z-A">Z-A</option>
              </select>
            </div>
            
          </div>
          <div className="table-container  p-5 rounded ">
            <table className="w-full table-auto ">
              <thead>
                <tr>
                  <th className="bg-orange-500 text-white p-2">S.No</th>
                  <th className="bg-orange-500 text-white p-2">profile</th>
                  <th className="bg-orange-500 text-white p-2">Name</th>
                  <th className="bg-orange-500 text-white p-2">Email</th>
                  <th className="bg-orange-500 text-white p-2">Mobile</th>
                  <th className="bg-orange-500 text-white p-2">
                    Block/Unblock
                  </th>
                </tr>
              </thead>
              <tbody className="font-sans">
                {currentUsers.length > 0 ? (
                  currentUsers.filter(
                    (filuser) =>
                      search.length === 0 || //if search.length !== 0 second will execute
                      (filuser.email &&
                        filuser.email
                          .toLowerCase()
                          .startsWith(search.toLowerCase()))
                  ).length > 0 ? (
                    currentUsers
                      .filter(
                        (filuser) =>
                          search.length === 0 ||
                          (filuser.email &&
                            filuser.email
                              .toLowerCase()
                              .startsWith(search.toLowerCase()))
                      )
                      .map((user, index) => (
                        <tr
                          className="bg-white text-center border-b-2 border-gray-200"
                          key={user._id}
                        >
                          <td className="p-2">{index + 1}</td>
                          <td className="p-2 flex justify-center align-middle">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.firstName + "photo"}
                                className="w-12 h-12 object-cover mx-auto rounded-full"
                              />
                            ) : (
                              <User className="text-center w-8 h-8 text-gray-800 bg-gray-300 rounded-full p-1" />
                            )}
                          </td>
                          <td className="p-2">{user.firstName}</td>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">{user.mobileNumber}</td>
                          <td className="p-2">
                            <button
                              className={
                                user.isBlocked
                                  ? "bg-blue-600 hover:bg-blue-700 lg:p-2 p-1 rounded w-17"
                                  : "bg-red-600 hover:bg-red-700 lg:p-2 p-1 rounded w-22"
                              }
                              onClick={() => handleblocking(user._id)}
                            >
                              {user.isBlocked ? "Unblock" : "Block"}
                            </button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="hover:bg-gray-300 bg-white text-center font-semibold"
                      >
                        No customers were founded !
                      </td>
                    </tr>
                  )
                ) : (
                  <tr className="text-center">
                    <td
                      colSpan="6"
                      className="hover:bg-gray-300 bg-white text-center font-semibold"
                    >
                      No users were added yet !
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination
              totalPosts={users.length}
              postsPerPage={postPerPage}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
