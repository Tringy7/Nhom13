import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../entities/index.js";
import { sendOtpEmail } from '../services/auth/email.service.js';
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import {
  generateOTP,
  getOTPExpiry,
  isOTPExpired,
  verifyOTPCode,
} from "../services/auth/otpService.js";
import { sendPasswordResetEmail } from "../services/auth/mailService.js";

const { User, ResetOtp } = db;

const otpStore = new Map();

let login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await user.update({
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastLoginAt: new Date(),
    });

    res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "strict", maxAge: 1 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });

    const role = user.role.toLowerCase();
    let redirectURI = "/api/home";
    if (role === "admin") redirectURI = "/admin/dashboard";
    else if (role === "user") redirectURI = "/api/home";

    return res.json({
      message: "Login success",
      token: accessToken,
      role,
      redirectURI,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

let refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    const user = await User.findOne({ where: { refreshToken: token } });
    if (!user || user.refreshTokenExpiresAt < new Date()) {
      return res.sendStatus(403);
    }

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.sendStatus(403);

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      await user.update({
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.cookie("accessToken", newAccessToken, { httpOnly: true, sameSite: "strict", maxAge: 15 * 60 * 1000 });
      res.cookie("refreshToken", newRefreshToken, { httpOnly: true, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });

      return res.json({ message: "Token refreshed", accessToken: newAccessToken });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

let logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ where: { refreshToken: token } });
      if (user) {
        await user.update({ refreshToken: null, refreshTokenExpiresAt: null });
      }
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.json({ message: "Logged out" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

let forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    await sendPasswordResetEmail(email, otp, user.fullName || "User");

    await ResetOtp.destroy({ where: { email } });
    await ResetOtp.create({ email, otp, expiresAt: getOTPExpiry() });

    const tempToken = jwt.sign({ email, purpose: "password-reset" }, process.env.TEMP_TOKEN_SECRET, { expiresIn: "10m" });

    return res.json({ message: "OTP sent", tempToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

let resetPassword = async (req, res) => {
  try {
    const { email, otp, tempToken, newPassword } = req.body;

    const decoded = jwt.verify(tempToken, process.env.TEMP_TOKEN_SECRET);
    if (decoded.email !== email || decoded.purpose !== "password-reset") {
      return res.status(400).json({ message: "Invalid temp token" });
    }

    const storedOtp = await ResetOtp.findOne({ where: { email } });
    if (!storedOtp || isOTPExpired(storedOtp.expiresAt) || !verifyOTPCode(otp, storedOtp.otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { email } });
    await ResetOtp.destroy({ where: { email } });

    const user = await User.findOne({ where: { email } });
    const accessToken = generateAccessToken(user);

    return res.status(200).json({ message: "Password reset successful", accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

let resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    await sendPasswordResetEmail(email, otp, user.fullName || "User");

    await ResetOtp.destroy({ where: { email } });
    await ResetOtp.create({ email, otp, expiresAt: getOTPExpiry() });

    return res.json({ message: "OTP resent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

let register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const lowerCaseEmail = email.toLowerCase();

    const existingUser = await User.findOne({ where: { email: lowerCaseEmail } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    
    sendOtpEmail(lowerCaseEmail, otp).catch(console.error);

    otpStore.set(lowerCaseEmail, {
      otp,
      otpExpiry: getOTPExpiry(),
      userData: { email: lowerCaseEmail, password: hashedPassword, fullName }
    });

    return res.status(200).json({ success: true, message: `Mã OTP đã được gửi tới ${lowerCaseEmail}.` });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server, vui lòng thử lại sau.' });
  }
};

let verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const lowerCaseEmail = email.toLowerCase();

    const record = otpStore.get(lowerCaseEmail);
    if (!record || isOTPExpired(record.otpExpiry) || record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Mã OTP không chính xác hoặc đã hết hạn.' });
    }

    const newUser = await User.create({ ...record.userData, role: 'USER' });
    otpStore.delete(lowerCaseEmail);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      data: { id: newUser.id, email: newUser.email, fullName: newUser.fullName }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server, vui lòng thử lại sau.' });
  }
};

let resendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const lowerCaseEmail = email.toLowerCase();

    const record = otpStore.get(lowerCaseEmail);
    if (!record) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy yêu cầu đăng ký.' });
    }

    const otp = generateOTP();
    sendOtpEmail(lowerCaseEmail, otp).catch(console.error);
    otpStore.set(lowerCaseEmail, { ...record, otp, otpExpiry: getOTPExpiry() });

    return res.status(200).json({ success: true, message: 'Đã gửi lại mã OTP.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server, vui lòng thử lại sau.' });
  }
};

let editUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, address, gender } = req.body;
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      fullName: fullName || user.fullName,
      phone: phone || user.phone,
      address: address || user.address,
      gender: gender !== undefined ? gender : user.gender,
      avatar: avatar || user.avatar,
    });

    const { password, ...userResponse } = user.get({ plain: true });
    return res.json({ message: "Profile updated successfully", user: userResponse });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

let getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export default {
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  resendOtp,
  register,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  editUserProfile,
  getProfile
};