import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profileSlice';
import forgotPasswordReducer from './forgotPasswordSlice';
import paymentReducer from './paymentSlice';
import adminDashboardReducer from "./adminDashboardSlice";
import adminUserReducer from "./adminUserSlice";
import adminManagerReducer from "./adminManagerSlice";
import adminShipperReducer from "./adminShipperSlice";
import adminOrderReducer from "./adminOrderSlice";
import adminRevenueReducer from "./adminRevenueSlice";
import adminSettingsReducer from "./adminSettingsSlice";


export const store = configureStore({
    reducer: {
        profile: profileReducer,
        forgotPassword: forgotPasswordReducer,
        payment: paymentReducer,
        adminDashboard: adminDashboardReducer,
        adminUsers: adminUserReducer,
        adminManagers: adminManagerReducer,
        adminShippers: adminShipperReducer,
        adminOrders: adminOrderReducer,
        adminRevenue: adminRevenueReducer,
        adminSettings: adminSettingsReducer,
    }
});

export default store;
