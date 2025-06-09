import React, { useEffect, useRef, useState } from "react";
import axios from "@/axiosIntercepters/AxiosInstance";
import Pagination from "../../../Components/Pagination";
import { Calendar, Search, User } from "lucide-react";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "@/redux/adminSlice";
import { showToast } from "@/Components/ToastNotification";
import ReactPaginate from "react-paginate";

const Customers = () => {
  const [users, setUsers] = useState([]);
  const searchFocus = useRef(null);
  const [search, setSearch] = useState("");
  // const [currentPage, setCurrentPage] = useState(1);
  // const [postPerPage, setPostPerPage] = useState(5);
  const [slno, setSlNo] = useState(0);
  const [filterUser, setFilterUser] = useState("All");
  const [spinner, setSpinner] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const currentPage = useRef();
  const [pageCount, setPageCount] = useState(1);
  const [postPerPage, setPostPerPage] = useState(10);

  const handlePageClick = async (e) => {
    currentPage.current = e.selected + 1;
    fetchCustomers();
  };

  const dispatch = useDispatch();

  const fetchCustomers = async () => {
    try {
      setSpinner(true);
      const response = await axios.get(
        `/admin/customers?sort=${filterUser}&startDate=${startDate}&endDate=${endDate}&search=${search}&page=${currentPage.current}&limit=${postPerPage}`
      );
      setSpinner(false);
      setUsers(response.data.users);
      setPageCount(response.data?.pageCount);
    } catch (error) {
      setSpinner(false);
      if (
        error?.response.data.message == "Token not found" ||
        error?.response.data.message == "Failed to authenticate Admin"
      ) {
        dispatch(logoutAdmin());
      }
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    searchFocus?.current.focus();
  }, [filterUser, endDate, startDate, search]);

  // const lastPostIndex = currentPage * postPerPage;
  // const firstPostIndex = lastPostIndex - postPerPage;
  // const currentUsers = users.slice(firstPostIndex, lastPostIndex);

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
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="flex-1">
        <div className="p-8">
          <div className="flex justify-between items-center mb-4">
            <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm font-sans">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={search}
                    ref={searchFocus}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

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
                <option value="oldest">Oldest</option>
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
                {users.length > 0 ? (
                  users.map((user, index) => (
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
                  // ) : (
                  //   <tr>
                  //     <td
                  //       colSpan="6"
                  //       className="hover:bg-gray-300 bg-white text-center font-semibold"
                  //     >
                  //       No customers were founded !
                  //     </td>
                  //   </tr>
                  // )
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
            {/* <Pagination
              totalPosts={users.length}
              postsPerPage={postPerPage}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            /> */}
            <ReactPaginate
              className="flex justify-center font-mono border-gray-700 items-center space-x-2 mt-4"
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
        </div>
      </div>
    </div>
  );
};

export default Customers;
