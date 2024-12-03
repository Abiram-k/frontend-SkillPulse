import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const pathnames = pathname
    .split("/")
    .filter((x) => x && x != "user" && !/[0-9]/.test(x));
  let breadcrumbPath = "";
  if (
    pathname === "/user/home" ||
    pathname.includes("admin") ||
    pathname.includes("login") ||
    pathname.includes("signup") ||
    pathname.includes("forgotPassword") ||
    pathname.includes("verifyEmail") ||
    pathname.includes("profile") ||
    pathname.includes("otp") ||
    pathname.includes("offline")
  ) {
    return null;
  }
  return (
    <div className="breadcrumbs mt-16 lg:mt-20 ms-5 z-30 absolute text-white font-semibold ">
      {pathnames.length > 0 && (
        <Link to="/user/home" className="border-b- border-orange-500">
          Home
        </Link>
      )}
      {pathnames.map((name, index) => {
        breadcrumbPath += `/${name}`;
        const isLast = index === pathnames.length - 1;
        return isLast ? (
          <span className="text-gray-400" key={breadcrumbPath}>
            {" "}
            {"> " + name}
          </span>
        ) : (
          <span key={breadcrumbPath}>
            /<Link to={breadcrumbPath}>{name}</Link>
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
