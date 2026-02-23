import { errorHandler } from "../utils/errorHandler.js";

// ? check if the role is vendor
export const isVendor = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorHandler("Not logged in", 401, req, res);
    }
    if (req.user.role !== "vendor") {
      return errorHandler(
        "You're not a vendor. You don't have the permissions to access this route",
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
