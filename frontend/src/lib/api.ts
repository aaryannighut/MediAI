import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"; // Use your local IP (e.g. 192.168.x.x) if testing on a real mobile device

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to add the JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("mediai_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors and auto-retry on network failures
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("mediai_token");
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
            return Promise.reject(error);
        }

        // Auto-retry logic for network errors or server unavailability
        if (config) {
            if (!config.retry) {
                config.retry = 2;
                config.retryCount = 0;
            }

            if (config.retryCount < config.retry && !error.response) {
                config.retryCount += 1;
                console.warn(`Connection failed. Retrying request... Attempt ${config.retryCount} of ${config.retry}`);
                
                // Wait for 1 second before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                return api(config); // Retry the request
            }

            if (!error.response && config.retryCount >= config.retry) {
                return Promise.reject(new Error("Backend not reachable"));
            }
        }

        return Promise.reject(error);
    }
);

export default api;
