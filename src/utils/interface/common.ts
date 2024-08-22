import { Response } from 'express';
import StatusCodeEnum from '../enum/statusCodes';

export interface IResponse {
  statusCode: StatusCodeEnum;
  message: string;
  data: any;
  status: boolean;
  error?: any;
}
export type IExpressResponse = Response;
export interface IApiResponse extends IResponse {
  response: any;
}

export interface IError {
  message?: string;
  error?: any;
}

export function joiToError(joiError: any): IError {
  let message =
    'There was an error processing your request. Please contact support.';
  if (joiError && joiError.details && joiError.details[0]) {
    message = joiError.details[0].message;
  } else {
    message = joiError.message;
  }
  const error: IError = {
    message
  };
  return error;
}

export function toError(message: string): IError {
  const error: IError = {
    message
  };
  return error;
}
