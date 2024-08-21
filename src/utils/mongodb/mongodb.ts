import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

export async function connectToMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to Database");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}