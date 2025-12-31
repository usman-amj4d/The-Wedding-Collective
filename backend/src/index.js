import http from "http";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

// ! define .env path
// ? load env vars
dotenv.config({ path: "./src/config/config.env" });

// ? server setup
const PORT = process.env.PORT || 8001;

var server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
