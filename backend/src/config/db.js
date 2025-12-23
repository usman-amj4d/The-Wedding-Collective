import mongoose from "mongoose";
import dotenv from "dotenv";

// ! make your own config.env
// ! define .env path
// ? take a look at .env.example for refernce

dotenv.config({
  path: "./src/config/config.env",
});

const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(
      process.env.MONGO_URI || "your_mongodb_uri_or_connection_sting"
    );
    console.log("DB connected: " + connection.host);
  } catch (error) {
    console.log("Error connecting database: " + error);
    process.exit(1);
  }
};

export default connectDB;
