import { Request, Response, NextFunction } from 'express';

export interface IAuthServiceAPI {
  authenticate(request: Request, response: Response, next: NextFunction): void;
}

export interface IAuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
    email: string;
  };
}

export interface IAuthJWTData {
  _id: string;
  role: string;
  email: string;
}
