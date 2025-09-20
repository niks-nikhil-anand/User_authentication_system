import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = mongoose.connect(process.env.MONGO_URI);
    console.log("Mongodb is connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
