import express from "express"; //gọi Express
import rateLimit from "express-rate-limit";
import authRoutes from "./auth.routes.js";

import { register, resendOtp, verifyOtp } from "../controllers/auth.controller.js";

const router = express.Router(); //khởi tạo Route

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many registration attempts. Try again later." },
});

const verifyLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many verification attempts. Try again later." },
});

const resendLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many OTP requests. Try again later." },
});

const initWebRoutes = (app) => {
    
    router.post("/api/auth/register", registerLimiter, register);
    router.post("/api/auth/verify-otp", verifyLimiter, verifyOtp);
    router.post("/api/auth/resend-otp", resendLimiter, resendOtp);
    app.use("/", authRoutes);
    return app.use("/", router); //url mặc định
};

export default initWebRoutes;
