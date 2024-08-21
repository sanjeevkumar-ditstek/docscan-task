import S3Store from './s3Store';
import { s3Interface } from '../../utils/interface/s3/IS3';
import STATUS_CODES from '../../utils/enum/statusCodes';
import ErrorMessageEnum from '../../utils/enum/errorMessage';
import responseMessage from '../../utils/enum/responseMessage';
import * as IS3Service from './IS3Service';
import { IAppServiceProxy } from '../appServiceProxy';
import { IApiResponse, toError } from '../../utils/interface/common';
import { apiResponse } from '../../helper/apiResponses';
import {
  createSchema,
  getSchema,
  deleteSchema,
  getParsedFileSchema
} from '../../utils/common/joiSchema/s3/s3Schema';
import { JoiError } from '../../helper/joiErrorHandler';
import { JoiValidate } from '../../helper/JoiValidate';
import {
  uploadToS3,
  checkS3FolderSize,
  generatePresignedUrl,
  deleteFromS3,
  getParsedFile
} from '../../utils/s3/s3Utility';

export default class S3Service implements IS3Service.IS3ServiceAPI {
  private s3Store = new S3Store();
  private proxy: IAppServiceProxy;

  constructor(proxy: IAppServiceProxy) {
    this.proxy = proxy;
  }

  public uploadFile = async (req: IS3Service.IUploadRequest, res: unknown) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.UNKNOWN_CODE,
      message: responseMessage.INVALID_EMAIL_OR_CODE,
      data: null,
      status: false
    };
    const { error, value } = JoiValidate(createSchema, req.body);
    if (error) {
      console.error(error);
      const paramsError = JoiError(error);
      response.statusCode = STATUS_CODES.UNPROCESSABLE_ENTITY;
      response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
      response.data = null;
      response.status = false;
      response.error = paramsError;
      return apiResponse(response);
    }
    if (!req.file) {
      response.statusCode = STATUS_CODES.BAD_REQUEST;
      response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
      response.data = null;
      response.status = false;
      return apiResponse(response);
    }
    try {
      //Uplaod file in s3
      const isMemoryAvailable = await checkS3FolderSize(
        req.user._id,
        req.file.size
      );
      if (!isMemoryAvailable) {
        response.statusCode = STATUS_CODES.BAD_REQUEST;
        response.message = ErrorMessageEnum.S3_SIZE_EXCEEDED;
        response.data = null;
        response.status = false;
        return apiResponse(response);
      }
      const fileUrl = await uploadToS3(
        req.file,
        `${req.user._id}/${req.body.document_type}`
      );
      const payload = {
        document_type: value.document_type,
        user_id: req.user._id,
        filepath: fileUrl,
        filesize: req.file.size,
        upload_date: new Date().toISOString(),
        mimetype: req.file.mimetype
      };
      const result: s3Interface = await this.s3Store.uploadFile(payload);
      response.statusCode = STATUS_CODES.OK;
      response.message = responseMessage.FILE_UPLOADED;
      response.data = result;
      response.status = true;
      response.error = {};
      return apiResponse(response);
    } catch (e) {
      console.error(e);
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.data = null;
      response.status = false;
      response.error = toError(e.message);
      return apiResponse(response);
    }
  };
  public getFiles = async (req: IS3Service.IGetFilesRequest, res: unknown) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: ErrorMessageEnum.INTERNAL_ERROR,
      data: null,
      status: false
    };
    const { error, value } = JoiValidate(getSchema, req.body);
    if (error) {
      console.error(error);
      const paramsError = JoiError(error);
      response.statusCode = STATUS_CODES.UNPROCESSABLE_ENTITY;
      response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
      response.data = null;
      response.status = false;
      response.error = paramsError;
      return apiResponse(response);
    }
    try {
      const payload = {
        document_type: value.document_type,
        user_id: req.user._id
      };
      const result: s3Interface[] = await this.s3Store.getFiles(payload);
      const filename = result[0].filepath;

      // Get presigned url of images
      for (let index = 0; index < result.length; index++) {
        const element = result[index];
        const presignedUrl = await generatePresignedUrl(element?.filepath);
        element.filepath = presignedUrl;
      }

      response.statusCode = STATUS_CODES.OK;
      response.message = responseMessage.FILE_FETCHED;
      response.data = result;
      response.status = true;
      response.error = {};
      return apiResponse(response);
    } catch (e) {
      console.error(e);
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.data = null;
      response.status = false;
      response.error = toError(e.message);
      return apiResponse(response);
    }
  };
  public deleteFile = async (
    req: IS3Service.IDeleteFilesRequest,
    res: unknown
  ) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.UNKNOWN_CODE,
      message: responseMessage.INVALID_EMAIL_OR_CODE,
      data: null,
      status: false
    };
    const { error, value } = JoiValidate(deleteSchema, req.query);
    if (error) {
      console.error(error);
      const paramsError = JoiError(error);
      response.statusCode = STATUS_CODES.UNPROCESSABLE_ENTITY;
      response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
      response.data = null;
      response.status = false;
      response.error = paramsError;
      return apiResponse(response);
    }
    try {
      const payload = { user_id: req.user._id, document_id: value.document_id };
      const docDetail: s3Interface = await this.s3Store.getById(payload);

      const s3Delete = await deleteFromS3(docDetail.filepath);

      const result: s3Interface = await this.s3Store.delete(payload);

      response.statusCode = STATUS_CODES.OK;
      response.message = responseMessage.FILE_DELETED;
      response.status = true;
      response.error = {};
      return apiResponse(response);
    } catch (e) {
      console.error(e);
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.data = null;
      response.status = false;
      response.error = toError(e.message);
      return apiResponse(response);
    }
  };
  public getFileFromS3 = async (req: IS3Service.IGetFileFromS3Request, res) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: ErrorMessageEnum.INTERNAL_ERROR,
      data: null,
      status: false
    };
    const { error, value } = JoiValidate(getParsedFileSchema, req.query);
    if (error) {
      console.error(error);
      const paramsError = JoiError(error);
      response.statusCode = STATUS_CODES.UNPROCESSABLE_ENTITY;
      response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
      response.data = null;
      response.status = false;
      response.error = paramsError;
      return apiResponse(response);
    }
    try {
      const { filepath } = req.query;
      const userId = req?.user?._id;

      if (!filepath || !userId) {
        const errorMsg = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
        response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
        response.statusCode = STATUS_CODES.BAD_REQUEST;
        response.error = toError(errorMsg);
        return apiResponse(response);
      }

      if (!(filepath as string).startsWith(`${userId}/`)) {
        const errorMsg = ErrorMessageEnum.FILE_FORBIDDEN;
        response.message = ErrorMessageEnum.FILE_FORBIDDEN;
        response.statusCode = STATUS_CODES.FORBIDDEN;
        response.error = toError(errorMsg);
        return apiResponse(response);
      }

      try {
        const s3Stream = await getParsedFile(filepath as string);
        res.attachment(filepath);
        s3Stream.pipe(res);
      } catch (e) {
        console.error(e);
        response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        response.message = ErrorMessageEnum.INTERNAL_ERROR;
        response.data = null;
        response.status = false;
        response.error = toError(e.message);
        return apiResponse(response);
      }

      const payload = {
        document_type: value.document_type,
        user_id: req.user._id
      };
      const result: s3Interface[] = await this.s3Store.getFiles(payload);
      const filename = result[0].filepath;

      // Get presigned url of images
      for (let index = 0; index < result.length; index++) {
        const element = result[index];
        const presignedUrl = await generatePresignedUrl(element?.filepath);
        element.filepath = presignedUrl;
      }

      response.statusCode = STATUS_CODES.OK;
      response.message = responseMessage.FILE_FETCHED;
      response.data = result;
      response.status = true;
      response.error = {};
      return apiResponse(response);
    } catch (e) {
      console.error(e);
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.data = null;
      response.status = false;
      response.error = toError(e.message);
      return apiResponse(response);
    }
  };
}
