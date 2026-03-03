import { errorHandler } from "../utils/errorHandler.js";

// ? check if the role is admin
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorHandler("You are not logged in", 401, req, res);
    }

    if (req.user.role === "admin" || req.user.role === "mod") {
      next();
    } else {
      return errorHandler(
        "You're not an admin. You don't have the permissions to access this route",
        401,
        req,
        res,
      );
    }
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};
