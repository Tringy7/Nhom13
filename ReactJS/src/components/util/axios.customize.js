import axios from "axios";
import { message } from "antd";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const PUBLIC_AUTH_PATHS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify-otp',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/resend-otp'
];

const isPublicAuthRequest = (url = '') => PUBLIC_AUTH_PATHS.some(path => url.includes(path));

// === SỬA LỖI: Thêm interceptor cho request để tự động đính kèm token ===
// Điều này giúp đồng bộ hóa việc lấy token, thay vì để mỗi nơi tự quản lý
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


instance.interceptors.response.use(
    function (response) {
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    async function (error) {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || '';

        // Bỏ qua lỗi 401 từ các API xác thực công khai
        if (error?.response?.status === 401 && isPublicAuthRequest(requestUrl)) {
            return Promise.reject(error);
        }

        // Nếu API refresh token thất bại, chuyển thẳng đến logic logout
        if (error?.response?.status === 401 && originalRequest.url.includes('/api/auth/refresh')) {
            // === SỬA LỖI: Thêm logic điều hướng tại đây ===
            if (window.location.pathname !== '/login') {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('accessToken'); // Dọn dẹp token
                window.dispatchEvent(new Event('force_logout')); // Thông báo cho các context khác
                window.location.href = '/login'; // Điều hướng
            }
            return Promise.reject(error);
        }

        // Xử lý lỗi 401 cho các API cần xác thực khác
        if (error?.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return instance(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newToken = res.data?.accessToken;
                if (!newToken) throw new Error("No new token received");

                // Cập nhật token mới vào localStorage để các request sau này sử dụng
                localStorage.setItem('accessToken', newToken);

                processQueue(null, newToken);
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return instance(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);

                // === SỬA LỖI: Thêm logic điều hướng tại đây ===
                if (window.location.pathname !== '/login') {
                    message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    localStorage.removeItem('accessToken'); // Dọn dẹp token
                    window.dispatchEvent(new Event('force_logout')); // Thông báo cho các context khác
                    window.location.href = '/login'; // Điều hướng
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default instance;