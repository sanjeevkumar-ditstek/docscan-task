import { Server } from './server';
import dotenv from 'dotenv';
import { connectToMongo } from './utils/mongodb/mongodb';
import { logger } from './utils/logger/winston';

dotenv.config();
const Port = process.env.PORT || 3001;
const server = new Server(Number(Port));
server.start();
connectToMongo();
logger();
