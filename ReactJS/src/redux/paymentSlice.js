import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createVNPayPaymentApi, getPaymentStatusApi, verifyVNPayReturn } from '../components/util/api/payment.api';

export const createVNPayPayment = createAsyncThunk(
    'payment/createVNPayPayment',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await createVNPayPaymentApi(orderData);
            return response?.data ?? response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán');
        }
    }
);

export const getPaymentStatus = createAsyncThunk(
    'payment/getPaymentStatus',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await getPaymentStatusApi(orderId);
            return response?.data ?? response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể lấy trạng thái thanh toán');
        }
    }
);

export const verifyPayment = createAsyncThunk(
    'payment/verifyPayment',
    async (params, { rejectWithValue }) => {
        try {
            const response = await verifyVNPayReturn(params);
            return response?.data ?? response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xác thực giao dịch');
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        loading: false,
        paymentUrl: null,
        paymentStatus: null,
        error: null,
        verifyResult: null
    },
    reducers: {
        clearPaymentState: (state) => {
            state.loading = false;
            state.paymentUrl = null;
            state.paymentStatus = null;
            state.error = null;
            state.verifyResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create VNPay Payment
            .addCase(createVNPayPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createVNPayPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentUrl = action.payload.paymentUrl;
            })
            .addCase(createVNPayPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Payment Status
            .addCase(getPaymentStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPaymentStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentStatus = action.payload.data;
            })
            .addCase(getPaymentStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Verify Payment
            .addCase(verifyPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.verifyResult = action.payload;
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.verifyResult = { success: false, message: action.payload };
            });
    }
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
