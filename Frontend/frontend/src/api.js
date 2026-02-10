// npm install axios
// JavaScript Library used to make HTTP requests(POST, GET, PUT, DELETE)
import axios from "axios"
import { ACCESS_TOKEN } from './constants'


// Ensures every request starts with VITE_API_URL(defined in the .env file) followed by the endpoint.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});


// Request interceptors
// Before every request, axios reads the token from the localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;