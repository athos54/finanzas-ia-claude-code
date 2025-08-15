import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (userData) => api.post("/auth/login", userData),
  logout: () => api.post("/auth/logout"),
};

export const transactionsAPI = {
  getAll: (params = {}) => api.get("/transactions", { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post("/transactions", data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getStats: (params = {}) => api.get("/transactions/stats", { params }),
};

export const goalsAPI = {
  getAll: (params = {}) => api.get("/goals", { params }),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post("/goals", data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  updateProgress: (id, amount) => api.put(`/goals/${id}/progress`, { amount }),
  delete: (id) => api.delete(`/goals/${id}`),
  getStats: () => api.get("/goals/stats"),
};

export const budgetsAPI = {
  getAll: (params = {}) => api.get("/budgets", { params }),
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post("/budgets", data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  recalculate: (id) => api.put(`/budgets/${id}/recalculate`),
  delete: (id) => api.delete(`/budgets/${id}`),
  getStats: () => api.get("/budgets/stats"),
};

export const healthCheck = () => api.get("/health");

export default api;
