import UserStore from './userStore';
import IUSER from '../../utils/interface/user/IUser';
import STATUS_CODES from '../../utils/enum/statusCodes';
import ErrorMessageEnum from '../../utils/enum/errorMessage';
import responseMessage from '../../utils/enum/responseMessage';
import * as IUserService from './IUserService';
import { IAppServiceProxy } from '../appServiceProxy';
import { IApiResponse, toError } from '../../utils/interface/common';
import { apiResponse } from '../../helper/apiResponses';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JoiError } from '../../helper/joiErrorHandler';
import {
  createSchema,
  getSchema,
  loginSchema,
  updateSchema
} from '../../utils/common/joiSchema/user/userSchema';
import dotenv from 'dotenv';
import { JoiValidate } from '../../helper/JoiValidate';
import LoginSource from '../../utils/enum/loginSource';
import { verifyGoogleToken } from '../../utils/socialLogin/google';
import { verifyAppleToken } from '../../utils/socialLogin/apple';
dotenv.config();

export default class UserService implements IUserService.IUserServiceAPI {
  private userStore = new UserStore();
  private proxy: IAppServiceProxy;
  constructor(proxy: IAppServiceProxy) {
    this.proxy = proxy;
  }
  private generateJWT = (user: IUSER): string => {
    const payLoad = {
      _id: user._id,
      email: user.email
    };
    return jwt.sign(payLoad, process.env.JWT_SECRET);
  };

  public create = async (
    req: IUserService.IRegisterUserRequest,
    res: IUserService.IRegisterUserResponse
  ) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: ErrorMessageEnum.INTERNAL_ERROR,
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
    const { firstname, lastname, email, password } = value;
    // Check if email is already registered
    let existingUser: IUSER;
    try {
      existingUser = await this.userStore.getByEmail(email);
      //Return error resposne  if email id is already exist
      if (existingUser && existingUser?.email) {
        response.statusCode = STATUS_CODES.BAD_REQUEST;
        response.message = ErrorMessageEnum.EMAIL_ALREADY_EXIST;
        response.data = null;
        response.status = false;
        response.error = toError(ErrorMessageEnum.EMAIL_ALREADY_EXIST);
        return apiResponse(response);
      }
      } catch (e) {
      console.error(e);
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.data = null;
      response.status = false;
      response.error = toError(e.message);
      return apiResponse(response);
    }

    //Hash the password and create new user
    let user: IUSER;
    try {
      const hashPassword = await bcrypt.hash(password, 10);
      const attributes: IUSER = {
        firstname,
        lastname,
        email: email.toLowerCase(),
        password: hashPassword
      };
      user = await this.userStore.createUser(attributes);
      response.statusCode = STATUS_CODES.OK;
      response.message = responseMessage.USER_CREATED;
      response.data = user;
      response.status = true;
      response.error = null;
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

  public getUsers = async (
    request: IUserService.IGetAllUserRequest,
    res: IUserService.IGetAllUserResponse
  ) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: ErrorMessageEnum.INTERNAL_ERROR,
      data: null,
      status: false
    };
    try {
      const users: IUSER[] = await this.userStore.getAll();
      const response: IApiResponse = {
        response: res,
        statusCode: STATUS_CODES.OK,
        message: responseMessage.USERS_FETCHED,
        data: users,
        status: true,
        error: null
      };
      return apiResponse(response);
    } catch (e) {
      console.log(e);
      const response: IApiResponse = {
        response: res,
        statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: ErrorMessageEnum.INTERNAL_ERROR,
        data: null,
        status: false,
        error: toError(e.message)
      };
      return apiResponse(response);
    }
  };

  public getUserById = async (
    request: IUserService.IGetUserRequest,
    res: IUserService.IGetUserResponse
  ) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.UNKNOWN_CODE,
      message: responseMessage.INVALID_EMAIL_OR_CODE,
      data: null,
      status: false
    };

    const { error, value } = JoiValidate(getSchema, { id: request.params.id });
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

    const { id } = value;
    let user: IUSER;
    try {
      user = await this.userStore.getById(id);
      //if user's id is incorrect
      if (!user) {
        response.statusCode = STATUS_CODES.BAD_REQUEST;
        response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
        response.data = null;
        response.status = false;
        response.error = toError(ErrorMessageEnum.INVALID_USER_ID);
        return apiResponse(response);
      }
    } catch (e) {
      console.error(e);
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.data = null;
      response.status = false;
      response.error = toError(e.message);
      return apiResponse(response);
    }
    response.statusCode = STATUS_CODES.OK;
    response.message = responseMessage.USER_FETCHED;
    response.data = user;
    response.status = true;
    response.error = null;
    return apiResponse(response);
  };

  /**
   * Login
   */
  public loginUser = async (
    req: IUserService.ILoginUserRequest,
    res: IUserService.ILoginUserResponse
  ) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: ErrorMessageEnum.INTERNAL_ERROR,
      data: null,
      status: false
    };
    let user: IUSER;
    const { error, value } = JoiValidate(loginSchema, req.body);
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
      if (value.loginSource === LoginSource.EMAIL) {
        const { email, password } = req.body;
        user = await this.userStore.getByEmail(email);
        if (!user) {
          response.statusCode = STATUS_CODES.BAD_REQUEST;
          response.message = ErrorMessageEnum.USER_NOT_EXIST;
          response.data = null;
          response.status = false;
          response.error = toError(ErrorMessageEnum.USER_NOT_EXIST);
          return apiResponse(response);
        }
        const isValid = await bcrypt.compare(password, user?.password);

        //if isValid or user.password is null
        if (!isValid || !user?.password) {
          const errorMsg = responseMessage.INVALID_CREDENTIALS;
          response.statusCode = STATUS_CODES.UNAUTHORIZED;
          response.error = toError(errorMsg);
          return response;
        }
        delete user['password'];

        const token: string = this.generateJWT(user);
        response.statusCode = STATUS_CODES.OK;
        response.message = responseMessage.USER_LOGIN;
        response.data = { user, token };
        response.status = true;
        response.error = null;
        return apiResponse(response);
      } else if (value.loginSource === LoginSource.GOOGLE) {
        const result = await verifyGoogleToken(value.socialToken);
        if (result.valid) {
          let user: IUSER = await this.userStore.getByEmail(
            result?.payload?.email
          );
          if (user) {
            const payload = {
              firstname: result?.payload?.given_name?.trim(),
              lastname: result?.payload?.family_name?.trim(),
              login_source: value.loginSource,
              google_token: result.payload.sub
            };
            user = await this.userStore.update(user._id, payload);
            const token: string = this.generateJWT(user);
            response.statusCode = STATUS_CODES.OK;
            response.message = responseMessage.USER_LOGIN;
            response.data = { user, token };
            response.status = true;
            response.error = null;
            return apiResponse(response);
          } else {
            const payload = {
              token: result?.payload?.sub,
              loginSource: value?.loginSource
            };
            const userBySocialToken: IUSER =
              await this.userStore.getBySocialToken(payload);
            if (userBySocialToken) {
              const payload = {
                email: result?.payload?.email,
                firstname: result?.payload?.given_name?.trim(),
                lastname: result?.payload?.family_name?.trim(),
                login_source: value.loginSource,
                google_token: result.payload.sub
              };
              const user: IUSER = await this.userStore.update(
                userBySocialToken._id,
                payload
              );
              const token: string = this.generateJWT(user);
              response.statusCode = STATUS_CODES.OK;
              response.message = responseMessage.USER_LOGIN;
              response.data = { user, token };
              response.status = true;
              response.error = null;
              return apiResponse(response);
            } else {
              // create new user and return token
              const payload = {
                email: result?.payload?.email,
                firstname: result?.payload?.given_name?.trim(),
                lastname: result?.payload?.family_name?.trim(),
                login_source: value.loginSource,
                google_token: result.payload.sub
              };
              const user: IUSER = await this.userStore.createUser(payload);
              const token: string = this.generateJWT(user);
              response.statusCode = STATUS_CODES.OK;
              response.message = responseMessage.USER_LOGIN;
              response.data = { user, token };
              response.status = true;
              response.error = null;
              return apiResponse(response);
            }
          }
        } else {
          const errorMsg = responseMessage.INVALID_CREDENTIALS;
          response.message = ErrorMessageEnum.UNAUTHORIZED;
          response.statusCode = STATUS_CODES.UNAUTHORIZED;
          response.error = toError(errorMsg);
          return apiResponse(response);
        }
      } else if (value.loginSource === LoginSource.APPLE) {
        const result = await verifyAppleToken(value.socialToken);
        if (result.valid) {
          let user: IUSER = await this.userStore.getByEmail(
            result?.payload?.email
          );
          if (user) {
            const payload = {
              login_source: value.loginSource,
              apple_token: result.payload.sub
            };
            user = await this.userStore.update(user._id, payload);
            const token: string = this.generateJWT(user);
            response.statusCode = STATUS_CODES.OK;
            response.message = responseMessage.USER_LOGIN;
            response.data = { user, token };
            response.status = true;
            response.error = null;
            return apiResponse(response);
          } else {
            const payload = {
              token: result?.payload?.sub,
              loginSource: value?.loginSource
            };
            const userBySocialToken: IUSER =
              await this.userStore.getBySocialToken(payload);
            if (userBySocialToken) {
              const payload = {
                email: result?.payload?.email,
                login_source: value.loginSource,
                apple_token: result.payload.sub
              };
              const user: IUSER = await this.userStore.update(
                userBySocialToken._id,
                payload
              );
              const token: string = this.generateJWT(user);
              response.statusCode = STATUS_CODES.OK;
              response.message = responseMessage.USER_LOGIN;
              response.data = { user, token };
              response.status = true;
              response.error = null;
              return apiResponse(response);
            } else {
              // create new user and return token
              const payload = {
                email: result?.payload?.email,
                login_source: value.loginSource,
                google_token: result.payload.sub
              };
              const user: IUSER = await this.userStore.createUser(payload);
              const token: string = this.generateJWT(user);
              response.statusCode = STATUS_CODES.OK;
              response.message = responseMessage.USER_LOGIN;
              response.data = { user, token };
              response.status = true;
              response.error = null;
              return apiResponse(response);
            }
          }
        } else {
          const errorMsg = responseMessage.INVALID_CREDENTIALS;
          response.message = ErrorMessageEnum.UNAUTHORIZED;
          response.statusCode = STATUS_CODES.UNAUTHORIZED;
          response.error = toError(errorMsg);
          return apiResponse(response);
        }
      }
    } catch (e) {
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.data = null;
      response.status = false;
      response.error = toError(e.message);
      return apiResponse(response);
    }
  };
  /**
   * Get user by token
   */
  public getUserByToken = async (
    req: IUserService.IGetProfileUserRequest,
    res: IUserService.IGetProfileUserResponse
  ) => {
    const { id } = req.user;
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.UNKNOWN_CODE,
      message: responseMessage.INVALID_EMAIL_OR_CODE,
      data: null,
      status: false
    };
    let user: IUSER;
    try {
      user = await this.userStore.getById(id);
      //if user's id is incorrect
      if (!user) {
        response.statusCode = STATUS_CODES.BAD_REQUEST;
        response.message = ErrorMessageEnum.REQUEST_PARAMS_ERROR;
        response.data = null;
        response.status = false;
        response.error = toError(ErrorMessageEnum.INVALID_USER_ID);
        return apiResponse(response);
      }
    } catch (e) {
      console.error(e);
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.data = null;
      response.status = false;
      response.error = toError(e.message);
      return apiResponse(response);
    }

    response.statusCode = STATUS_CODES.OK;
    response.message = responseMessage.USER_FETCHED;
    response.data = { user };
    response.status = true;
    response.error = null;
    return apiResponse(response);
  };
  /**
   * Update
   */
  public update = async (
    req: IUserService.IUpdateUserRequest,
    res: IUserService.IUpdateUserResponse
  ) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: ErrorMessageEnum.INTERNAL_ERROR,
      data: null,
      status: false
    };
    const { id } = req.params;
    const { error, value } = JoiValidate(getSchema, { id: req.params.id });
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
    let user: IUSER;

    try {
      user = await this.userStore.getById(id);
      if (!user) {
        response.statusCode = STATUS_CODES.BAD_REQUEST;
        response.message = responseMessage.RECORD_NOT_FOUND;
        response.data = null;
        response.status = false;
        response.error = toError(ErrorMessageEnum.INVALID_USER_ID);
        return apiResponse(response);
      }
    } catch (e) {
      console.error(e);
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.data = null;
      response.status = false;
      response.error = toError(e.message);
      return apiResponse(response);
    }
    try {
      const { error, value } = JoiValidate(updateSchema, req.body);
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
      if (value.password && value.password !== '') {
        const hashPassword = await bcrypt.hash(value?.password, 10);
        value.password = hashPassword;
      }
      const updateUser: IUSER = await this.userStore.update(id, value);
      response.statusCode = STATUS_CODES.OK;
      response.message = responseMessage.USER_UPDATED;
      response.data = updateUser;
      response.status = true;
      response.error = null;
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
  /**
   * Delete
   */
  public delete = async (
    request: IUserService.IDeleteUserRequest,
    res: IUserService.IDeleteUserResponse
  ) => {
    const response: IApiResponse = {
      response: res,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: ErrorMessageEnum.INTERNAL_ERROR,
      data: null,
      status: false
    };

    const { error, value } = JoiValidate(getSchema, { id: request.params.id });
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
    let user: IUSER;
    try {
      user = await this.userStore.getById(value.id);
      if (!user) {
        response.statusCode = STATUS_CODES.BAD_REQUEST;
        response.error = toError(ErrorMessageEnum.INVALID_USER_ID);
        response.message = responseMessage.RECORD_NOT_FOUND;
        response.data = null;
        response.status = false;
        return apiResponse(response);
      }
      await this.userStore.delete(request.params.id);
      response.statusCode = STATUS_CODES.OK;
      response.error = {};
      response.message = responseMessage.USER_DELETED;
      response.data = user;
      response.status = true;
      return apiResponse(response);
    } catch (e) {
      console.error(e);
      response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
      response.error = toError(e.message);
      response.statusCode = STATUS_CODES.OK;
      response.error = {};
      response.message = ErrorMessageEnum.INTERNAL_ERROR;
      response.data = null;
      response.status = false;
      return apiResponse(response);
    }
  };
}
