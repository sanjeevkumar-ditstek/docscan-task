import { Server } from './server';
import dotenv from 'dotenv';
import { connectToMongo } from './utils/mongodb/mongodb';

dotenv.config();
const Port = process.env.PORT || 3001;
const server = new Server(Number(Port));
server.start();
connectToMongo();
