import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7096/api",
  withCredentials: true, 
});

// Attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (userId) {
    config.headers['User-Id'] = userId;
    console.log(config.headers['User-Id']);
  }
  if (userName) {
    config.headers['User-Name'] = userName;
  }

  return config;
});

export default api;