import { IResponse } from '../../utils/interface/common';
import { Request, Response } from 'express';

export interface IS3ServiceAPI {
  uploadFile(request: IUploadRequest, response: IResponse): void;
  getFiles(request: IGetFilesRequest, response: IResponse): void;
  deleteFile(request: IDeleteFilesRequest, response: IResponse): void;
  getFileFromS3(request: IGetFileFromS3Request, response: IResponse): void;
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
export interface IGetFileFromS3Request extends Request {
  filepath: string;
  user: {
    _id: string;
    role: string;
    email: string;
  };
}
