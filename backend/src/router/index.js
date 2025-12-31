import routeNotFoundHandler from "../middleware/app.js";
import auth from "./auth.js";
import user from "./user.js";
import express from "express";

const router = express.Router();

router.use("/auth", auth);
router.use("/user", user);

// ? app
router.use(routeNotFoundHandler);

export default router;
