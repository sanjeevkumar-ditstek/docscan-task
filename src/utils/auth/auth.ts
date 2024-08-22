import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import logger from '../logger/winston'
dotenv.config();



interface IJwtRequest extends Request {
  user?: object | string
}
export default function authenticate(
  req: IJwtRequest,
  res: Response,
  next: NextFunction
): any {
  const token = req.headers.authorization;
  jwt.verify(token, process.env.JWT_SECRET, (error, data) => {
    if (error) {
      logger.error(error);
      return error;
    } else if (data) {
      req.user = data;
    }
    next();
  });
}
