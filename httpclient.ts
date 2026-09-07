import axios from "axios";
import Swal from "sweetalert2";
import { apiUrl } from "./src/services/userService";
import { ACCESS_TOKEN } from "./urlconst";

const api = axios.create({
    baseURL: apiUrl,
});

// Request Interceptor: Add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            if (!(config.data instanceof FormData)) config.headers["Content-Type"] = "application/json";
        } else if (window.location.pathname !== "/auth/login") {
            window.location.href = "/auth/login";
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 errors
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        const originalRequest = error.config;
        if (!error.response) {
            Swal.fire({
                icon: "error",
                title: "Network Error",
                text: "Unable to connect to the server. Please check your internet or try again later.",
            });
            setTimeout(() => {
                if (window.location.pathname !== "/503") {
                    window.location.href = "/503";
                }
                return Promise.reject(error);
            }, 4000)


        }

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            Swal.fire({
                icon: "warning",
                title: "Session Expired",
                text: "Your session has expired. Please log in again."
            }).then(() => {
                localStorage.clear();
                setTimeout(() => {
                    if (window.location.pathname !== "/auth/login") {
                        window.location.href = "/auth/login";
                    }
                    return Promise.reject(error);
                }, 4000)



            });
        }
        return Promise.reject(error);
    }
);

export default api;
