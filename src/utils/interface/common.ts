import StatusCodeEnum from '../enum/statusCodes';
import { Response } from 'express';

export interface IResponse {
  statusCode: StatusCodeEnum;
  message: string;
  data: any;
  status: boolean;
  error?: any;
}

export interface IApiResponse extends IResponse {
  response: Response;
}

export interface IError {
  message?: any;
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
