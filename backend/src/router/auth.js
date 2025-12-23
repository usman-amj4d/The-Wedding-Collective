import express from "express";
import * as authController from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

// ? GET
router.route("/logout").get(authController.logout);

// ? POST
router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route("/requestEmailToken").post(authController.requestEmailToken);
router.route("/verifyEmail").post(authController.verifyEmail);
router.route("/forgotPassword").post(authController.forgotPassword);

// ? PUT
router.route("/resetPassword").put(authController.resetPassword);
router
  .route("/updatePassword")
  .put(isAuthenticated, authController.updatePassword);

export default router;
