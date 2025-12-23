export const successHandler = (message, data = null, statusCode, res) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
