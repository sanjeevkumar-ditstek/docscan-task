import { IExpressResponse, IResponse } from '../../utils/interface/common';
import { Request } from 'express';

export interface IUploadServiceAPI {
  uploadFile(request: IUploadRequest, response: IExpressResponse): void;
  getFiles(request: IGetFilesRequest, response: IExpressResponse): void;
  deleteFile(request: IDeleteFilesRequest, response: IExpressResponse): void;
  getFile(request: IGetFile, response: IExpressResponse): void;
}

/********************************************************************************
 *  Upload File
 ********************************************************************************/
export interface IUploadRequest extends Request {
  file: Express.Multer.File;
  document_type: string;
  user: {
    _id: string;
    role: string;
    email: string;
  };
}

/********************************************************************************
 *  Get Files
 ********************************************************************************/
export interface IGetFilesRequest extends Request {
  document_type?: string;
  user: {
    _id: string;
    role: string;
    email: string;
  };
}

/********************************************************************************
 *  Delete File
 ********************************************************************************/
export interface IDeleteFilesRequest extends Request {
  document_id?: string;
  user: {
    _id: string;
    role: string;
    email: string;
  };
}

/********************************************************************************
 *  Get File From S3
 ********************************************************************************/
export interface IGetFile extends Request {
  filepath: string;
  user: {
    _id: string;
    role: string;
    email: string;
  };
}
