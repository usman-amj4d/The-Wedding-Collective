export const successHandler = (message, data = null, statusCode, res) => {
  // ? Returning the success response
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
