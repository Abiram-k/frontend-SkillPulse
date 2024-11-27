import React from "react";

function Pagination({ totalPosts, postsPerPage, setCurrentPage, currentPage }) {
  let pages = [];
  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pages.push(i);
  }
  return (
    <div className="flex justify-center mt-4 mb-5">
      {pages.length > 0
        ? pages.map((page, index) => (
            <button
              className={
                currentPage == page
                  ? "px-4 py-1 border-2 border-orange-500 mr-1 rounded"
                  : "px-4 py-1 border border-gray-500 mr-1  rounded"
              }
              key={index}
              onClick={() => setCurrentPage(page)} // Wrap it in an arrow function
            >
              {page}
            </button>
          ))
        : ""}
    </div>
  );
}

export default Pagination;

// const lastPostIndex = currentPage * postPerPage;
// const firstPostIndex = lastPostIndex - postPerPage;
// const currentUsers = users.slice(firstPostIndex, lastPostIndex);

// const [currentPage, setCurrentPage] = useState(1);
// const [postPerPage, setPostPerPage] = useState(5);

{/* <Pagination
totalPosts={users.length}
postsPerPage={postPerPage}
setCurrentPage={setCurrentPage}
currentPage={currentPage}
/> */}