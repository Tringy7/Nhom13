import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profileSlice';
import forgotPasswordReducer from './forgotPasswordSlice';
import paymentReducer from './paymentSlice';

export const store = configureStore({
    reducer: {
        profile: profileReducer,
        forgotPassword: forgotPasswordReducer,
        payment: paymentReducer,
    }
});

export default store;
