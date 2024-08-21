import IUSER from "../../utils/interface/user/IUser";
import IUPDATEUSER from "../../utils/interface/user/IUpdateUser";
import { IResponse } from "../../utils/interface/common";
import { Request, Response } from "express";

export interface IUserServiceAPI {
    create(request: IRegisterUserRequest, response: IRegisterUserResponse): void;
    getUsers(request: IGetAllUserRequest, response: IGetAllUserResponse): void;
    getUserById(request: IGetUserRequest, response: IGetUserResponse): void;
    loginUser(request: ILoginUserRequest, response: ILoginUserResponse): void;
    getUserByToken(request: IGetProfileUserRequest, response: IGetProfileUserResponse): void;
    update(request: IUpdateUserRequest, response: IUpdateUserResponse): void;
    delete(request: IDeleteUserRequest, response: IDeleteUserResponse): void;

}

/********************************************************************************
 *  Create user
 ********************************************************************************/
export interface IRegisterUserRequest extends Request {
    body: {
        firstname: string;
        lastname: string;
        email: string;
        password: string;
    }
}

export interface IRegisterUserResponse extends IResponse {
    user?: IUSER;
}

/********************************************************************************
 * Login
 ********************************************************************************/
export interface ILoginUserRequest extends Request {
    body: {
        email?: string;
        password?: string;
        loginSource: string;
        socialToken?: string;
    }
}
export interface ILoginUserResponse extends IResponse {
    user?: IUSER;
}
/********************************************************************************
 * Get user profile (by token)
 ********************************************************************************/
export interface IGetProfileUserRequest extends Request {
    user: {
        id: string,
        role: string,
        email: string
    }
}
export interface IGetProfileUserResponse extends IResponse {
    user?: IUSER;
}

/********************************************************************************
 *  Get user
 ********************************************************************************/

export interface IGetUserRequest extends Request {
    params: {
        id: string;
    }
}
export interface IGetUserResponse extends IResponse {
    user?: IUSER;
}


/********************************************************************************
 *  Get all user
 ********************************************************************************/

export interface IGetAllUserRequest extends Request {

}
export interface IGetAllUserResponse extends IResponse {
    users?: IUSER[];
}


/********************************************************************************
 *  update user
 ********************************************************************************/


export interface IUpdateUserRequest extends Request {
    params: {
        id: string;
    },
    body: {
        firstname?: string;
        lastname?: string;
        email?: string;
        password?: string;
    }
}


export interface IUpdateUserResponse extends IResponse {
    user?: IUPDATEUSER;
}


/********************************************************************************
 *  Delete User
 ********************************************************************************/


export interface IDeleteUserRequest extends Request {
    params: {
        id: string
    }
}
export interface IDeleteUserResponse extends IResponse {
    user?: IUSER;
}
