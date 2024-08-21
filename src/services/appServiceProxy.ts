import * as IUserService from "./user/IUserService";
import UserService from "./user/userService";

import * as IAuthService from "./auth/IAuthService";
import AuthService from "./auth/authService";

import * as IS3Service from "./s3/IS3Service";
import S3Service from "./s3/s3Service";

export interface IAppServiceProxy {
  auth: IAuthService.IAuthServiceAPI;
  user: IUserService.IUserServiceAPI;
  s3: IS3Service.IS3ServiceAPI;
}

class AppServiceProxy implements IAppServiceProxy {
  public user: IUserService.IUserServiceAPI;
  public s3: IS3Service.IS3ServiceAPI;
  public auth: IAuthService.IAuthServiceAPI;
  constructor() {
    this.user = new UserService(this);
    this.s3 = new S3Service(this);
    this.auth = new AuthService(this);
  }
}

export default new AppServiceProxy();
