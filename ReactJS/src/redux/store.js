import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profileSlice';
<<<<<<< HEAD

export const store = configureStore({
    reducer: {
        profile: profileReducer
=======
import forgotPasswordReducer from './forgotPasswordSlice';

export const store = configureStore({
    reducer: {
        profile: profileReducer,
        forgotPassword: forgotPasswordReducer,
>>>>>>> UI/forgotPassword
    }
});

export default store;
