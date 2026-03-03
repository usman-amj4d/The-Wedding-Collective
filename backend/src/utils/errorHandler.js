import logger from "../functions/logger.js";

export const errorHandler = (message, statusCode, req, res) => {
  // ? Logging the error details in the error log file
  logger.error({
    method: req.method,
    url: req.url,
    date: new Date(),
    message: message,
  });

  // ? Returning the error response
  return res.status(statusCode).json({
    success: false,
    message: message,
  });
};
