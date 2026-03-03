import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { apiError } from "./utils/apiError.js";
import router from "./router/index.js";
import loggerMiddleware from "./middleware/loggerMiddleware.js";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./utils/errorHandler.js";

// ? Generated Swagger file
import * as swaggerFile from "../swagger_output.json" with { type: "json" };

// ? Middlewares
const app = express();

app.use(express.json());
app.use(cors());
app.options("*", cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(loggerMiddleware);

// ? router index
app.use("/", router);

// ? api doc
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get("/", (req, res) => {
  res.send("NodeJs-ESM-Boilerplate v1.1");
});

// ? send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(apiError(404, "Not found"));
});

// ? global error handler
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  if (err.code === 11000) {
    // Duplicate key
    return errorHandler("Duplicate value entered", 409, req, res);
  }

  return errorHandler(
    err.message || "Server Error",
    err.status || 500,
    req,
    res,
  );
});

export default app;
