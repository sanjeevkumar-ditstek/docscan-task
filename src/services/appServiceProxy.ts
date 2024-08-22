import * as IUserService from './user/IUserService';
import UserService from './user/userService';

import * as IAuthService from './auth/IAuthService';
import AuthService from './auth/authService';

import * as IUploadService from './upload/IUploadService';
import UploadService from './upload/uploadService';

export interface IAppServiceProxy {
  auth: IAuthService.IAuthServiceAPI;
  user: IUserService.IUserServiceAPI;
  uploadService: IUploadService.IUploadServiceAPI;
}

class AppServiceProxy implements IAppServiceProxy {
  public user: IUserService.IUserServiceAPI;
  public auth: IAuthService.IAuthServiceAPI;
  public uploadService: UploadService;
  constructor() {
    this.user = new UserService(this);
    this.uploadService = new UploadService(this);
    this.auth = new AuthService(this);
  }
}

export default new AppServiceProxy();
