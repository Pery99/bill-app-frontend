import axios from "axios";
import { authUtils } from "./auth";

const api = axios.create({
  //baseURL: "http://localhost:3000/api",
  baseURL: "https://bill-app-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});



api.interceptors.request.use(
  (config) => {
    const token = authUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authUtils.removeToken();
    }
    return Promise.reject(error);
  }
);

export default api;
