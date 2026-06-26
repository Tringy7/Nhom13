import dotenv from "dotenv";

dotenv.config();

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5;

export const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOTPExpiry = () => {
	return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

export const isOTPExpired = (expiryDate) => {
	return new Date() > new Date(expiryDate);
};

export const verifyOTPCode = (inputCode, storedCode) => {
	return inputCode === storedCode;
};
