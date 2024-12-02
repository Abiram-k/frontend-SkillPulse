import axios from "axios";
const SERVER_URL = import.meta.env.VITE_LOCAL_URL;

const axiosInstance = axios.create({
  baseURL: `${SERVER_URL}`,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(
          "http://localhost:3000/token",
          {},
          { withCredentials: true }
        );

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.log(refreshError);
        alert("Token refresh failed:");
        localStorage.removeItem("userData");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
