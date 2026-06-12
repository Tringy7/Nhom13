import express from "express";
import profileController from "../controllers/profile.controller.js";
import { validate, authorize, verifyToken } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";

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
  editProfileValidationRules,
  validate,
  profileController.editAdminProfile
);

router.patch(
  "/api/admin/profile/:userId",
  verifyToken,
  authorize("admin"),
  editProfileLimiter,
  editProfileValidationRules,
  validate,
  profileController.editAdminProfile
);

export default router;