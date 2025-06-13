import axios from "axios";

// API configuration for global use
const API_BASE_URL = "https://localhost:51258/";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api; 