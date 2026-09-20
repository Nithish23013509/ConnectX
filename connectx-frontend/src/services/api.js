import axios from "axios";

const api = axios.create({
    baseURL: "https://happening-eating-giveaway.ngrok-free.dev/api",
    headers: {
        "Content-Type": "application/json",
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
