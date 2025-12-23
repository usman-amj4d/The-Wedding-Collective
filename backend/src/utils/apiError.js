export const apiError = (
  statusCode,
  message,
  isOperational = true,
  stack = ""
) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  if (stack) {
    error.stack = stack;
  } else {
    Error.captureStackTrace(error, apiError);
  }
  return error;
};
