import http from "http";
import { Server as socket } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import { addUser, removeUser } from "./functions/sockets/index.js";

// ! make your own config.env
// ! define .env path
// ? take a look at .env.example for refernce
// ? load env vars
dotenv.config({ path: "./src/config/config.env" });

// ? global vars
global.io;
global.onlineUsers = [];

// ? server setup
const PORT = process.env.PORT || 8001;

var server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

// ? socket.io
global.io = new socket(server, {
  cors: {
    origin: "*",
  },
});

global.io.on("connection", (socket) => {
  console.log("connected to socket", socket.id);
  global.io.to(socket.id).emit("reconnect", socket.id);
  socket.on("join", (userId) => {
    addUser(userId, socket.id);
  });
  socket.on("logout", () => {
    removeUser(socket.id);
  });
  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("user disconnected", socket.id);
  });
});
