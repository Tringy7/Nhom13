import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

export const verifyToken = (req, res, next) => {
  let token = req.cookies.accessToken;
  const authHeader = req.headers.authorization;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = {
      ...user,
      id: user?.id ?? user?.userId ?? user?.user_id ?? null,
    };

    if (!req.user.id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    next();
  });
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = String(req.user?.role || "").toUpperCase();
    const allowedRoles = roles.map((role) => String(role).toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};
