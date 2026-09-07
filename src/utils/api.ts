import axios from 'axios';
import { apiUrl } from '../services/userService';

const api = axios.create({baseURL: `${apiUrl}/v1`, headers: {
  "Content-Type": "application/json",
}});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;