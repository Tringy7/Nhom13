import express from "express";
import profileController from "../controllers/profile.controller.js";
import { validate, authorize, verifyToken } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";
import { uploadProfileImage } from "../middleware/upload.middleware.js";

import {
  editProfileValidationRules
} from "../validations/auth.validation.js";

const router = express.Router();

const editProfileLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 10,
  message: "Too many profile updates"
});

// ==================== USER PROFILE (authenticated) ====================
router.get(
  "/api/user/profile",
  verifyToken,
  authorize("user", "admin"),
  profileController.getProfile
);

router.patch(
  "/api/user/profile",
  verifyToken,
  authorize("user", "admin"),
  editProfileLimiter,
  uploadProfileImage.single("image"), // <-- Thêm middleware upload ở đây
  editProfileValidationRules,
  validate,
  profileController.editUserProfile
);

// ==================== ADMIN PROFILE ROUTES ====================
router.get(
  "/api/admin/profile",
  verifyToken,
  authorize("admin"),
  profileController.getAdminProfile
);

router.patch(
  "/api/admin/profile",
  verifyToken,
  authorize("admin"),
  editProfileLimiter,
  uploadProfileImage.single("image"), // <-- Cho phép admin upload ảnh
  editProfileValidationRules,
  validate,
  profileController.editAdminProfile
);

router.patch(
  "/api/admin/profile/:userId",
  verifyToken,
  authorize("admin"),
  editProfileLimiter,
  uploadProfileImage.single("image"), // <-- Cho phép admin upload ảnh cho user khác
  editProfileValidationRules,
  validate,
  profileController.editAdminProfile
);

export default router;