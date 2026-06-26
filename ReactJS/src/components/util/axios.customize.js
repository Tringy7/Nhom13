import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

const PUBLIC_AUTH_PATHS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify-otp',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/resend-otp',
    '/api/auth/refresh',
];

instance.interceptors.response.use(
    (response) => {
        if (response && response.data) return response.data;
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || '';

        const isPublic = PUBLIC_AUTH_PATHS.some(path => requestUrl.includes(path));
        if (error?.response?.status !== 401 || isPublic || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => instance(originalRequest))
                .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`,
                {},
                { withCredentials: true }
            );

            processQueue(null);
            return instance(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError, null);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default instance;