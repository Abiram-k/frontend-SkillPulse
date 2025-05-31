import Login from "./Pages/User/login/Login";
import React, { lazy, Suspense } from "react";
import Signup from "./Pages/User/signup/Signup";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Spinner from "./Components/Spinner";

import Otp from "./Pages/User/otp/Otp";
import LandingPage from "./Pages/User/landingpage/LandingPage";
import AdminLayout from "./Pages/Admin/adminLayout/AdminLayout";
import Provider from "./Components/Provider";
import ProtectedAuthAdmin from "./Protected/ProtectedAuthAdmin";
import ProtectedDashboardAdmin from "./Protected/ProtectedDashboard";
import ProtectedOtp from "./Protected/ProtectOtp";
import Breadcrumbs from "./Components/Breadcrumbs";
import GoogleAuthComponent from "./Pages/User/googleAuthComponent/GoogleAuthComponent";
import UserLayout from "./Pages/User/userLayout/UserLayout";
import ProtectUserHome from "./Protected/ProtectUserHome";
import ProtectAuthUser from "./Protected/ProtectAuthUser";
import AddAddress from "./Pages/User/manageAdress/AddAddress";
import EditAddress from "./Pages/User/manageAdress/EditAddress";
import ToastNotification from "./Components/ToastNotification";
import ForgotPassword from "./Pages/User/forgotPassword/ForgotPassword";
import EmailVerification from "./Pages/User/forgotPassword/EmailVerification";
import EditBrand from "./Pages/Admin/brandManagement/EditBrand";
import { Toaster } from "./Components/ui/toaster.jsx";
import ProtectCheckout from "./Protected/ProtectCheckout";
import ProtectedOrderDetails from "./Protected/ProtectedOrderDetails";
import InternetCheck from "./InternetCheck";
import OfflinePage from "./Pages/User/offlinePage/OfflinePage";
import ProtectedAdminOrder from "./Protected/ProtectedAdminOrder";
import AdminOrderDetail from "./Pages/Admin/orderManagement/AdminOrderDetailed";

const HomePage = lazy(() => import("./Pages/User/homPage/HomePage"));
const Dashboard = lazy(() => import("./Pages/Admin/dashboard/DashBoard"));
const AdminLogin = lazy(() => import("./Pages/Admin/login/AdminLogin"));
const Customers = lazy(() => import("./Pages/Admin/coustumers/Customers"));
const Products = lazy(() => import("./Pages/Admin/products/Products"));
const AddProduct = lazy(() => import("./Pages/Admin/addProduct/AddProduct"));
const Category = lazy(() =>
  import("./Pages/Admin/categoryManagement/Category")
);
const OrderTrackingPage = lazy(() =>
  import("./Pages/User/manageOrders/detailedPage")
);
const EditCategory = lazy(() =>
  import("./Pages/Admin/editCategory/EditCategory")
);
const EditProduct = lazy(() => import("./Pages/Admin/editProduct/EditProduct"));
const ProductDetails = lazy(() =>
  import("./Pages/User/productDetails/ProductDetails")
);
const AccountOverview = lazy(() =>
  import("./Pages/User/accountOverview/AccountOverview")
);
const Shop = lazy(() => import("./Pages/User/shop/Shop"));
const SearchProducts = lazy(() =>
  import("./Pages/User/searchProducts/SearchProducts")
);

const ManageAddress = lazy(() =>
  import("./Pages/User/manageAdress/ManageAddress")
);

const AccountLayout = lazy(() =>
  import("./Pages/User/accountLayout/AccountLayout")
);

const Wishlist = lazy(() => import("./Pages/User/wishlist/Wishlist"));
const ShoppingCartPage = lazy(() =>
  import("./Pages/User/cart/ShoppingCartPage")
);
const Checkout = lazy(() => import("./Pages/User/checkout/CheckOut"));
const ManageOrders = lazy(() =>
  import("./Pages/User/manageOrders/ManageOrders")
);
const OrderManagement = lazy(() =>
  import("./Pages/Admin/orderManagement/OrderManagement")
);
const Brand = lazy(() => import("./Pages/Admin/brandManagement/Brand"));
const Contact = lazy(() => import("./Pages/User/contact/Contact"));
const About = lazy(() => import("./Pages/User/about/About"));
const Wallet = lazy(() => import("./Pages/User/wallet/Wallet"));
const CouponManagement = lazy(() =>
  import("./Pages/Admin/couponManagment/CouponManagement")
);
const Coupon = lazy(() => import("./Pages/User/coupon/Coupon"));
const OrderReport = lazy(() => import("./Pages/Admin/SalesReport/OrderReport"));
const AddCoupon = lazy(() => import("./Pages/Admin/couponManagment/AddCoupon"));
const BannerManagement = lazy(() =>
  import("./Pages/Admin/bannerManagement/BannerManagement")
);
const RefundPage = lazy(() => import("./Pages/User/refundPage/RefundPage"));
const ReturnRequests = lazy(() =>
  import("./Pages/Admin/returnRequests/ReturnRequests")
);

function App() {
  return (
    <>
      <ToastNotification />
      <Router>
        <Breadcrumbs />
        <InternetCheck>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/offline" element={<OfflinePage />}></Route>
              <Route path="/googleRedirect" element={<GoogleAuthComponent />} />
              <Route
                path="/login"
                element={
                  <ProtectAuthUser>
                    <Login />
                  </ProtectAuthUser>
                }
              />
              <Route
                path="/signup"
                element={
                  <ProtectAuthUser>
                    <Signup />
                  </ProtectAuthUser>
                }
              />
              <Route
                path="/forgotPassword"
                element={
                  <ProtectAuthUser>
                    <ForgotPassword />
                  </ProtectAuthUser>
                }
              />
              <Route
                path="/verifyEmail"
                element={
                  <ProtectAuthUser>
                    <EmailVerification />
                  </ProtectAuthUser>
                }
              />
              <Route
                path="/otp"
                element={
                  <ProtectedOtp>
                    <ProtectAuthUser>
                      <Otp />
                    </ProtectAuthUser>
                  </ProtectedOtp>
                }
              />

              <Route
                path="/"
                element={
                  <ProtectAuthUser>
                    <LandingPage />
                  </ProtectAuthUser>
                }
              />
              <Route
                path="/user"
                element={
                  // <ProtectUserHome>
                    <UserLayout />
                  // </ProtectUserHome>
                }
              >
                <Route
                  path="home"
                  element={
                    <ProtectUserHome>
                      <Provider>
                        <HomePage />
                      </Provider>
                    </ProtectUserHome>
                  }
                />
                <Route
                  path="wishlist"
                  element={
                    <ProtectUserHome>
                      <Provider>
                        <Wishlist />
                      </Provider>
                    </ProtectUserHome>
                  }
                />
                <Route
                  path="cart"
                  element={
                    <ProtectUserHome>
                      <ShoppingCartPage />
                    </ProtectUserHome>
                  }
                />
                <Route
                  path="search"
                  element={
                    <ProtectUserHome>
                      <SearchProducts />
                    </ProtectUserHome>
                  }
                />

                <Route
                  path="shop"
                  element={
                    <ProtectUserHome>
                      <Shop />
                    </ProtectUserHome>
                  }
                />
                <Route
                  path="contact"
                  element={
                    <ProtectUserHome>
                      <Contact />
                    </ProtectUserHome>
                  }
                />
                <Route
                  path="coupon"
                  element={
                    <ProtectUserHome>
                      <Coupon />
                    </ProtectUserHome>
                  }
                />
                <Route
                  path="about"
                  element={
                    <ProtectUserHome>
                      <About />
                    </ProtectUserHome>
                  }
                />

                <Route
                  path="checkout"
                  element={
                    <ProtectUserHome>
                      <ProtectCheckout>
                        <Checkout />
                      </ProtectCheckout>
                    </ProtectUserHome>
                  }
                />

                <Route
                  path="cart/checkout"
                  element={
                    <ProtectUserHome>
                      <Checkout />
                    </ProtectUserHome>
                  }
                />

                <Route
                  path="productDetails"
                  element={
                    <Provider>
                      <ProductDetails />
                    </Provider>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectUserHome>
                      <AccountLayout />
                    </ProtectUserHome>
                  }
                >
                  <Route
                    path=""
                    element={
                      <ProtectUserHome>
                        <AccountOverview />
                      </ProtectUserHome>
                    }
                  />
                  <Route
                    path="Myorders"
                    element={
                      <ProtectUserHome>
                        <ManageOrders />
                      </ProtectUserHome>
                    }
                  />

                  <Route
                    path="Myorders/details"
                    element={
                      <ProtectUserHome>
                        <ProtectedOrderDetails>
                          <OrderTrackingPage />
                        </ProtectedOrderDetails>
                      </ProtectUserHome>
                    }
                  />

                  <Route
                    path="Myorders/refund"
                    element={
                      <ProtectUserHome>
                        <RefundPage />
                      </ProtectUserHome>
                    }
                  />
                  <Route
                    path="manageAddress"
                    element={
                      <ProtectUserHome>
                        <ManageAddress />
                      </ProtectUserHome>
                    }
                  />
                  <Route
                    path="wallet"
                    element={
                      <ProtectUserHome>
                        <Wallet />
                      </ProtectUserHome>
                    }
                  />
                  <Route
                    path="addNew"
                    element={
                      <ProtectUserHome>
                        <AddAddress />
                      </ProtectUserHome>
                    }
                  />
                  <Route
                    path="editAddress/:address"
                    element={
                      <ProtectUserHome>
                        <EditAddress />
                      </ProtectUserHome>
                    }
                  />
                </Route>
              </Route>

              <Route
                path="admin/login"
                element={
                  <ProtectedAuthAdmin>
                    <AdminLogin />
                  </ProtectedAuthAdmin>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedDashboardAdmin>
                    <AdminLayout />
                  </ProtectedDashboardAdmin>
                }
              >
                <Route
                  path="dashboard"
                  element={
                    <ProtectedDashboardAdmin>
                      <Dashboard />
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="notifications"
                  element={
                    <ProtectedDashboardAdmin>
                      <ReturnRequests />
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="orderReport"
                  element={
                    <ProtectedDashboardAdmin>
                      <OrderReport />
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="orders"
                  element={
                    <ProtectedDashboardAdmin>
                      <OrderManagement />
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="orders/details"
                  element={
                    <ProtectedAdminOrder>
                      <AdminOrderDetail />
                    </ProtectedAdminOrder>
                  }
                />

                <Route
                  path="customers"
                  element={
                    <ProtectedDashboardAdmin>
                      <Customers />
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="coupon"
                  element={
                    <ProtectedDashboardAdmin>
                      <CouponManagement />
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="coupon/add"
                  element={
                    <ProtectedDashboardAdmin>
                      <AddCoupon />
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="bannerMangement"
                  element={
                    <ProtectedDashboardAdmin>
                      <BannerManagement />
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="products"
                  element={
                    <ProtectedDashboardAdmin>
                      <Provider>
                        <Products />
                      </Provider>
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="products/add"
                  element={
                    <ProtectedDashboardAdmin>
                      <AddProduct />
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="products/edit"
                  element={
                    <ProtectedDashboardAdmin>
                      <Provider>
                        <EditProduct />
                      </Provider>
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="category"
                  element={
                    <ProtectedDashboardAdmin>
                      <Provider>
                        <Category />
                      </Provider>
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="brand"
                  element={
                    <ProtectedDashboardAdmin>
                      <Provider>
                        <Brand />
                      </Provider>
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="category/edit"
                  element={
                    <ProtectedDashboardAdmin>
                      <Provider>
                        <EditCategory />
                      </Provider>
                    </ProtectedDashboardAdmin>
                  }
                />
                <Route
                  path="brand/edit"
                  element={
                    <ProtectedDashboardAdmin>
                      <Provider>
                        <EditBrand />
                      </Provider>
                    </ProtectedDashboardAdmin>
                  }
                />
              </Route>
            </Routes>
          </Suspense>
        </InternetCheck>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
