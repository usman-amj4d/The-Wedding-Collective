import express from "express";
import * as authController from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { validateRequestBody } from "../middleware/app.js";
import { loginSchema, userSchema } from "../validators/userValidator.js";
const router = express.Router();

// ? GET
router.route("/logout").get(authController.logout);

// ? POST
router
  .route("/register")
  .post(validateRequestBody(userSchema), authController.register);
router
  .route("/login")
  .post(validateRequestBody(loginSchema), authController.login);
router.route("/requestEmailToken").post(authController.requestEmailToken);
router.route("/verifyEmail").post(authController.verifyEmail);
router.route("/forgotPassword").post(authController.forgotPassword);

// ? PUT
router.route("/resetPassword").put(authController.resetPassword);
router
  .route("/updatePassword")
  .put(isAuthenticated, authController.updatePassword);

export default router;
