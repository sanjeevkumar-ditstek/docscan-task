import S3Store from "./s3Store";
import { s3Interface } from "../../utils/interface/s3/IS3";
import STATUS_CODES from "../../utils/enum/statusCodes";
import ErrorMessageEnum from "../../utils/enum/errorMessage";
import responseMessage from "../../utils/enum/responseMessage";
import * as IS3Service from "./IS3Service";
import { IAppServiceProxy } from "../appServiceProxy";
import { IApiResponse, toError } from "../../utils/interface/common";
import { apiResponse } from "../../helper/apiResponses";
import { createSchema, getSchema, deleteSchema, getParsedFileSchema } from "../../utils/common/joiSchema/s3/s3Schema";
import { JoiError } from "../../helper/joiErrorHandler";
import { JoiValidate } from "../../helper/JoiValidate";
import { uploadToS3, checkS3FolderSize, deleteFromS3 } from "../../utils/s3/s3Utility";
import Pagination from '../../utils/enum/pagination'
import AWS from 'aws-sdk';

// Configure AWS SDK with your credentials
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

// Create an S3 instance
const s3 = new AWS.S3();

export default class S3Service implements IS3Service.IS3ServiceAPI {
  private s3Store = new S3Store();
  private proxy: IAppServiceProxy;

  constructor(proxy: IAppServiceProxy) {
    this.proxy = proxy;
  }

  /**
   * Uploads a file to S3 and stores metadata in the database.
   * 
   * @param req - The request object containing file and user data.
   * @param res - The response object used to send back the API response.
   * @returns A promise that resolves to an API response.
   */
  public uploadFile = async (req: IS3Service.IUploadRequest, res: unknown) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: ErrorMessageEnum.INTERNAL_ERROR,
      data: null,
      status: false
    };
    
    // Validate request body
    const { error, value } = JoiValidate(createSchema, req.body);
    if (error) {
      console.error(error);
      const paramsError = JoiError(error);
      response.statusCode = STATUS_CODES.UNPROCESSABLE_ENTITY;
      response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
      response.error = paramsError;
      return apiResponse(response);
    }

    // Check if file is present in the request
    if (!req.file) {
      response.statusCode = STATUS_CODES.BAD_REQUEST;
      response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
      return apiResponse(response);
    }

    try {
      // Check if there is enough space in S3
      const isMemoryAvailable = await checkS3FolderSize(req.user._id, req.file.size);
      if (!isMemoryAvailable) {
        response.statusCode = STATUS_CODES.BAD_REQUEST;
        response.message = ErrorMessageEnum.S3_SIZE_EXCEEDED;
        return apiResponse(response);
      }

      // Upload file to S3
      const fileUrl = await uploadToS3(req.file, `${req.user._id}/${req.body.document_type}`);

      // Prepare payload for database
      const payload = {
        document_type: value.document_type,
        user_id: req.user._id,
        filepath: fileUrl,
        filesize: req.file.size,
        upload_date: new Date().toISOString(),
        mimetype: req.file.mimetype
      };

      // Save file metadata to the database
      const result: s3Interface = await this.s3Store.uploadFile(payload);
      response.statusCode = STATUS_CODES.OK;
      response.message = responseMessage.FILE_UPLOADED;
      response.data = result;
      response.status = true;
      return apiResponse(response);
    } catch (e) {
      console.error(e);
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.error = toError(e.message);
      return apiResponse(response);
    }
  };

  /**
   * Retrieves files from the database based on the user and document type.
   * 
   * @param req - The request object containing user and document type information.
   * @param res - The response object used to send back the API response.
   * @returns A promise that resolves to an API response containing the retrieved files.
   */
  public getFiles = async (req: IS3Service.IGetFilesRequest, res: IApiResponse) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: ErrorMessageEnum.INTERNAL_ERROR,
      data: null,
      status: false
    };

    // Validate request body
    const { error, value } = JoiValidate(getSchema, req.query);
    if (error) {
      console.error(error);
      const paramsError = JoiError(error);
      response.statusCode = STATUS_CODES.UNPROCESSABLE_ENTITY;
      response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
      response.error = paramsError;
      return apiResponse(response);
    }

    try {
      // Prepare payload for database query
      const payload = {
        document_type: value.document_type,
        user_id: req.user._id,
        page: Number(value?.page) || Pagination.PAGE,
        limit: Number(value?.limit) || Pagination.LIMIT
      };

      // Retrieve files from the database
      const result= await this.s3Store.getFiles(payload);
      response.statusCode = STATUS_CODES.OK;
      response.message = responseMessage.FILE_FETCHED;
      response.data = result;
      response.status = true;
      return apiResponse(response);
    } catch (e) {
      console.error(e);
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.error = toError(e.message);
      return apiResponse(response);
    }
  };

  /**
   * Deletes a file from S3 and removes its metadata from the database.
   * 
   * @param req - The request object containing the document ID and user information.
   * @param res - The response object used to send back the API response.
   * @returns A promise that resolves to an API response confirming deletion.
   */
  public deleteFile = async (req: IS3Service.IDeleteFilesRequest, res: unknown) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: ErrorMessageEnum.INTERNAL_ERROR,
      data: null,
      status: false
    };

    // Validate request query parameters
    const { error, value } = JoiValidate(deleteSchema, req.query);
    if (error) {
      console.error(error);
      const paramsError = JoiError(error);
      response.statusCode = STATUS_CODES.UNPROCESSABLE_ENTITY;
      response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
      response.error = paramsError;
      return apiResponse(response);
    }

    try {
      // Prepare payload for database query
      const payload = { user_id: req.user._id, document_id: value.document_id };

      // Retrieve file details from the database
      const docDetail: s3Interface = await this.s3Store.getById(payload);

      // Delete file from S3
      const s3Delete = await deleteFromS3(docDetail.filepath);

      // Delete file metadata from the database
      const result: s3Interface = await this.s3Store.delete(payload);
      response.statusCode = STATUS_CODES.OK;
      response.message = responseMessage.FILE_DELETED;
      response.status = true;
      return apiResponse(response);
    } catch (e) {
      console.error(e);
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.error = toError(e.message);
      return apiResponse(response);
    }
  };

  /**
   * Retrieves a file from S3 and streams it to the client.
   * 
   * @param req - The request object containing the file path and user information.
   * @param res - The response object used to stream the file to the client.
   * @returns A promise that resolves to an API response or streams the file.
   */
  public getFileFromS3 = async (req: IS3Service.IGetFileFromS3Request, res: any) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: ErrorMessageEnum.INTERNAL_ERROR,
      data: null,
      status: false
    };

    // Validate request query parameters
    const { error, value } = JoiValidate(getParsedFileSchema, req.query);
    if (error) {
      console.error(error);
      const paramsError = JoiError(error);
      response.statusCode = STATUS_CODES.UNPROCESSABLE_ENTITY;
      response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
      response.error = paramsError;
      return apiResponse(response);
    }

    try {
      const { filepath } = req.query;
      const userId = req?.user?._id;

      // Check if filepath and user ID are present
      if (!filepath || !userId) {
        const errorMsg = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
        response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
        response.statusCode = STATUS_CODES.BAD_REQUEST;
        response.error = toError(errorMsg);
        return apiResponse(response);
      }

      // Check if the file belongs to the user
      if (!(filepath as string).startsWith(`${userId}/`)) {
        const errorMsg = ErrorMessageEnum.FILE_FORBIDDEN;
        response.message = ErrorMessageEnum.FILE_FORBIDDEN;
        response.statusCode = STATUS_CODES.FORBIDDEN;
        response.error = toError(errorMsg);
        return apiResponse(response);
      }

      try {
        // Prepare S3 parameters
        const params: any = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: filepath
        };

        // Stream file from S3 to client
        const s3Stream = s3.getObject(params).createReadStream();
        res.attachment(filepath);
        s3Stream.pipe(res);
      } catch (e) {
        console.error(e);
        response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        response.message = ErrorMessageEnum.INTERNAL_ERROR;
        response.error = toError(e.message);
        return apiResponse(response);
      }
    } catch (e) {
      console.error(e);
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.error = toError(e.message);
      return apiResponse(response);
    }
  };
}
