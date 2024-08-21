
import STATUS_CODES from "../../utils/enum/statusCodes";
import ErrorMessageEnum from "../../utils/enum/errorMessage";
import responseMessage from "../../utils/enum/responseMessage";
import * as IAuthService from "./IAuthService";
import { IAppServiceProxy } from "../appServiceProxy";
import { IApiResponse, toError } from "../../utils/interface/common";
import { apiResponse } from "../../helper/apiResponses";
import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

export default class AuthService implements IAuthService.IAuthServiceAPI {
    // private roleStore = new RoleStore();
    private proxy: IAppServiceProxy;

    constructor(proxy: IAppServiceProxy) {
        this.proxy = proxy;
    }

    public authenticate = async (req: IAuthService.IAuthRequest,
        res: Response, next: NextFunction) => {
        const response: IApiResponse = {
            response: res,
            statusCode: STATUS_CODES.UNKNOWN_CODE,
            message: responseMessage.INVALID_EMAIL_OR_CODE,
            data: null,
            status: false
        };
        let token = req.headers.authorization;
        if (!token) {
            response.statusCode = STATUS_CODES.BAD_REQUEST,
                response.message = ErrorMessageEnum.MISSING_TOKEN
            return apiResponse(response)
        }
        jwt.verify(token, process.env.JWT_SECRET, (error, data: IAuthService.IAuthJWTData) => {
            if (error) {
                console.error(error);
                response.statusCode = STATUS_CODES.UNAUTHORIZED
                response.message = ErrorMessageEnum.UNAUTHORIZED
                response.data = null
                response.status = false
                response.error = toError(error.message)
                return apiResponse(response)
            } else if (data) {
                let { _id, email, role } = data;
                req.user = { _id, email, role };
            }
            return next();
        });
    };
}
