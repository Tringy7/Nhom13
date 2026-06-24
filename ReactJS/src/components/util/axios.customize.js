import axios from 'axios';

// Tạo một instance axios riêng để không bị vòng lặp interceptor khi refresh
const refreshInstance = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
});

// Instance chính cho các API khác
const instance = axios.create({
    baseURL: 'http://localhost:8080',
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

// Interceptor cho các request gửi đi
instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Interceptor cho các response trả về
instance.interceptors.response.use(
    response => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi là 401 và request chưa được retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Nếu đang refresh, đẩy request vào hàng đợi
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
                // Gọi API refresh token
                const res = await refreshInstance.post('/api/auth/refresh');
                const newAccessToken = res.data.token;

                // Lưu token mới
                localStorage.setItem('access_token', newAccessToken);

                // Cập nhật header cho các request sau này
                instance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

                // Thực thi lại các request trong hàng đợi
                processQueue(null, newAccessToken);

                // Retry lại request ban đầu
                return instance(originalRequest);
            } catch (refreshError) {
                // Nếu refresh thất bại, logout người dùng
                processQueue(refreshError, null);
                localStorage.removeItem('access_token');
                // Gửi một sự kiện để AuthProvider có thể bắt và cập nhật state
                window.dispatchEvent(new Event('force_logout'));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default instance;