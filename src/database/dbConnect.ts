import mongoose from "mongoose";
import { DBURL } from "../config/config";

export const connectDB = async () => {
  try {
    await mongoose.connect(DBURL);
    console.log("connected to DB");
  } catch (error) {
    console.log("error while connecting to DB", error);
  }
};
