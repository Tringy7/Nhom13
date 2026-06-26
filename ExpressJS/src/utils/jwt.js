// utils/jwt.js
import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      role: user.role.toLowerCase(),
      email: user.email,
      fullName: user.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      role: user.role.toLowerCase()
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};