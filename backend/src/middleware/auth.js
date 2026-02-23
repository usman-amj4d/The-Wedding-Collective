import jwt from "jsonwebtoken";
import User from "../models/User/User.js";
import dotenv from "dotenv";
import { errorHandler } from "../utils/errorHandler.js";

dotenv.config({ path: ".././src/config/config.env" });

// * authentication middlewares

// ? check if user has jwt
export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req?.headers?.authorization?.replace("Bearer ", "");

    if (token === "") {
      return errorHandler("Unauthorized Request", 401, req, res);
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);

      if (!user)
        return errorHandler(
          "Invalid token or you're not logged in",
          401,
          req,
          res,
        );

      req.user = user;
    }

    next();
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};
