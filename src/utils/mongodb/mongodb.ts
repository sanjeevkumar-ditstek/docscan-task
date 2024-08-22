import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import logger from '../logger/winston';

export async function connectToMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    logger.info('Connected to Database');
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}
