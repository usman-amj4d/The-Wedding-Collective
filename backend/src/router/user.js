import express from "express";
import * as userController from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

// ? GET
router.route("/details").get(isAuthenticated, userController.getUserDetails);

export default router;
