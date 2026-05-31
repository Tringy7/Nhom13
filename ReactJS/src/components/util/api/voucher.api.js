import api from '../axios.customize';

// Lấy danh sách voucher của người dùng hiện tại (cho trang Rewards)
export const getMyVouchersApi = () => {
    return api.get('/api/vouchers/my');
};

// Lấy danh sách các voucher có sẵn mà user có thể nhận
export const getAvailableVouchersApi = () => {
    return api.get('/api/vouchers/available');
};

// User thực hiện "lưu" một voucher vào ví
export const receiveVoucherApi = (voucherId) => {
    return api.post(`/api/vouchers/receive/${voucherId}`);
};

// Áp dụng thử một mã voucher để xem trước giá trị giảm
export const applyVoucherApi = (rewardCode, orderTotal) => {
    return api.post('/api/vouchers/apply', { rewardCode, orderTotal });
};

// Lấy số dư điểm thưởng hiện tại
export const getRewardBalanceApi = () => {
    return api.get('/api/rewards/balance');
};

// Lấy lịch sử giao dịch điểm thưởng
export const getRewardHistoryApi = () => {
    return api.get('/api/rewards/history');
};