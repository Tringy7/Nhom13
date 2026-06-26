'use strict';
import express from 'express';
import cartController from '../controllers/cart.controller.js';
import {authorize, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  '/api/cart/add',
  verifyToken,
  authorize("user", "manager", "admin"),
  cartController.addToCart
);

router.delete(
  '/api/cart/:cartItemId',
  verifyToken,
  authorize("user", "manager", "admin"),
  cartController.deleteCartItem
);

router.patch(
  '/api/cart/items/:cartItemId',
  verifyToken,
  authorize("user", "manager", "admin"),
  cartController.updateCartItem
);

router.get(
  '/api/cart',
  verifyToken,
  authorize("user", "manager", "admin"),
  cartController.getCart
);



export default router;