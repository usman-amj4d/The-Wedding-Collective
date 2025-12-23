import routeNotFoundHandler from "../middleware/app.js";
import auth from "./auth.js";
import express from "express";

const router = express.Router();

router.use("/auth", auth);

// ? app
router.use(routeNotFoundHandler);

export default router;
