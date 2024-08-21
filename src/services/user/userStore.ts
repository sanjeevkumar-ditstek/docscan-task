import IUSER from '../../utils/interface/user/IUser';
import { UserModel } from '../../models/users';
import Status from '../../utils/enum/status';
import LoginSource from '../../utils/enum/loginSource';

export default class UserStore {
  // Custom error class for handling operation failures
  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occurred while processing the request.');
    }
  };

  /**
   * Creates a new user and saves it in the database.
   * 
   * @param userInput - The user data to be saved, including fields like email, password, etc.
   * @returns The saved user data, excluding the password, or an error if the operation fails.
   */
  public async createUser(userInput: IUSER): Promise<IUSER> {
    try {
      const savedUser: any = await UserModel.create(userInput);
      delete savedUser?._doc?.password; // Remove password from the response
      return savedUser;
    } catch (error) {
      return error;
    }
  }

  /**
   * Retrieves a user by their email.
   * 
   * @param email - The email of the user to be retrieved.
   * @returns The user data, including the password, or an error if the operation fails.
   */
  public async getByEmail(email: string): Promise<IUSER> {
    try {
      const user: any = await UserModel.findOne(
        { email, status: { $ne: Status.DELETED } },
        { password: 1, firstname: 1, lastname: 1, email: 1 }
      ).lean(); // Fetch the user with specified fields
      return user;
    } catch (e) {
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
  }

  /**
   * Retrieves a user by their social login token.
   * 
   * @param data - The data containing the social login source and other identifiers.
   * @returns The user data or an error if the operation fails.
   */
  public async getBySocialToken(data): Promise<IUSER> {
    try {
      const query = {
        login_source: data.loginSource,
        status: { $ne: Status.DELETED }
      };

      // Adjust the query based on the login source
      if (data.loginSource === LoginSource.GOOGLE) {
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
   * Retrieves a user by their ID.
   * 
   * @param id - The ID of the user to be retrieved.
   * @returns The user data or an error if the operation fails.
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
   * Retrieves all users, excluding those marked as deleted.
   * 
   * @returns An array of user data or an error if the operation fails.
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
   * Updates a user by their ID with the provided payload.
   * 
   * @param id - The ID of the user to be updated.
   * @param payload - The data to update the user with.
   * @returns The updated user data or an error if the operation fails.
   */
  public async update(id: string, payload: IUSER): Promise<IUSER> {
    try {
      const user: IUSER = await UserModel.findOneAndUpdate(
        { _id: id },
        payload,
        { new: true } // Return the updated document
      );
      return user;
    } catch (e) {
      return e;
    }
  }

  /**
   * Marks a user as deleted by updating their status.
   * 
   * @param id - The ID of the user to be deleted.
   * @returns The updated user data with the deleted status or an error if the operation fails.
   */
  public async delete(id: string): Promise<IUSER> {
    try {
      const user: any = await UserModel.findOneAndUpdate(
        { _id: id },
        { status: Status.DELETED },
        { new: true } // Return the updated document
      );
      return user;
    } catch (e) {
      return e;
    }
  }
}
