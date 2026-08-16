import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8001",
  headers: {
    "Content-Type": "application/json",
  },
});


// ---------------------------------------------------------
// REQUEST INTERCEPTOR
// Attach JWT to authenticated API requests
// ---------------------------------------------------------

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "access_token"
    );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// ---------------------------------------------------------
// RESPONSE INTERCEPTOR
// Handle expired or invalid authentication
// ---------------------------------------------------------

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(
        "access_token"
      );

      const currentPath =
        window.location.pathname;

      if (currentPath !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);


export default api;