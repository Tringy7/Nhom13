import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import PasswordValidator from "password-validator";
import { User } from "../models";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

// Password strength validator
const passwordValidator = new PasswordValidator();
passwordValidator
    .min(8)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().symbols();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number.parseInt(process.env.MAIL_PORT || "0", 10),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const normalizeEmail = (value) => (value || "").trim().toLowerCase();

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const hashOtp = (otp) => {
    if (!process.env.OTP_SECRET) {
        throw new Error("OTP_SECRET is missing.");
    }
    return crypto.createHmac("sha256", process.env.OTP_SECRET).update(otp).digest("hex");
};

const canResendOtp = (lastSentAt) => {
    if (!lastSentAt) {
        return true;
    }
    const elapsedMs = Date.now() - new Date(lastSentAt).getTime();
    return elapsedMs >= OTP_RESEND_COOLDOWN_SECONDS * 1000;
};

// ============ VALIDATORS ============
const validateEmail = (email) => {
    const normalized = normalizeEmail(email);
    if (!normalized) {
        return { valid: false, message: "Email is required" };
    }
    if (!EMAIL_REGEX.test(normalized)) {
        return { valid: false, message: "Invalid email format" };
    }
    return { valid: true, normalized };
};

const validatePassword = (password) => {
    if (!password) {
        return { valid: false, message: "Password is required" };
    }
    const errors = passwordValidator.validate(password, { list: true });
    if (errors.length > 0) {
        return {
            valid: false,
            message: "Password must be at least 8 characters with uppercase, lowercase, number, and symbol",
        };
    }
    return { valid: true };
};

const validateOtp = (otp) => {
    const trimmed = (otp || "").trim();
    if (!trimmed) {
        return { valid: false, message: "OTP is required" };
    }
    if (!/^\d{6}$/.test(trimmed)) {
        return { valid: false, message: "OTP must be 6 digits" };
    }
    return { valid: true, otp: trimmed };
};

// ============ EMAIL TEMPLATES ============
const getOtpEmailHtml = (otp, expiryMinutes = OTP_TTL_MINUTES) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px; text-align: center; }
        .content p { color: #666; font-size: 16px; margin: 10px 0; }
        .otp-box { background-color: #f0f0f0; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; }
        .otp-code { font-size: 48px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: 'Courier New', monospace; }
        .expiry { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; color: #856404; font-size: 14px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e9ecef; }
        .warning { color: #dc3545; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Account Verification</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Your account has been registered. Use the code below to verify your email address:</p>
            <div class="otp-box">
                <div class="otp-code">${otp}</div>
            </div>
            <div class="expiry">
                <strong>⏱️ This code expires in ${expiryMinutes} minutes</strong><br>
                Do not share this code with anyone. <span class="warning">Never share this code via email or message</span>.
            </div>
            <p>If you didn't register for this account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
`;

const sendOtpEmail = async (email, otp) => {
    const from = process.env.MAIL_FROM || process.env.MAIL_USER;
    if (!from) {
        throw new Error("MAIL_FROM is missing.");
    }

    await transporter.sendMail({
        from,
        to: email,
        subject: "🔐 Verify Your Email - OTP Code",
        html: getOtpEmailHtml(otp),
        text: `Your OTP is ${otp}. It is valid for ${OTP_TTL_MINUTES} minutes. Do not share this code with anyone.`,
    });
};

export const register = async (req, res) => {
    const { email, password } = req.body || {};

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
        return res.status(400).json({ 
            success: false,
            message: emailValidation.message 
        });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return res.status(400).json({ 
            success: false,
            message: passwordValidation.message 
        });
    }

    const normalizedEmail = emailValidation.normalized;

    try {
        const existingUser = await User.findOne({ where: { email: normalizedEmail } });
        
        // Check if email already registered and active
        if (existingUser?.isActive) {
            return res.status(409).json({ 
                success: false,
                message: "This email is already registered." 
            });
        }

        // Check resend cooldown for existing inactive user
        if (existingUser && !canResendOtp(existingUser.otpLastSentAt)) {
            const waitSeconds = OTP_RESEND_COOLDOWN_SECONDS - 
                Math.floor((Date.now() - new Date(existingUser.otpLastSentAt).getTime()) / 1000);
            return res.status(429).json({ 
                success: false,
                message: `Please wait ${waitSeconds}s before requesting a new OTP.` 
            });
        }

        // Generate OTP
        const otp = generateOtp();
        const otpHash = hashOtp(otp);
        const passwordHash = await bcrypt.hash(password, 10);
        const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

        if (existingUser) {
            // Update existing inactive user
            existingUser.password = passwordHash;
            existingUser.isActive = false;
            existingUser.otpHash = otpHash;
            existingUser.otpExpiresAt = expiresAt;
            existingUser.otpAttempts = 0;
            existingUser.otpLastSentAt = new Date();
            await existingUser.save();
        } else {
            // Create new user
            await User.create({
                email: normalizedEmail,
                password: passwordHash,
                isActive: false,
                otpHash,
                otpExpiresAt: expiresAt,
                otpAttempts: 0,
                otpLastSentAt: new Date(),
            });
        }

        // Send OTP email
        await sendOtpEmail(normalizedEmail, otp);

        return res.status(201).json({
            success: true,
            message: "Registration successful. Please check your email for the OTP code.",
            data: {
                email: normalizedEmail,
                expiresIn: `${OTP_TTL_MINUTES} minutes`
            }
        });
    } catch (error) {
        console.error("Register error:", error.message);
        return res.status(500).json({ 
            success: false,
            message: "Registration failed. Please try again later." 
        });
    }
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body || {};

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
        return res.status(400).json({ 
            success: false,
            message: emailValidation.message 
        });
    }

    // Validate OTP format
    const otpValidation = validateOtp(otp);
    if (!otpValidation.valid) {
        return res.status(400).json({ 
            success: false,
            message: otpValidation.message 
        });
    }

    const normalizedEmail = emailValidation.normalized;
    const trimmedOtp = otpValidation.otp;

    try {
        const user = await User.findOne({ where: { email: normalizedEmail } });
        
        // Check if user exists and is not already active
        if (!user || user.isActive) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid email or account already activated." 
            });
        }

        // Check if OTP hash exists
        if (!user.otpHash || !user.otpExpiresAt) {
            return res.status(400).json({ 
                success: false,
                message: "No OTP found. Please register again." 
            });
        }

        // Check if OTP expired
        if (new Date(user.otpExpiresAt).getTime() < Date.now()) {
            return res.status(400).json({ 
                success: false,
                message: "OTP expired. Please request a new one." 
            });
        }

        // Check attempt limit
        if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
            return res.status(429).json({ 
                success: false,
                message: `Too many failed attempts. Please request a new OTP after ${OTP_RESEND_COOLDOWN_SECONDS}s.` 
            });
        }

        // Verify OTP
        const providedHash = hashOtp(trimmedOtp);
        if (providedHash !== user.otpHash) {
            user.otpAttempts += 1;
            await user.save();
            const remainingAttempts = OTP_MAX_ATTEMPTS - user.otpAttempts;
            return res.status(400).json({ 
                success: false,
                message: `Invalid OTP. ${remainingAttempts} attempts remaining.` 
            });
        }

        // OTP verified - activate account
        user.isActive = true;
        user.otpHash = null;
        user.otpExpiresAt = null;
        user.otpAttempts = 0;
        user.otpLastSentAt = null;
        await user.save();

        return res.status(200).json({ 
            success: true,
            message: "Account activated successfully. You can now login." 
        });
    } catch (error) {
        console.error("Verify OTP error:", error.message);
        return res.status(500).json({ 
            success: false,
            message: "Verification failed. Please try again later." 
        });
    }
};

export const resendOtp = async (req, res) => {
    const { email } = req.body || {};

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
        return res.status(400).json({ 
            success: false,
            message: emailValidation.message 
        });
    }

    const normalizedEmail = emailValidation.normalized;

    try {
        const user = await User.findOne({ where: { email: normalizedEmail } });
        
        // Check if user exists and not already active
        if (!user || user.isActive) {
            return res.status(400).json({ 
                success: false,
                message: "User not found or already activated." 
            });
        }

        // Check resend cooldown
        if (!canResendOtp(user.otpLastSentAt)) {
            const waitSeconds = OTP_RESEND_COOLDOWN_SECONDS - 
                Math.floor((Date.now() - new Date(user.otpLastSentAt).getTime()) / 1000);
            return res.status(429).json({ 
                success: false,
                message: `Please wait ${waitSeconds}s before requesting a new OTP.` 
            });
        }

        // Generate new OTP
        const otp = generateOtp();
        user.otpHash = hashOtp(otp);
        user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
        user.otpAttempts = 0;
        user.otpLastSentAt = new Date();
        await user.save();

        // Send OTP email
        await sendOtpEmail(normalizedEmail, otp);

        return res.status(200).json({ 
            success: true,
            message: "OTP resent successfully. Please check your email.",
            data: {
                email: normalizedEmail,
                expiresIn: `${OTP_TTL_MINUTES} minutes`
            }
        });
    } catch (error) {
        console.error("Resend OTP error:", error.message);
        return res.status(500).json({ 
            success: false,
            message: "OTP resend failed. Please try again later." 
        });
    }
};
