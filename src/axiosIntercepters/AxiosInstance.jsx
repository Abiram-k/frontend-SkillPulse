import axios from "axios";
const SERVER_URL = import.meta.env.VITE_LOCAL_URL;

const axiosInstance = axios.create({
  baseURL: `${SERVER_URL}`,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios error:", error.response);
    return Promise.reject(error);
  }
);

export default axiosInstance;
