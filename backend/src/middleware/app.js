import { errorHandler } from "../utils/errorHandler.js";

// ? route not handler
const routeNotFoundHandler = (req, res, next) => {
  return errorHandler(
    `The Requested Route ${req.hostname + req.originalUrl} Not Found`,
    404,
    req,
    res
  );
};

export default routeNotFoundHandler;
