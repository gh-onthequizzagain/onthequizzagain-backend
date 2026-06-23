import mongoose from "mongoose";
import { URI_BD } from "../constants";
import { logSuccess } from "../helpers/log";

export const connectDB = async (bdName: string): Promise<void> => {
  try {
    await mongoose.connect(`${URI_BD}/${bdName}`);
    logSuccess(`MongoDB (${bdName}) connecté`);
  } catch (error) {
    console.error(error);
  }
};
