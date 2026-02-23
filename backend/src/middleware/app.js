import { errorHandler } from "../utils/errorHandler.js";

// ? route not handler
const routeNotFoundHandler = (req, res, next) => {
  return errorHandler(
    `The Requested Route ${req.hostname + req.originalUrl} Not Found`,
    404,
    req,
    res,
  );
};

// ? validate request body
export const validateRequestBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message);
      return errorHandler(errors.join(", "), 400, req, res);
    }

    req.validatedBody = result.data;
    next();
  };
};

export default routeNotFoundHandler;
