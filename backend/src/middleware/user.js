import { errorHandler } from "../utils/errorHandler.js";

// ? check if the role is user
export const isUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorHandler("You are not logged in", 401, req, res);
    }
    if (req.user.role !== "user") {
      return errorHandler(
        "You're not a user. You don't have the permissions to access this route",
        401,
        req,
        res,
      );
    }

    next();
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};
