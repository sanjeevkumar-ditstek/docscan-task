import IUSER from '../../utils/interface/user/IUser';
import { UserModel } from '../../models/users';
import Status from '../../utils/enum/status';
import LoginSource from '../../utils/enum/loginSource';

export default class UserStore {
  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  /**
   * creating new user and saving in Database
   */
  public async createUser(userInput: IUSER): Promise<IUSER> {
    try {
      const savedUser: any = await UserModel.create(userInput);
      return savedUser;
    } catch (error) {
      return error;
    }
  }

  /**
   *Get by email
   */
  public async getByEmail(email: string): Promise<IUSER> {
    try {
      const user: any = await UserModel.findOne(
        { email, status: { $ne: Status.DELETED } },
        { password: 1, firstname: 1, lastname: 1, email: 1 }
      );
      return user;
    } catch (e) {
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
  }

  /**
   *Get by sub
   */
  public async getBySocialToken(data): Promise<IUSER> {
    try {
      const query = {
        login_source: data.loginSource,
        status: { $ne: Status.DELETED }
      };
      if (data.loginSource == LoginSource.GOOGLE) {
        query.login_source = LoginSource.GOOGLE;
      } else {
        query.login_source = LoginSource.APPLE;
      }
      const user: any = await UserModel.findOne(query);
      return user;
    } catch (e) {
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
  }

  /**
   *Get by id
   */
  public async getById(id: string): Promise<IUSER> {
    try {
      const user: any = await UserModel.findOne({
        _id: id,
        status: { $ne: Status.DELETED }
      });
      return user;
    } catch (e) {
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
  }

  /**
   *Get all
   */
  public async getAll(): Promise<IUSER[]> {
    try {
      const users: any = await UserModel.find({
        status: { $ne: Status.DELETED }
      });
      return users;
    } catch (e) {
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
  }

  /**
   *Update
   */
  public async update(id: string, payload: IUSER): Promise<IUSER> {
    try {
      const user: IUSER = await UserModel.findOneAndUpdate(
        { _id: id },
        payload,
        {
          new: true
        }
      );
      return user;
    } catch (e) {
      return e;
    }
  }
  /**
   *Delete
   */
  public async delete(id: string): Promise<IUSER> {
    try {
      const user: any = await UserModel.findOneAndUpdate(
        { _id: id },
        { status: Status.DELETED },
        { new: true }
      );
      return user;
    } catch (e) {
      return e;
    }
  }
}
