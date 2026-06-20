import axios from 'axios';
import { message } from 'antd';

// Tạo một instance của Axios
const apiClient = axios.create({
    // Bạn có thể đặt baseURL ở đây nếu tất cả các API của bạn có chung một tiền tố
    // ví dụ: baseURL: 'http://localhost:8080/api'
});

// Thêm một interceptor cho request để tự động đính kèm token
apiClient.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage (hoặc bất cứ nơi nào bạn lưu trữ nó)
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Thêm một interceptor cho response để xử lý lỗi toàn cục
apiClient.interceptors.response.use(
    (response) => {
        // Bất kỳ mã trạng thái nào nằm trong phạm vi 2xx sẽ khiến hàm này được kích hoạt
        return response;
    },
    (error) => {
        // Bất kỳ mã trạng thái nào nằm ngoài phạm vi 2xx sẽ khiến hàm này được kích hoạt
        const { status } = error.response || {};

        // Xử lý lỗi 401 (Unauthorized)
        if (status === 401) {
            // Để tránh vòng lặp chuyển hướng, chỉ chuyển hướng nếu chưa ở trang login
            if (window.location.pathname !== '/login') {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                
                // Xóa token cũ để dọn dẹp
                localStorage.removeItem('accessToken');

                // Chuyển hướng người dùng đến trang đăng nhập
                // Sử dụng window.location.href để tải lại toàn bộ trang, giúp reset state của ứng dụng
                window.location.href = '/login';
            }
        }

        // Điều quan trọng là phải trả về Promise.reject(error) để các lệnh .catch() trong component vẫn được kích hoạt
        return Promise.reject(error);
    }
);

export default apiClient;
