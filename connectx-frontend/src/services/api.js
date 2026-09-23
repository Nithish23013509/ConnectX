import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
    },
});

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("connectx_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
